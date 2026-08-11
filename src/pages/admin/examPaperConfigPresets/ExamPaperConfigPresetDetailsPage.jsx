import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Spinner,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  Tooltip,
  Input as ChakraInput,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch } from "../../../hooks";
import {
  adminGetExamPaperConfigPresetById,
  adminUpdateExamPaperConfigPreset,
  adminDeleteExamPaperConfigPreset,
  adminGetMarkingTemplates,
} from "../../../services";
import {
  PresetFieldsEditor,
  buildPresetPayload,
  hydratePresetForm,
} from "./PresetFieldsEditor";

const ExamPaperConfigPresetDetailsPage = () => {
  const history = useHistory();
  const { presetId } = useParams();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [nameOnly, setNameOnly] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingTemplates, setMarkingTemplates] = useState([]);
  const [markingTemplatesLoading, setMarkingTemplatesLoading] = useState(true);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const deleteRef = React.useRef();

  const { resource, handleFetchResource } = useFetch();
  const fetcher = useCallback(async () => {
    const { preset } = await adminGetExamPaperConfigPresetById(presetId);
    return { preset };
  }, [presetId]);
  useEffect(() => { handleFetchResource({ fetcher }); }, [handleFetchResource, fetcher]);

  const preset = resource.data?.preset;
  const usageCount = preset?.usageCount ?? 0;
  const coursesUsedIn = preset?.coursesUsedIn ?? [];
  const isLocked = usageCount > 0;

  useEffect(() => {
    if (preset) setNameOnly(preset.name || "");
  }, [preset]);

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

  const startEdit = () => {
    setForm(hydratePresetForm(preset));
    loadTemplates();
    setEditing(true);
  };

  const handleSaveFull = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      await adminUpdateExamPaperConfigPreset(presetId, buildPresetPayload(form));
      toast({ title: "Preset updated", status: "success", duration: 3000, isClosable: true });
      setEditing(false);
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to update preset", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNameOnly = async () => {
    if (!nameOnly.trim() || nameOnly === preset.name) return;
    setSaving(true);
    try {
      await adminUpdateExamPaperConfigPreset(presetId, { name: nameOnly.trim() });
      toast({ title: "Name updated", status: "success", duration: 2000, isClosable: true });
      handleFetchResource({ fetcher });
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to update name", status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    onDeleteClose();
    setDeleting(true);
    try {
      await adminDeleteExamPaperConfigPreset(presetId);
      toast({ title: "Preset deleted", status: "success", duration: 3000, isClosable: true });
      history.push("/admin/exam-paper-config-presets");
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Failed to delete preset", status: "error", duration: 4000, isClosable: true });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/exam-paper-config-presets">Exam Paper Presets</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Details</Link></BreadcrumbItem>}
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
        <Flex alignItems="center" gap="12px" mb="24px">
          <IconButton
            aria-label="Go back" icon={<FaArrowLeft />} variant="ghost" size="sm"
            onClick={() => history.push("/admin/exam-paper-config-presets")}
          />
          <Heading fontSize="22px" fontWeight="600">Preset Details</Heading>
        </Flex>

        {resource.loading && <Flex justifyContent="center" py="60px"><Spinner size="xl" color="blue.500" /></Flex>}
        {resource.err && <Flex justifyContent="center" py="60px"><Text color="red.500">Failed to load preset.</Text></Flex>}

        {!resource.loading && !resource.err && preset && (
          <>
            {/* Header / usage card */}
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p="24px" mb="20px">
              <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="12px" mb="16px">
                <Box>
                  <Text fontSize="20px" fontWeight="700" color="#1A202C" mb="6px">{preset.name}</Text>
                  <Text fontSize="14px" color="gray.500" textTransform="capitalize">
                    Navigation: {(preset.navigationMode || "—").replace(/-/g, " ")}
                  </Text>
                </Box>
                <Flex gap="8px" alignItems="center">
                  <Badge bg={isLocked ? "#EBF4FF" : "#E6F4EA"} color={isLocked ? "#3182CE" : "#38A169"} px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
                    {usageCount} use{usageCount === 1 ? "" : "s"}
                  </Badge>
                  <Tooltip label={isLocked ? "Cannot delete — preset is in use" : ""} isDisabled={!isLocked}>
                    <IconButton
                      aria-label="Delete preset" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red"
                      isDisabled={isLocked} isLoading={deleting} onClick={onDeleteOpen}
                    />
                  </Tooltip>
                </Flex>
              </Flex>

              <Divider mb="16px" />

              {isLocked && (
                <Box bg="#FFF5EA" border="1px solid #FBD38D" borderRadius="6px" px="12px" py="10px" mb="16px">
                  <Text fontSize="13px" color="#744210">
                    This preset is used by {usageCount} exam(s)/assessment(s). Only the name can be changed —
                    create a new preset to change its structure.
                  </Text>
                </Box>
              )}

              {isLocked ? (
                <Flex gap="8px" maxW="480px" alignItems="center">
                  <ChakraInput size="sm" borderRadius="6px" value={nameOnly} onChange={(e) => setNameOnly(e.target.value)} />
                  <Button size="sm" isLoading={saving} onClick={handleSaveNameOnly}>Save Name</Button>
                </Flex>
              ) : !editing ? (
                <Button size="sm" secondary onClick={startEdit}>Edit Preset</Button>
              ) : null}

              {coursesUsedIn.length > 0 && (
                <Box mt="20px">
                  <Text fontSize="13px" fontWeight="600" color="gray.600" mb="10px">Used In</Text>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead bg="#F7FAFC">
                        <Tr>
                          <Th py="10px" fontSize="12px" color="gray.500" fontWeight="600" textTransform="none">Course</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {coursesUsedIn.map((c) => (
                          <Tr key={c.id}>
                            <Td py="10px" fontSize="13px">{c.title}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>

            {editing && form && (
              <>
                <PresetFieldsEditor
                  form={form}
                  setForm={setForm}
                  markingTemplates={markingTemplates}
                  markingTemplatesLoading={markingTemplatesLoading}
                  disabled={false}
                />
                <Flex justifyContent="flex-end" gap="12px" mt="16px" mb="40px">
                  <Button secondary onClick={() => setEditing(false)}>Cancel</Button>
                  <Button isLoading={saving} onClick={handleSaveFull}>Save Changes</Button>
                </Flex>
              </>
            )}

            {!editing && (
              <PresetFieldsEditor
                form={hydratePresetForm(preset)}
                setForm={() => {}}
                markingTemplates={markingTemplates}
                markingTemplatesLoading={false}
                disabled
              />
            )}
          </>
        )}

        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={deleteRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="16px" fontWeight="600">Delete Preset?</AlertDialogHeader>
              <AlertDialogBody fontSize="14px" color="gray.600">
                This cannot be undone. Presets currently in use cannot be deleted.
              </AlertDialogBody>
              <AlertDialogFooter gap="8px">
                <Button secondary ref={deleteRef} onClick={onDeleteClose}>Cancel</Button>
                <Button colorScheme="red" isLoading={deleting} onClick={handleDelete}>Delete</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ExamPaperConfigPresetDetailsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamPaperConfigPresetDetailsPage {...props} />} />
);

export default ExamPaperConfigPresetDetailsPageRoute;
