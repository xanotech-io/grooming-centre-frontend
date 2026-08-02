import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Divider,
  Spinner,
  IconButton,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  adminCreateBulkCourseV2Template,
  adminGetBulkCourseV2TemplateById,
  adminUpdateBulkCourseV2Template,
} from "../../../../services";

const EMPTY_MODULE = { title: "", description: "", sequenceOrder: 1, topics: [] };

const TemplateFormPage = () => {
  const history = useHistory();
  const toast = useToast();
  const { templateId } = useParams();
  const isEditing = Boolean(templateId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([{ ...EMPTY_MODULE }]);
  const [topicInputs, setTopicInputs] = useState({ 0: "" });

  const loadTemplate = useCallback(async () => {
    try {
      const { template } = await adminGetBulkCourseV2TemplateById(templateId);
      setName(template.name || "");
      setDescription(template.description || "");
      const mods = (template.modules || []).map((m) => ({
        title: m.title || "",
        description: m.description || "",
        sequenceOrder: m.sequenceOrder ?? 1,
        topics: Array.isArray(m.topics) ? m.topics : [],
      }));
      setModules(mods.length > 0 ? mods : [{ ...EMPTY_MODULE }]);
      const inputs = {};
      mods.forEach((_, i) => { inputs[i] = ""; });
      setTopicInputs(inputs);
    } catch {
      toast({ title: "Failed to load template", status: "error", duration: 3000, isClosable: true });
      history.push("/admin/bulk-courses/templates");
    } finally {
      setLoading(false);
    }
  }, [templateId, toast, history]);

  useEffect(() => {
    if (isEditing) loadTemplate();
  }, [isEditing, loadTemplate]);

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { ...EMPTY_MODULE, sequenceOrder: prev.length + 1 },
    ]);
    setTopicInputs((prev) => ({ ...prev, [modules.length]: "" }));
  };

  const removeModule = (index) => {
    setModules((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, sequenceOrder: i + 1 }))
    );
    setTopicInputs((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const ki = parseInt(k);
        if (ki < index) next[ki] = prev[k];
        else if (ki > index) next[ki - 1] = prev[k];
      });
      return next;
    });
  };

  const updateModule = (index, field, value) =>
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));

  const addTopic = (index) => {
    const val = (topicInputs[index] || "").trim();
    if (!val) return;
    updateModule(index, "topics", [...modules[index].topics, val]);
    setTopicInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const removeTopic = (moduleIndex, topicIndex) =>
    updateModule(moduleIndex, "topics", modules[moduleIndex].topics.filter((_, i) => i !== topicIndex));

  const handleTopicKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic(index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Template name is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    const validModules = modules.filter((m) => m.title.trim());
    if (validModules.length === 0) {
      toast({ title: "Add at least one module with a title", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        modules: validModules.map((m, i) => ({
          title: m.title.trim(),
          ...(m.description.trim() && { description: m.description.trim() }),
          sequenceOrder: i + 1,
          ...(m.topics.length > 0 && { topics: m.topics }),
        })),
      };

      const { message } = isEditing
        ? await adminUpdateBulkCourseV2Template(templateId, payload)
        : await adminCreateBulkCourseV2Template(payload);

      toast({
        title: message || (isEditing ? "Template updated" : "Template created"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push("/admin/bulk-courses/templates");
    } catch {
      toast({
        title: isEditing ? "Failed to update template" : "Failed to create template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="300px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/bulk-courses">Bulk Course Creation</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem>
              <Link href="/admin/bulk-courses/templates">Templates</Link>
            </BreadcrumbItem>
          }
          item4={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Template Form</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="12px" mb="24px">
        <IconButton
          aria-label="Go back"
          icon={<FaArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => history.push("/admin/bulk-courses/templates")}
        />
        <Heading fontSize="22px" fontWeight="600">
          {isEditing ? "Edit Template" : "Create Template"}
        </Heading>
      </Flex>

      <Box as="form" onSubmit={handleSubmit} maxW="780px">
        {/* Template info */}
        <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px" mb="20px">
          <Text fontSize="16px" fontWeight="600" color="gray.700" mb="16px">
            Template Details
          </Text>

          <FormControl isRequired mb="16px">
            <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Name</FormLabel>
            <Input
              size="sm"
              borderRadius="6px"
              placeholder="e.g. Science Department Template"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="14px" fontWeight="500" color="gray.600">Description (optional)</FormLabel>
            <Textarea
              size="sm"
              borderRadius="6px"
              placeholder="Brief description of this template"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
        </Box>

        {/* Modules */}
        <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" p="24px">
          <Flex justifyContent="space-between" alignItems="center" mb="16px">
            <Text fontSize="16px" fontWeight="600" color="gray.700">
              Modules ({modules.length})
            </Text>
            <Button size="sm" secondary leftIcon={<FaPlus />} onClick={addModule}>
              Add Module
            </Button>
          </Flex>

          <Flex direction="column" gap="16px">
            {modules.map((mod, index) => (
              <Box
                key={index}
                bg="#F7FAFC"
                border="1px solid #E2E8F0"
                borderRadius="8px"
                p="16px"
              >
                <Flex justifyContent="space-between" alignItems="center" mb="12px">
                  <Text fontSize="13px" fontWeight="600" color="gray.500">
                    Module {index + 1}
                  </Text>
                  {modules.length > 1 && (
                    <IconButton
                      aria-label="Remove module"
                      icon={<FaTrash />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeModule(index)}
                    />
                  )}
                </Flex>

                <FormControl isRequired mb="12px">
                  <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Title</FormLabel>
                  <Input
                    size="sm"
                    borderRadius="6px"
                    bg="white"
                    placeholder="Module title"
                    value={mod.title}
                    onChange={(e) => updateModule(index, "title", e.target.value)}
                  />
                </FormControl>

                <FormControl mb="12px">
                  <FormLabel fontSize="13px" fontWeight="500" color="gray.600">Description (optional)</FormLabel>
                  <Textarea
                    size="sm"
                    borderRadius="6px"
                    bg="white"
                    placeholder="Module description"
                    rows={2}
                    value={mod.description}
                    onChange={(e) => updateModule(index, "description", e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                    Topics (optional) — press Enter to add
                  </FormLabel>
                  <Flex gap="8px" mb="8px">
                    <Input
                      size="sm"
                      borderRadius="6px"
                      bg="white"
                      placeholder="e.g. Variables"
                      value={topicInputs[index] || ""}
                      onChange={(e) =>
                        setTopicInputs((prev) => ({ ...prev, [index]: e.target.value }))
                      }
                      onKeyDown={(e) => handleTopicKeyDown(e, index)}
                    />
                    <IconButton
                      aria-label="Add topic"
                      icon={<FaPlus />}
                      size="sm"
                      variant="outline"
                      onClick={() => addTopic(index)}
                    />
                  </Flex>
                  {mod.topics.length > 0 && (
                    <Wrap>
                      {mod.topics.map((topic, ti) => (
                        <WrapItem key={ti}>
                          <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                            <TagLabel>{topic}</TagLabel>
                            <TagCloseButton onClick={() => removeTopic(index, ti)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </FormControl>
              </Box>
            ))}
          </Flex>

          <Divider my="20px" />

          <Flex justifyContent="flex-end" gap="12px">
            <Button
              secondary
              onClick={() => history.push("/admin/bulk-courses/templates")}
              isDisabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} loadingText={isEditing ? "Saving…" : "Creating…"}>
              {isEditing ? "Save Changes" : "Create Template"}
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const TemplateFormPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <TemplateFormPage {...props} />} />
);

export default TemplateFormPageRoute;
