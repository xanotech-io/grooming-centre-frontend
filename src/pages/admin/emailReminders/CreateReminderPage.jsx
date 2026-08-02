import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Route, useHistory, useLocation } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { Button, Heading, Text, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  createEmailReminder,
  getEmailReminder,
  updateEmailReminder,
  adminGetStudents,
  adminGetCourseListing,
  adminGetStandaloneExaminationListing,
} from "../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { FiChevronDown, FiX } from "react-icons/fi";
import dayjs from "dayjs";

const TEMPLATES = [
  "Standard Reminder",
  "Urgent Reminder",
  "Friendly Nudge",
  "Final Notice",
];

const STATUS_SCHEME = {
  pending: { bg: "#FFF5EA", color: "#DD6B20" },
  sent: { bg: "#E6F4EA", color: "#38A169" },
  failed: { bg: "#FED7D7", color: "#E53E3E" },
  cancelled: { bg: "#F7FAFC", color: "#718096" },
};

const toDatetimeLocal = (iso) => {
  if (!iso) return "";
  return dayjs(iso).format("YYYY-MM-DDTHH:mm");
};

// ---------------------------------------------------------------------------
// Generic searchable combobox
// options: [{ id, label, sublabel? }]
// value: selected UUID or ""
// onSelect: (opt | null) => void
// ---------------------------------------------------------------------------

function EntityCombobox({ fetchFn, value, onSelect, placeholder, isDisabled }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

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
    if (!value) {
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

  const displayValue = selectedOption
    ? `${selectedOption.label}${selectedOption.sublabel ? ` — ${selectedOption.sublabel}` : ""}`
    : value
    || inputValue;

  return (
    <Box ref={containerRef} position="relative">
      <Flex
        border="1px solid"
        borderColor={isDisabled ? "gray.200" : "inherit"}
        borderRadius="md"
        alignItems="center"
        px={3}
        bg={isDisabled ? "gray.100" : "white"}
        _focusWithin={
          isDisabled
            ? {}
            : { borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }
        }
      >
        <Input
          border="none"
          px={0}
          _focus={{ boxShadow: "none" }}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || "Search..."}
          readOnly={!!value || isDisabled}
          disabled={isDisabled}
          cursor={isDisabled ? "not-allowed" : "text"}
          fontSize="14px"
        />
        {loading && <Spinner size="xs" color="gray.400" mr={1} />}
        {!isDisabled && value ? (
          <Box
            as="button"
            type="button"
            onClick={handleClear}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={14} />
          </Box>
        ) : (
          !isDisabled && (
            <Box color="gray.400" ml={1} flexShrink={0}>
              <FiChevronDown size={14} />
            </Box>
          )
        )}
      </Flex>

      {isOpen && !isDisabled && (
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
              <Text fontSize="13px" color="gray.500">Loading...</Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="13px" color="gray.500" px={3} py={2}>
              No results found
            </Text>
          )}
          {!loading &&
            filtered.map((opt) => (
              <Box
                key={opt.id}
                px={3}
                py="8px"
                cursor="pointer"
                _hover={{ bg: "#EBF8FF" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
              >
                <Text fontSize="14px" fontWeight="500">{opt.label}</Text>
                {opt.sublabel && (
                  <Text fontSize="12px" color="gray.500">{opt.sublabel}</Text>
                )}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const CreateReminderPage = () => {
  const history = useHistory();
  const { search } = useLocation();
  const toast = useToast();
  const reminderId = new URLSearchParams(search).get("id");
  const isEdit = Boolean(reminderId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);

  const [form, setForm] = useState({
    recipientId: "",
    courseId: "",
    standAloneExaminationId: "",
    scheduledDate: "",
    templateName: "Standard Reminder",
    subject: "",
    redirectUrl: "",
  });

  const isLocked = existingStatus && existingStatus !== "pending";

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getEmailReminder(reminderId)
      .then((res) => {
        const d = res?.data ?? res;
        setExistingStatus(d?.status);
        setForm({
          recipientId: d?.recipientId ?? "",
          courseId: d?.courseId ?? "",
          standAloneExaminationId: d?.standAloneExaminationId ?? "",
          scheduledDate: toDatetimeLocal(d?.scheduledDate),
          templateName: d?.templateName ?? d?.templateUsed ?? "Standard Reminder",
          subject: d?.subject ?? "",
          redirectUrl: d?.redirectUrl ?? "",
        });
      })
      .catch(() =>
        toast({ title: "Failed to load reminder", status: "error", duration: 4000, isClosable: true }),
      )
      .finally(() => setLoading(false));
  }, [reminderId, isEdit, toast]);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fetchStudents = useCallback(async (query) => {
    const res = await adminGetStudents({ search: query, page: 1, length: 50 });
    return res.students.map((s) => ({
      id: s.id,
      label: `${s.firstName} ${s.lastName}`,
      sublabel: s.email,
    }));
  }, []);

  const fetchCourses = useCallback(async (query) => {
    const res = await adminGetCourseListing({ search: query });
    return res.courses.map((c) => ({
      id: c.id,
      label: c.title,
      sublabel: c.displayId ?? null,
    }));
  }, []);

  const fetchExams = useCallback(async (query) => {
    const res = await adminGetStandaloneExaminationListing({ search: query });
    return res.examinations.map((e) => ({
      id: e.id,
      label: e.title,
      sublabel: e.startTime ? dayjs(e.startTime).format("DD MMM YYYY") : null,
    }));
  }, []);

  const handleSubmit = async () => {
    if (!form.recipientId) {
      toast({ title: "Recipient is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!form.scheduledDate) {
      toast({ title: "Scheduled date is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!form.subject.trim()) {
      toast({ title: "Subject is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const payload = {
      recipientId: form.recipientId,
      scheduledDate: new Date(form.scheduledDate).toISOString(),
      templateName: form.templateName,
      subject: form.subject.trim(),
      ...(form.redirectUrl.trim() ? { redirectUrl: form.redirectUrl.trim() } : {}),
      ...(form.courseId ? { courseId: form.courseId } : {}),
      ...(form.standAloneExaminationId ? { standAloneExaminationId: form.standAloneExaminationId } : {}),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateEmailReminder(reminderId, payload);
        toast({ title: "Reminder updated", status: "success", duration: 3000, isClosable: true });
      } else {
        await createEmailReminder(payload);
        toast({ title: "Reminder created", status: "success", duration: 3000, isClosable: true });
      }
      history.push("/admin/reminders");
    } catch (err) {
      toast({
        title: err?.response?.data?.message || "Failed to save reminder",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminMainAreaWrapper>
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      </AdminMainAreaWrapper>
    );
  }

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/reminders">Email Reminders</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{isEdit ? "Edit Reminder" : "Create Reminder"}</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={4} maxW="2xl">
        <Flex alignItems="center" gap="12px" mb={6}>
          <Heading as="h2" size="md">
            {isEdit ? "Edit Reminder" : "Create Email Reminder"}
          </Heading>
          {existingStatus && (
            <Badge
              bg={STATUS_SCHEME[existingStatus]?.bg ?? "#F7FAFC"}
              color={STATUS_SCHEME[existingStatus]?.color ?? "#718096"}
              px="8px"
              py="2px"
              borderRadius="6px"
              textTransform="capitalize"
              fontSize="12px"
            >
              {existingStatus}
            </Badge>
          )}
        </Flex>

        {isLocked && (
          <Box
            bg="#FFF5EA"
            border="1px solid #FBD38D"
            borderRadius="8px"
            p="12px"
            mb={6}
          >
            <Text fontSize="13px" color="#C05621">
              This reminder has status <strong>{existingStatus}</strong> and cannot be edited.
            </Text>
          </Box>
        )}

        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="500">Recipient</FormLabel>
            <EntityCombobox
              fetchFn={fetchStudents}
              value={form.recipientId}
              onSelect={(opt) =>
                setForm((prev) => ({ ...prev, recipientId: opt ? opt.id : "" }))
              }
              placeholder="Search student by name or email..."
              isDisabled={isLocked}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="500">
              Course{" "}
              <Text as="span" color="gray.400" fontWeight="400">
                (optional)
              </Text>
            </FormLabel>
            <EntityCombobox
              fetchFn={fetchCourses}
              value={form.courseId}
              onSelect={(opt) =>
                setForm((prev) => ({ ...prev, courseId: opt ? opt.id : "" }))
              }
              placeholder="Search course by title..."
              isDisabled={isLocked}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="500">
              Standalone Examination{" "}
              <Text as="span" color="gray.400" fontWeight="400">
                (optional)
              </Text>
            </FormLabel>
            <EntityCombobox
              fetchFn={fetchExams}
              value={form.standAloneExaminationId}
              onSelect={(opt) =>
                setForm((prev) => ({
                  ...prev,
                  standAloneExaminationId: opt ? opt.id : "",
                }))
              }
              placeholder="Search examination by title..."
              isDisabled={isLocked}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="500">Scheduled Date & Time</FormLabel>
            <Input
              type="datetime-local"
              value={form.scheduledDate}
              onChange={set("scheduledDate")}
              isDisabled={isLocked}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="500">Email Template</FormLabel>
            <Select
              value={form.templateName}
              onChange={set("templateName")}
              isDisabled={isLocked}
              bg="gray.50"
            >
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="500">Email Subject</FormLabel>
            <Input
              placeholder="e.g. Upcoming AGR101 Workshop"
              value={form.subject}
              onChange={set("subject")}
              isDisabled={isLocked}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="500">
              Redirect URL{" "}
              <Text as="span" color="gray.400" fontWeight="400">
                (click tracking)
              </Text>
            </FormLabel>
            <Input
              placeholder="https://lms.example.com/courses/agr101"
              value={form.redirectUrl}
              onChange={set("redirectUrl")}
              isDisabled={isLocked}
              type="url"
            />
          </FormControl>
        </VStack>

        <Flex justify="flex-end" gap="10px" mt={8}>
          <Button secondary onClick={() => history.push("/admin/reminders")}>
            Cancel
          </Button>
          {!isLocked && (
            <Button isLoading={saving} onClick={handleSubmit}>
              {isEdit ? "Update Reminder" : "Create Reminder"}
            </Button>
          )}
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateReminderPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CreateReminderPage {...props} />} />
);

export default CreateReminderPage;
