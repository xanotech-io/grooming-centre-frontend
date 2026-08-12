import { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/react";
import {
  adminGetExamPaperConfigPresets,
  adminGetExamPaperConfigPresetById,
  adminCreateExamPaperConfigPreset,
} from "../../../services";
import { hydratePaperConfig } from "./PresetFieldsEditor";

// Backs the "Load Preset" dropdown and "Save Configuration as Preset" modal
// on the Template/Marking Scheme step of every exam-creation flow
// (TemplateStandalone.jsx, TemplatePage.jsx). Follows the same
// own-toast/own-loading-state shape as useAddAssessmentToBank.js and its
// siblings in examQuestionBank/.
export const usePaperConfigPresets = () => {
  const toast = useToast();
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const fetchPresets = useCallback(async () => {
    setPresetsLoading(true);
    try {
      const { presets: list } = await adminGetExamPaperConfigPresets({ limit: 100 });
      setPresets(list);
    } catch {
      setPresets([]);
    } finally {
      setPresetsLoading(false);
    }
  }, []);

  // Returns { preset, paperConfig } — paperConfig is already hydrated
  // (defaults merged in) so the caller can drop it straight into its own
  // paperConfig state.
  const loadPreset = useCallback(
    async (presetId) => {
      if (!presetId || isLoadingPreset) return null;
      setIsLoadingPreset(true);
      try {
        const { preset } = await adminGetExamPaperConfigPresetById(presetId);
        toast({ title: `Loaded preset "${preset.name}"`, status: "success", duration: 2000, isClosable: true });
        return { preset, paperConfig: hydratePaperConfig(preset) };
      } catch (err) {
        toast({
          title: err?.response?.data?.message || "Failed to load preset",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return null;
      } finally {
        setIsLoadingPreset(false);
      }
    },
    [toast, isLoadingPreset],
  );

  const saveAsPreset = useCallback(
    async (payload) => {
      if (isSavingPreset) return null;
      setIsSavingPreset(true);
      try {
        const { preset } = await adminCreateExamPaperConfigPreset(payload);
        toast({ title: "Saved as preset", status: "success", duration: 3000, isClosable: true });
        return preset;
      } catch (err) {
        toast({
          title: err?.response?.data?.message || "Failed to save preset",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return null;
      } finally {
        setIsSavingPreset(false);
      }
    },
    [toast, isSavingPreset],
  );

  return {
    presets,
    presetsLoading,
    fetchPresets,
    loadPreset,
    isLoadingPreset,
    saveAsPreset,
    isSavingPreset,
  };
};

export default usePaperConfigPresets;
