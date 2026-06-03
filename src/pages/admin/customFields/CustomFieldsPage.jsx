import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  Button,
  Input,
  Select,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Spinner,
  Tooltip,
  Divider,
  Tag,
  TagLabel,
  HStack,
  VStack,
  Stack,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiChevronDown, FiX } from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  getCustomFieldsKpis,
  listCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getEntityFieldValues,
  adminGetStudents,
  adminGetCourseListing,
} from "../../../services";

const MOCK_KPIS = {
  totalFields: 18,
  activeFields: 15,
  inactiveFields: 3,
  dataCompletenessRate: 87,
  byEntity: [
    { entity: "user_profile", count: 10 },
    { entity: "course", count: 8 },
  ],
  byType: [
    { fieldType: "text", count: 6 },
    { fieldType: "dropdown", count: 5 },
    { fieldType: "date", count: 2 },
    { fieldType: "number", count: 2 },
    { fieldType: "checkbox", count: 2 },
    { fieldType: "textarea", count: 1 },
  ],
  byStatus: [
    { status: "active", count: 15 },
    { status: "inactive", count: 3 },
  ],
};

const MOCK_FIELDS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    fieldName: "Employee ID",
    fieldType: "text",
    entity: "user_profile",
    required: true,
    defaultValue: null,
    validationRules: { regex: "^EMP-[0-9]{6}$", error_message: "Format must be EMP-123456" },
    options: null,
    visibility: { view: ["Self", "Admin"], edit: ["Admin"] },
    helpText: "Enter your official employee identification number",
    status: "active",
    createdAt: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    fieldName: "Delivery Mode",
    fieldType: "dropdown",
    entity: "course",
    required: true,
    defaultValue: null,
    validationRules: null,
    options: ["Online", "Blended", "In-Person"],
    visibility: { view: ["Self", "Admin", "Instructor"], edit: ["Admin"] },
    helpText: "Select how this course is delivered",
    status: "active",
    createdAt: "2026-05-02T09:05:00.000Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    fieldName: "Years of Experience",
    fieldType: "number",
    entity: "user_profile",
    required: false,
    defaultValue: null,
    validationRules: { min: 0, max: 50, error_message: "Must be between 0 and 50" },
    options: null,
    visibility: { view: ["Self", "Admin", "Instructor"], edit: ["Self", "Admin"] },
    helpText: "Total years of professional experience",
    status: "active",
    createdAt: "2026-05-03T09:10:00.000Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    fieldName: "Dietary Preference",
    fieldType: "dropdown",
    entity: "user_profile",
    required: false,
    defaultValue: null,
    validationRules: null,
    options: ["Vegetarian", "Vegan", "Non-Vegetarian", "Halal", "Kosher"],
    visibility: { view: ["Self", "Admin"], edit: ["Self", "Admin"] },
    helpText: "Dietary preference for catered events",
    status: "active",
    createdAt: "2026-05-04T09:15:00.000Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    fieldName: "Course Accreditation",
    fieldType: "text",
    entity: "course",
    required: false,
    defaultValue: null,
    validationRules: null,
    options: null,
    visibility: { view: ["Self", "Admin", "Instructor"], edit: ["Admin"] },
    helpText: "Accreditation body and reference number",
    status: "inactive",
    createdAt: "2026-05-05T09:20:00.000Z",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    fieldName: "NDA Signed",
    fieldType: "checkbox",
    entity: "user_profile",
    required: true,
    defaultValue: "false",
    validationRules: null,
    options: null,
    visibility: { view: ["Admin"], edit: ["Admin"] },
    helpText: "Indicates whether the employee has signed the NDA",
    status: "active",
    createdAt: "2026-05-06T09:25:00.000Z",
  },
];

const FIELD_TYPES = ["text", "dropdown", "date", "number", "checkbox", "textarea"];
const ENTITY_TYPES = ["user_profile", "course"];
const VISIBILITY_ROLES = ["Self", "Admin", "Instructor"];

const EMPTY_FORM = {
  fieldName: "",
  fieldType: "text",
  entity: "user_profile",
  required: false,
  defaultValue: "",
  helpText: "",
  status: "active",
  options: "",
  validationRules: { regex: "", min: "", max: "", error_message: "" },
  visibility: { view: ["Self", "Admin"], edit: ["Admin"] },
};

function KpiCard({ label, value, color }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={color || "gray.800"}>
        {value ?? "—"}
      </Text>
    </Box>
  );
}

function PaginationBar({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <Flex justify="center" align="center" gap={2} mt={4}>
      <Button size="sm" onClick={() => onPage(page - 1)} isDisabled={page <= 1} variant="outline">
        Prev
      </Button>
      <Text fontSize="sm" color="gray.600">
        {page} / {totalPages}
      </Text>
      <Button size="sm" onClick={() => onPage(page + 1)} isDisabled={page >= totalPages} variant="outline">
        Next
      </Button>
    </Flex>
  );
}

function FieldFormModal({ isOpen, onClose, editField, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editField) {
      setForm({
        fieldName: editField.fieldName || "",
        fieldType: editField.fieldType || "text",
        entity: editField.entity || "user_profile",
        required: editField.required || false,
        defaultValue: editField.defaultValue || "",
        helpText: editField.helpText || "",
        status: editField.status || "active",
        options: Array.isArray(editField.options) ? editField.options.join(", ") : "",
        validationRules: {
          regex: editField.validationRules?.regex || "",
          min: editField.validationRules?.min ?? "",
          max: editField.validationRules?.max ?? "",
          error_message: editField.validationRules?.error_message || "",
        },
        visibility: editField.visibility || { view: ["Self", "Admin"], edit: ["Admin"] },
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editField, isOpen]);

  const handleVisibilityChange = (key, vals) => {
    setForm((f) => ({ ...f, visibility: { ...f.visibility, [key]: vals } }));
  };

  const handleSave = async () => {
    if (!form.fieldName.trim()) {
      toast({ title: "Field name is required", status: "warning", duration: 3000 });
      return;
    }
    if (form.fieldType === "dropdown" && !form.options.trim()) {
      toast({ title: "Options are required for dropdown fields", status: "warning", duration: 3000 });
      return;
    }

    const payload = {
      fieldName: form.fieldName.trim(),
      fieldType: form.fieldType,
      entity: form.entity,
      required: form.required,
      defaultValue: form.defaultValue || null,
      helpText: form.helpText || null,
      status: form.status,
      visibility: form.visibility,
    };

    if (form.fieldType === "dropdown") {
      payload.options = form.options.split(",").map((o) => o.trim()).filter(Boolean);
    }

    const hasValidation =
      form.validationRules.regex ||
      form.validationRules.min !== "" ||
      form.validationRules.max !== "" ||
      form.validationRules.error_message;

    if (hasValidation) {
      payload.validationRules = {};
      if (form.validationRules.regex) payload.validationRules.regex = form.validationRules.regex;
      if (form.validationRules.min !== "") payload.validationRules.min = Number(form.validationRules.min);
      if (form.validationRules.max !== "") payload.validationRules.max = Number(form.validationRules.max);
      if (form.validationRules.error_message) payload.validationRules.error_message = form.validationRules.error_message;
    } else {
      payload.validationRules = null;
    }

    setSaving(true);
    try {
      if (editField) {
        await updateCustomField(editField.id, payload);
      } else {
        await createCustomField(payload);
      }
      toast({ title: editField ? "Field updated" : "Field created", status: "success", duration: 3000 });
      onSaved();
      onClose();
    } catch {
      toast({ title: editField ? "Update failed" : "Create failed", status: "error", duration: 4000 });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editField ? "Edit Custom Field" : "Create Custom Field"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Field Name</FormLabel>
              <Input
                size="sm"
                value={form.fieldName}
                onChange={(e) => setForm((f) => ({ ...f, fieldName: e.target.value }))}
                placeholder="e.g. Employee ID"
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Field Type</FormLabel>
                <Select
                  size="sm"
                  value={form.fieldType}
                  onChange={(e) => setForm((f) => ({ ...f, fieldType: e.target.value }))}
                  isDisabled={!!editField}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Entity</FormLabel>
                <Select
                  size="sm"
                  value={form.entity}
                  onChange={(e) => setForm((f) => ({ ...f, entity: e.target.value }))}
                  isDisabled={!!editField}
                >
                  {ENTITY_TYPES.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            {form.fieldType === "dropdown" && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Options (comma-separated)</FormLabel>
                <Input
                  size="sm"
                  value={form.options}
                  onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
                  placeholder="Online, Blended, In-Person"
                />
                <FormHelperText>Separate each option with a comma</FormHelperText>
              </FormControl>
            )}

            {(form.fieldType === "text" || form.fieldType === "textarea") && (
              <FormControl>
                <FormLabel fontSize="sm">Regex Validation Pattern</FormLabel>
                <Input
                  size="sm"
                  value={form.validationRules.regex}
                  onChange={(e) => setForm((f) => ({ ...f, validationRules: { ...f.validationRules, regex: e.target.value } }))}
                  placeholder="^EMP-[0-9]{6}$"
                  fontFamily="mono"
                />
              </FormControl>
            )}

            {form.fieldType === "number" && (
              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Min Value</FormLabel>
                  <Input
                    size="sm"
                    type="number"
                    value={form.validationRules.min}
                    onChange={(e) => setForm((f) => ({ ...f, validationRules: { ...f.validationRules, min: e.target.value } }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Max Value</FormLabel>
                  <Input
                    size="sm"
                    type="number"
                    value={form.validationRules.max}
                    onChange={(e) => setForm((f) => ({ ...f, validationRules: { ...f.validationRules, max: e.target.value } }))}
                  />
                </FormControl>
              </SimpleGrid>
            )}

            {(form.validationRules.regex || form.validationRules.min !== "" || form.validationRules.max !== "") && (
              <FormControl>
                <FormLabel fontSize="sm">Validation Error Message</FormLabel>
                <Input
                  size="sm"
                  value={form.validationRules.error_message}
                  onChange={(e) => setForm((f) => ({ ...f, validationRules: { ...f.validationRules, error_message: e.target.value } }))}
                  placeholder="Must match format EMP-123456"
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Default Value</FormLabel>
              <Input
                size="sm"
                value={form.defaultValue}
                onChange={(e) => setForm((f) => ({ ...f, defaultValue: e.target.value }))}
                placeholder="Optional pre-filled value"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Help Text</FormLabel>
              <Textarea
                size="sm"
                rows={2}
                value={form.helpText}
                onChange={(e) => setForm((f) => ({ ...f, helpText: e.target.value }))}
                placeholder="Guidance shown below the field in the UI"
              />
            </FormControl>

            <Divider />

            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2}>Visibility</Text>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Who can view</FormLabel>
                  <CheckboxGroup
                    value={form.visibility.view}
                    onChange={(vals) => handleVisibilityChange("view", vals)}
                  >
                    <Stack spacing={1}>
                      {VISIBILITY_ROLES.map((r) => (
                        <Checkbox key={r} value={r} size="sm">{r}</Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Who can edit</FormLabel>
                  <CheckboxGroup
                    value={form.visibility.edit}
                    onChange={(vals) => handleVisibilityChange("edit", vals)}
                  >
                    <Stack spacing={1}>
                      {VISIBILITY_ROLES.map((r) => (
                        <Checkbox key={r} value={r} size="sm">{r}</Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            <SimpleGrid columns={2} spacing={3}>
              <FormControl display="flex" alignItems="center" gap={2}>
                <Switch
                  size="sm"
                  isChecked={form.required}
                  onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
                />
                <FormLabel mb={0} fontSize="sm">Required field</FormLabel>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Status</FormLabel>
                <Select
                  size="sm"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="blue" onClick={handleSave} isLoading={saving}>
            {editField ? "Save Changes" : "Create Field"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Generic searchable combobox — fetches options via fetchFn(query)
// Each option must have { id, label, sublabel? }
function EntityCombobox({ fetchFn, value, onSelect, placeholder }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedOption = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!inputValue || selectedOption) return options;
    const q = inputValue.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel ?? "").toLowerCase().includes(q),
    );
  }, [options, inputValue, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doFetch = useCallback(
    async (query) => {
      setLoading(true);
      try {
        const results = await fetchFn(query);
        setOptions(results);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn],
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (value) onSelect(null);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(val), 350);
  };

  const handleFocus = () => {
    if (!selectedOption) {
      setIsOpen(true);
      if (options.length === 0) doFetch("");
    }
  };

  const handleSelect = (opt) => {
    onSelect(opt);
    setInputValue("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  return (
    <Box ref={containerRef} position="relative" flex="1" maxW="320px">
      <Flex
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        alignItems="center"
        px={2}
        bg="white"
        h="32px"
        _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
      >
        <Input
          border="none"
          px={0}
          size="sm"
          h="auto"
          _focus={{ boxShadow: "none" }}
          value={
            selectedOption
              ? `${selectedOption.label}${selectedOption.sublabel ? ` — ${selectedOption.sublabel}` : ""}`
              : inputValue
          }
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || "Search..."}
          readOnly={!!selectedOption}
        />
        {loading && <Spinner size="xs" color="gray.400" mr={1} />}
        {selectedOption ? (
          <Box
            as="button"
            type="button"
            onClick={handleClear}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={12} />
          </Box>
        ) : (
          <Box color="gray.400" ml={1} flexShrink={0}>
            <FiChevronDown size={12} />
          </Box>
        )}
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="md"
          boxShadow="md"
          zIndex={1500}
          maxH="220px"
          overflowY="auto"
        >
          {loading && (
            <Flex alignItems="center" gap={2} px={3} py={2}>
              <Spinner size="xs" />
              <Text fontSize="12px" color="gray.500">Loading...</Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="12px" color="gray.500" px={3} py={2}>
              No results found
            </Text>
          )}
          {!loading &&
            filtered.map((opt) => (
              <Box
                key={opt.id}
                px={3}
                py="6px"
                cursor="pointer"
                _hover={{ bg: "blue.50" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
              >
                <Text fontSize="13px" fontWeight="500">{opt.label}</Text>
                {opt.sublabel && (
                  <Text fontSize="11px" color="gray.500">{opt.sublabel}</Text>
                )}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
}

function EntityValuesLookup() {
  const toast = useToast();
  const [entityType, setEntityType] = useState("user_profile");
  const [entityId, setEntityId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchStudentOptions = useCallback(async (search) => {
    const res = await adminGetStudents({ search, page: 1, length: 50 });
    return res.students.map((s) => ({
      id: s.id,
      label: `${s.firstName} ${s.lastName}`,
      sublabel: s.email,
    }));
  }, []);

  const fetchCourseOptions = useCallback(async (search) => {
    const res = await adminGetCourseListing({ search, limit: 50 });
    return res.courses.map((c) => ({
      id: c.id,
      label: c.title,
      sublabel: c.displayId ?? null,
    }));
  }, []);

  const handleEntityTypeChange = (e) => {
    setEntityType(e.target.value);
    setEntityId("");
    setResult(null);
  };

  const handleLookup = async () => {
    if (!entityId) {
      toast({ title: "Please select an entity first", status: "warning", duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await getEntityFieldValues(entityType, entityId);
      setResult(res?.data || res);
    } catch {
      toast({ title: "Lookup failed", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Select an entity type and choose a record to look up all stored custom field values.
      </Text>
      <Flex gap={3} mb={4} flexWrap="wrap" alignItems="flex-end">
        <Select
          size="sm"
          value={entityType}
          onChange={handleEntityTypeChange}
          maxW="200px"
        >
          <option value="user_profile">User Profile</option>
          <option value="course">Course</option>
        </Select>
        {entityType === "user_profile" ? (
          <EntityCombobox
            key="user_profile"
            fetchFn={fetchStudentOptions}
            value={entityId}
            onSelect={(opt) => setEntityId(opt ? opt.id : "")}
            placeholder="Search student by name or email..."
          />
        ) : (
          <EntityCombobox
            key="course"
            fetchFn={fetchCourseOptions}
            value={entityId}
            onSelect={(opt) => setEntityId(opt ? opt.id : "")}
            placeholder="Search course by title..."
          />
        )}
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<FiSearch />}
          onClick={handleLookup}
          isLoading={loading}
          isDisabled={!entityId}
        >
          Lookup
        </Button>
      </Flex>

      {result && (
        <Box>
          <Flex gap={4} mb={3}>
            <Text fontSize="xs" color="gray.500">
              Entity: <strong>{result.entityType}</strong>
            </Text>
            <Text fontSize="xs" color="gray.500">
              Total fields: <strong>{result.summary?.total_fields ?? 0}</strong>
            </Text>
            <Text fontSize="xs" color="gray.500">
              Active: <strong>{result.summary?.active_fields ?? 0}</strong>
            </Text>
          </Flex>
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Field Name</Th>
                <Th>Type</Th>
                <Th>Value</Th>
                <Th>Status</Th>
                <Th>Last Edited By</Th>
                <Th>Updated At</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(result.custom_fields || []).map((cf) => (
                <Tr key={cf.id}>
                  <Td fontWeight="medium">{cf.field?.fieldName || cf.fieldId}</Td>
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">{cf.field?.fieldType}</Badge>
                  </Td>
                  <Td maxW="200px">
                    <Text isTruncated title={cf.value}>
                      {cf.value === null || cf.value === undefined ? <Text as="span" color="gray.400" fontStyle="italic">—</Text> : String(cf.value)}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={cf.field?.status === "active" ? "green" : "gray"}>
                      {cf.field?.status}
                    </Badge>
                  </Td>
                  <Td>
                    {cf.editor ? `${cf.editor.firstName} ${cf.editor.lastName}` : "—"}
                  </Td>
                  <Td>{cf.updatedAt ? new Date(cf.updatedAt).toLocaleDateString() : "—"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {(result.custom_fields || []).length === 0 && (
            <Text textAlign="center" py={6} color="gray.400" fontSize="sm">
              No custom field values found for this entity
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

function CustomFieldsPage() {
  const toast = useToast();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();

  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editField, setEditField] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchKpis = useCallback(async () => {
    setKpisLoading(true);
    try {
      const res = await getCustomFieldsKpis();
      setKpis(res?.data || res);
    } catch {
      console.warn("[CustomFields] KPIs failed, using mock");
      setKpis(MOCK_KPIS);
    } finally {
      setKpisLoading(false);
    }
  }, []);

  const fetchFields = useCallback(async () => {
    setFieldsLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (entityFilter) params.entity = entityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await listCustomFields(params);
      const payload = res?.data || res;
      const items = Array.isArray(payload?.fields)
        ? payload.fields
        : Array.isArray(payload)
        ? payload
        : MOCK_FIELDS;
      setFields(items);
      const computed = Math.ceil((payload?.total || items.length) / 20) || 1;
      const tp = payload?.totalPages ?? computed;
      setTotalPages(tp);
    } catch {
      console.warn("[CustomFields] list failed, using mock");
      setFields(MOCK_FIELDS);
      setTotalPages(1);
    } finally {
      setFieldsLoading(false);
    }
  }, [page, search, entityFilter, statusFilter]);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => { fetchFields(); }, [fetchFields]);

  const handleDelete = async (field) => {
    if (!window.confirm(`Delete "${field.fieldName}"? This cannot be undone.`)) return;
    setDeletingId(field.id);
    try {
      await deleteCustomField(field.id);
      toast({ title: "Field deleted", status: "success", duration: 3000 });
      fetchFields();
      fetchKpis();
    } catch (err) {
      const msg = err?.response?.data?.message || "Delete failed";
      if (err?.response?.status === 403) {
        toast({
          title: "Cannot delete field",
          description: "This field has existing values. Deactivate it instead.",
          status: "warning",
          duration: 5000,
        });
      } else {
        toast({ title: msg, status: "error", duration: 4000 });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (field) => {
    const newStatus = field.status === "active" ? "inactive" : "active";
    setTogglingId(field.id);
    try {
      await updateCustomField(field.id, { status: newStatus });
      toast({ title: `Field ${newStatus === "active" ? "activated" : "deactivated"}`, status: "success", duration: 3000 });
      fetchFields();
      fetchKpis();
    } catch {
      toast({ title: "Status update failed", status: "error", duration: 4000 });
    } finally {
      setTogglingId(null);
    }
  };

  const openCreate = () => { setEditField(null); onFormOpen(); };
  const openEdit = (field) => { setEditField(field); onFormOpen(); };

  const byEntityMap = {};
  (kpis?.byEntity || []).forEach(({ entity, count }) => { byEntityMap[entity] = count; });

  const byTypeMap = {};
  (kpis?.byType || []).forEach(({ fieldType, count }) => { byTypeMap[fieldType] = count; });

  return (
    <AdminMainAreaWrapper>
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="md" color="gray.800">Custom Fields</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Manage institution-specific fields for user profiles and courses
            </Text>
          </Box>
          <HStack>
            <Tooltip label="Refresh">
              <IconButton
                size="sm"
                variant="outline"
                icon={<FiRefreshCw />}
                onClick={() => { fetchKpis(); fetchFields(); }}
              />
            </Tooltip>
            <Button size="sm" colorScheme="blue" leftIcon={<FiPlus />} onClick={openCreate}>
              New Field
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <KpiCard label="Total Fields" value={kpisLoading ? "..." : kpis?.totalFields} />
          <KpiCard label="Active Fields" value={kpisLoading ? "..." : kpis?.activeFields} color="green.600" />
          <KpiCard label="Inactive Fields" value={kpisLoading ? "..." : kpis?.inactiveFields} color="gray.500" />
          <KpiCard
            label="Data Completeness"
            value={kpisLoading ? "..." : `${kpis?.dataCompletenessRate ?? 0}%`}
            color="blue.600"
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
          <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2} textTransform="uppercase">
              By Entity
            </Text>
            <HStack spacing={3} flexWrap="wrap">
              {(kpis?.byEntity || MOCK_KPIS.byEntity).map(({ entity, count }) => (
                <Tag key={entity} size="md" colorScheme="blue" variant="subtle" borderRadius="full">
                  <TagLabel>{entity}: {count}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Box>
          <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2} textTransform="uppercase">
              By Field Type
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {(kpis?.byType || MOCK_KPIS.byType).map(({ fieldType, count }) => (
                <Tag key={fieldType} size="sm" colorScheme="purple" variant="subtle" borderRadius="full">
                  <TagLabel>{fieldType}: {count}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Box>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab fontSize="sm">Field Definitions</Tab>
            <Tab fontSize="sm">Entity Values Lookup</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0} pt={4}>
              <Flex gap={3} mb={4} flexWrap="wrap">
                <Input
                  size="sm"
                  placeholder="Search fields..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  maxW="240px"
                />
                <Select
                  size="sm"
                  value={entityFilter}
                  onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                  maxW="180px"
                >
                  <option value="">All Entities</option>
                  <option value="user_profile">User Profile</option>
                  <option value="course">Course</option>
                </Select>
                <Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  maxW="160px"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Flex>

              {fieldsLoading ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : (
                <>
                  <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Field Name</Th>
                          <Th>Type</Th>
                          <Th>Entity</Th>
                          <Th>Required</Th>
                          <Th>Visibility (view)</Th>
                          <Th>Status</Th>
                          <Th>Created</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {fields.map((f) => (
                          <Tr key={f.id} _hover={{ bg: "gray.50" }}>
                            <Td>
                              <Text fontWeight="medium" fontSize="sm">{f.fieldName}</Text>
                              {f.helpText && (
                                <Text fontSize="xs" color="gray.400" isTruncated maxW="180px" title={f.helpText}>
                                  {f.helpText}
                                </Text>
                              )}
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" variant="subtle">{f.fieldType}</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme="blue" variant="subtle">{f.entity}</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={f.required ? "orange" : "gray"} variant="subtle">
                                {f.required ? "Yes" : "No"}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={1} flexWrap="wrap">
                                {(f.visibility?.view || []).map((role) => (
                                  <Tag key={role} size="sm" colorScheme="teal" variant="subtle">
                                    <TagLabel>{role}</TagLabel>
                                  </Tag>
                                ))}
                              </HStack>
                            </Td>
                            <Td>
                              <Flex align="center" gap={2}>
                                <Switch
                                  size="sm"
                                  isChecked={f.status === "active"}
                                  onChange={() => handleToggleStatus(f)}
                                  isDisabled={togglingId === f.id}
                                />
                                <Badge colorScheme={f.status === "active" ? "green" : "gray"}>
                                  {f.status}
                                </Badge>
                              </Flex>
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                              {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Tooltip label="Edit field">
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    icon={<FiEdit2 />}
                                    onClick={() => openEdit(f)}
                                  />
                                </Tooltip>
                                <Tooltip label="Delete field">
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    icon={<FiTrash2 />}
                                    onClick={() => handleDelete(f)}
                                    isLoading={deletingId === f.id}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {fields.length === 0 && (
                      <Text textAlign="center" py={8} color="gray.400" fontSize="sm">
                        No custom fields found
                      </Text>
                    )}
                  </Box>
                  <PaginationBar page={page} totalPages={totalPages} onPage={setPage} />
                </>
              )}
            </TabPanel>

            <TabPanel px={0} pt={4}>
              <EntityValuesLookup />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <FieldFormModal
          isOpen={isFormOpen}
          onClose={onFormClose}
          editField={editField}
          onSaved={() => { fetchFields(); fetchKpis(); }}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
}

export const CustomFieldsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CustomFieldsPage {...props} />} />
);

export default CustomFieldsPage;
