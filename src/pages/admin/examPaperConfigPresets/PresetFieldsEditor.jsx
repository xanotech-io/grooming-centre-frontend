import React from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  Switch,
  Select as ChakraSelect,
  Input as ChakraInput,
  NumberInput,
  NumberInputField,
  IconButton,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "../../../components";
import {
  EMPTY_SECTION,
  QUESTION_TYPE_LOCK_OPTIONS,
  MARKING_TYPE_LOCK_OPTIONS,
} from "../examSectionBuilder/examTypeConfig";

// The navigationMode/uiSettings/toolsEnabled/accessibilitySettings/
// submissionSettings/randomizationMethod/randomizationConfig slice, shared
// between a preset's own form and the "Template / Marking Scheme" step of
// each exam-creation flow (TemplateStandalone.jsx / TemplatePage.jsx) so
// both can hydrate from and save into the same preset shape.
export const PAPER_CONFIG_DEFAULTS = {
  navigationMode: "free",
  uiSettings: {
    theme: "default",
    font_size: 16,
    font_family: "default",
    progress_indicator: true,
  },
  toolsEnabled: { calculator: "none", spellchecker: false, scratchpad: false },
  accessibilitySettings: {
    // A scaling multiplier (0.5 - 3.0), not a toggle — 1 means "no scaling".
    font_scaling: 1,
    dyslexia_font: false,
    high_contrast: false,
    screen_reader: false,
  },
  submissionSettings: { confirmation_dialog: true, auto_submit: false },
  randomizationMethod: "none",
  randomizationConfig: { shufflePerAttempt: false },
};

export const hydratePaperConfig = (raw) => ({
  navigationMode: raw?.navigationMode || PAPER_CONFIG_DEFAULTS.navigationMode,
  uiSettings: { ...PAPER_CONFIG_DEFAULTS.uiSettings, ...(raw?.uiSettings || {}) },
  toolsEnabled: { ...PAPER_CONFIG_DEFAULTS.toolsEnabled, ...(raw?.toolsEnabled || {}) },
  accessibilitySettings: { ...PAPER_CONFIG_DEFAULTS.accessibilitySettings, ...(raw?.accessibilitySettings || {}) },
  submissionSettings: { ...PAPER_CONFIG_DEFAULTS.submissionSettings, ...(raw?.submissionSettings || {}) },
  randomizationMethod: raw?.randomizationMethod || "none",
  randomizationConfig: { ...PAPER_CONFIG_DEFAULTS.randomizationConfig, ...(raw?.randomizationConfig || {}) },
});

export const DEFAULT_PRESET_CONFIG = {
  name: "",
  markingTemplateId: "",
  ...PAPER_CONFIG_DEFAULTS,
  sections: [],
};

// Backend constraints (must match server-side validation):
// - uiSettings.font_size: 10-32
// - accessibilitySettings.font_scaling: 0.5-3.0
// - sections: at most 10 items; when any are present each needs a
//   name/section_name, a question count, and either total_marks/weightage
//   or marksPerQuestion. Zero sections is valid (unsectioned presets).
export const validatePresetSections = (sections = []) => {
  if (sections.length > 10) return "A preset can have at most 10 sections";
  const invalid = sections.some((s) => {
    const name = s.section_name || s.name;
    const hasMarks = s.total_marks != null || s.marksPerQuestion != null || s.weightage != null;
    return !name?.trim() || !s.questions_count || !hasMarks;
  });
  if (invalid) return "Each section needs a name, a question count, and marks/weightage";
  return null;
};

const ToggleRow = ({ label, description, value, onChange, isDisabled }) => (
  <Flex justifyContent="space-between" alignItems="center" py="10px" borderBottom="1px solid #F7FAFC">
    <Box>
      <Text fontSize="13px" fontWeight="500" color="#1A202C">{label}</Text>
      {description && <Text fontSize="12px" color="gray.400">{description}</Text>}
    </Box>
    <Switch isChecked={value} onChange={(e) => onChange(e.target.checked)} colorScheme="purple" isDisabled={isDisabled} />
  </Flex>
);

const FieldGroup = ({ title, children }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" mb="16px">
    <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="14px">
      {title}
    </Text>
    {children}
  </Box>
);

// Structural fields shared by preset create + edit. `disabled` locks every
// field except name (used when usageCount > 0 — see backend PATCH constraint).
export const buildPresetPayload = (form) => ({
  name: form.name.trim(),
  ...(form.markingTemplateId ? { markingTemplateId: form.markingTemplateId } : {}),
  navigationMode: form.navigationMode,
  uiSettings: form.uiSettings,
  toolsEnabled: form.toolsEnabled,
  accessibilitySettings: form.accessibilitySettings,
  submissionSettings: form.submissionSettings,
  randomizationMethod: form.randomizationMethod,
  randomizationConfig: form.randomizationConfig,
  sections: (form.sections || []).map((s) => ({
    section_name: s.section_name,
    questions_count: Number(s.questions_count) || 0,
    question_type: s.question_type || "",
    marking_type: s.marking_type || "",
    total_marks: s.total_marks ? Number(s.total_marks) : null,
  })),
});

export const hydratePresetForm = (preset) => ({
  name: preset?.name || "",
  markingTemplateId: preset?.markingTemplateId || "",
  ...hydratePaperConfig(preset),
  sections: preset?.sections?.length ? preset.sections : [],
});

// The Navigation/UI Settings/Tools/Accessibility/Submission Settings/
// Randomization field groups — shared by PresetFieldsEditor and by the
// "Load Preset"-aware Template/Marking Scheme step of each exam-creation
// flow. `values` must be the PAPER_CONFIG_DEFAULTS shape; `setValues` is a
// plain useState setter (functional-update form) over an object holding
// that shape (either the whole preset form, or a dedicated paperConfig
// slice of a host page's own state).
export const PaperConfigFieldsEditor = ({ values, setValues, disabled }) => {
  const set = (path, value) => {
    setValues((prev) => {
      const next = { ...prev };
      if (path.length === 1) {
        next[path[0]] = value;
      } else {
        next[path[0]] = { ...prev[path[0]], [path[1]]: value };
      }
      return next;
    });
  };

  return (
    <Box>
      <FieldGroup title="Navigation">
        <RadioGroup value={values.navigationMode} onChange={(v) => set(["navigationMode"], v)} isDisabled={disabled}>
          <Flex direction="column" gap="6px">
            {[
              { value: "free", label: "Free" },
              { value: "forward-only", label: "Forward Only" },
              { value: "section-locked", label: "Section Locked" },
            ].map((opt) => (
              <Radio key={opt.value} value={opt.value} colorScheme="purple">
                <Text fontSize="13px">{opt.label}</Text>
              </Radio>
            ))}
          </Flex>
        </RadioGroup>
      </FieldGroup>

      <FieldGroup title="UI Settings">
        <Flex gap="12px" flexWrap="wrap" mb="12px">
          <Box flex="1" minW="140px">
            <Text fontSize="12px" color="gray.500" mb="4px">Theme</Text>
            <ChakraSelect size="sm" borderRadius="6px" value={values.uiSettings.theme} onChange={(e) => set(["uiSettings", "theme"], e.target.value)} isDisabled={disabled}>
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="high-contrast">High Contrast</option>
            </ChakraSelect>
          </Box>
          <Box flex="1" minW="140px">
            <Text fontSize="12px" color="gray.500" mb="4px">Font Family</Text>
            <ChakraSelect size="sm" borderRadius="6px" value={values.uiSettings.font_family} onChange={(e) => set(["uiSettings", "font_family"], e.target.value)} isDisabled={disabled}>
              <option value="default">Default</option>
              <option value="dyslexia">Dyslexia</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-Serif</option>
            </ChakraSelect>
          </Box>
          <Box flex="0 0 100px">
            <Text fontSize="12px" color="gray.500" mb="4px">Font Size</Text>
            <NumberInput size="sm" min={10} max={32} value={values.uiSettings.font_size} onChange={(v) => set(["uiSettings", "font_size"], Number(v) || 16)} isDisabled={disabled}>
              <NumberInputField borderRadius="6px" />
            </NumberInput>
          </Box>
        </Flex>
        <ToggleRow label="Show Progress Bar" value={values.uiSettings.progress_indicator} onChange={(v) => set(["uiSettings", "progress_indicator"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Tools">
        <Box mb="12px">
          <Text fontSize="12px" color="gray.500" mb="4px">Calculator</Text>
          <ChakraSelect size="sm" borderRadius="6px" maxW="200px" value={values.toolsEnabled.calculator} onChange={(e) => set(["toolsEnabled", "calculator"], e.target.value)} isDisabled={disabled}>
            <option value="none">None</option>
            <option value="basic">Basic</option>
            <option value="scientific">Scientific</option>
          </ChakraSelect>
        </Box>
        <ToggleRow label="Spellchecker" value={values.toolsEnabled.spellchecker} onChange={(v) => set(["toolsEnabled", "spellchecker"], v)} isDisabled={disabled} />
        <ToggleRow label="Scratchpad" value={values.toolsEnabled.scratchpad} onChange={(v) => set(["toolsEnabled", "scratchpad"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Accessibility">
        <Box mb="12px" maxW="220px">
          <Text fontSize="12px" color="gray.500" mb="4px">Font Scaling (0.5 – 3.0×)</Text>
          <NumberInput
            size="sm" min={0.5} max={3.0} step={0.1} precision={1}
            value={values.accessibilitySettings.font_scaling}
            onChange={(v) => set(["accessibilitySettings", "font_scaling"], Number(v) || 1)}
            isDisabled={disabled}
          >
            <NumberInputField borderRadius="6px" />
          </NumberInput>
        </Box>
        <ToggleRow label="Dyslexia Font" value={values.accessibilitySettings.dyslexia_font} onChange={(v) => set(["accessibilitySettings", "dyslexia_font"], v)} isDisabled={disabled} />
        <ToggleRow label="High Contrast" value={values.accessibilitySettings.high_contrast} onChange={(v) => set(["accessibilitySettings", "high_contrast"], v)} isDisabled={disabled} />
        <ToggleRow label="Screen Reader Optimisation" value={values.accessibilitySettings.screen_reader} onChange={(v) => set(["accessibilitySettings", "screen_reader"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Submission Settings">
        <ToggleRow label="Confirmation Dialog" value={values.submissionSettings.confirmation_dialog} onChange={(v) => set(["submissionSettings", "confirmation_dialog"], v)} isDisabled={disabled} />
        <ToggleRow label="Auto-Submit on Expiry" value={values.submissionSettings.auto_submit} onChange={(v) => set(["submissionSettings", "auto_submit"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Randomization">
        <Box mb="12px">
          <Text fontSize="12px" color="gray.500" mb="4px">Method</Text>
          <ChakraSelect size="sm" borderRadius="6px" maxW="220px" value={values.randomizationMethod} onChange={(e) => set(["randomizationMethod"], e.target.value)} isDisabled={disabled}>
            <option value="none">None</option>
            <option value="questions">Shuffle Questions</option>
            <option value="options">Shuffle Options</option>
            <option value="both">Shuffle Both</option>
          </ChakraSelect>
        </Box>
        <ToggleRow
          label="Reshuffle Per Attempt"
          description="Generate a new random order on every retry attempt"
          value={values.randomizationConfig.shufflePerAttempt}
          onChange={(v) => set(["randomizationConfig", "shufflePerAttempt"], v)}
          isDisabled={disabled || values.randomizationMethod === "none"}
        />
      </FieldGroup>
    </Box>
  );
};

export const PresetFieldsEditor = ({ form, setForm, markingTemplates, markingTemplatesLoading, disabled }) => {
  const set = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.length === 1) {
        next[path[0]] = value;
      } else {
        next[path[0]] = { ...prev[path[0]], [path[1]]: value };
      }
      return next;
    });
  };

  const sections = form.sections || [];

  const addSection = () => set(["sections"], [...sections, { ...EMPTY_SECTION }]);
  const updateSection = (idx, field, value) =>
    set(["sections"], sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  const removeSection = (idx) => set(["sections"], sections.filter((_, i) => i !== idx));

  return (
    <Box>
      <FieldGroup title="Basic Information">
        <Box mb="14px">
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Name *</Text>
          <ChakraInput
            size="sm"
            borderRadius="6px"
            placeholder="e.g. Standard 60-Minute MCQ Paper"
            value={form.name}
            onChange={(e) => set(["name"], e.target.value)}
          />
        </Box>
        <Box>
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Marking Template</Text>
          {markingTemplatesLoading ? (
            <Text fontSize="13px" color="gray.400">Loading templates…</Text>
          ) : (
            <ChakraSelect
              size="sm"
              borderRadius="6px"
              placeholder="None"
              value={form.markingTemplateId}
              onChange={(e) => set(["markingTemplateId"], e.target.value)}
              isDisabled={disabled}
            >
              {markingTemplates.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>{t.templateName || t.name}</option>
              ))}
            </ChakraSelect>
          )}
        </Box>
      </FieldGroup>

      <FieldGroup title="Sections">
        {sections.map((s, i) => (
          <Grid key={i} templateColumns="1.5fr 1fr 1fr 1fr 1fr auto" gap="8px" mb="8px" alignItems="center">
            <ChakraInput
              size="sm" borderRadius="6px" placeholder="Section name"
              value={s.section_name}
              onChange={(e) => updateSection(i, "section_name", e.target.value)}
              isDisabled={disabled}
            />
            <ChakraInput
              size="sm" borderRadius="6px" type="number" placeholder="# Questions"
              value={s.questions_count ?? ""}
              onChange={(e) => updateSection(i, "questions_count", e.target.value)}
              isDisabled={disabled}
            />
            <ChakraSelect
              size="sm" borderRadius="6px"
              value={s.question_type}
              onChange={(e) => updateSection(i, "question_type", e.target.value)}
              isDisabled={disabled}
            >
              {QUESTION_TYPE_LOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </ChakraSelect>
            <ChakraSelect
              size="sm" borderRadius="6px"
              value={s.marking_type}
              onChange={(e) => updateSection(i, "marking_type", e.target.value)}
              isDisabled={disabled}
            >
              {MARKING_TYPE_LOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </ChakraSelect>
            <ChakraInput
              size="sm" borderRadius="6px" type="number" placeholder="Marks"
              value={s.total_marks ?? ""}
              onChange={(e) => updateSection(i, "total_marks", e.target.value)}
              isDisabled={disabled}
            />
            <IconButton
              aria-label="Remove section" icon={<FaTrash />} size="xs" variant="ghost" colorScheme="red"
              onClick={() => removeSection(i)} isDisabled={disabled}
            />
          </Grid>
        ))}
        {sections.length >= 10 && (
          <Text fontSize="12px" color="orange.500" mb="8px">Maximum of 10 sections reached.</Text>
        )}
        <Button size="xs" variant="outline" leftIcon={<FaPlus />} onClick={addSection} isDisabled={disabled || sections.length >= 10}>
          Add Section
        </Button>
      </FieldGroup>

      <PaperConfigFieldsEditor values={form} setValues={setForm} disabled={disabled} />
    </Box>
  );
};

export default PresetFieldsEditor;
