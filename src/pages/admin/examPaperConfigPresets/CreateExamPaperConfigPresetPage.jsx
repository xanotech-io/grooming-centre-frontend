import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box, Flex, IconButton, useToast, BreadcrumbItem } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminCreateExamPaperConfigPreset, adminGetMarkingTemplates } from "../../../services";
import { DEFAULT_PRESET_CONFIG, PresetFieldsEditor, buildPresetPayload, validatePresetSections } from "./PresetFieldsEditor";

const CreateExamPaperConfigPresetPage = () => {
  const history = useHistory();
  const toast = useToast();
  const [form, setForm] = useState(DEFAULT_PRESET_CONFIG);
  const [saving, setSaving] = useState(false);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplatesLoading, setMarkingTemplatesLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    setMarkingTemplatesLoading(true);
    try {
      const { templates } = await adminGetMarkingTemplates();
      setMarkingTemplates(templates);
    } catch {
      setMarkingTemplates([]);
    } finally {
      setMarkingTemplatesLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    const sectionsError = validatePresetSections(form.sections);
    if (sectionsError) {
      toast({ title: sectionsError, status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      const { preset } = await adminCreateExamPaperConfigPreset(buildPresetPayload(form));
      toast({ title: "Preset created", status: "success", duration: 3000, isClosable: true });
      history.push(`/admin/exam-paper-config-presets/${preset.id}`);
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to create preset", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/exam-paper-config-presets">Exam Paper Presets</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Create</Link></BreadcrumbItem>}
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
        <Flex alignItems="center" gap="12px" mb="24px">
          <IconButton
            aria-label="Go back" icon={<FaArrowLeft />} variant="ghost" size="sm"
            onClick={() => history.push("/admin/exam-paper-config-presets")}
          />
          <Heading fontSize="22px" fontWeight="600">Create Exam Paper Config Preset</Heading>
        </Flex>

        <PresetFieldsEditor
          form={form}
          setForm={setForm}
          markingTemplates={markingTemplates}
          markingTemplatesLoading={markingTemplatesLoading}
          disabled={false}
        />

        <Flex justifyContent="flex-end" gap="12px" mt="16px">
          <Button secondary onClick={() => history.push("/admin/exam-paper-config-presets")}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSubmit}>Create Preset</Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateExamPaperConfigPresetPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateExamPaperConfigPresetPage {...props} />} />
);

export default CreateExamPaperConfigPresetPageRoute;
