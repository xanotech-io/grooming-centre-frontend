import { useEffect, useState } from "react";
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
import { createEmailReminder, getEmailReminder, updateEmailReminder } from "../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
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
      .catch(() => toast({ title: "Failed to load reminder", status: "error", duration: 4000, isClosable: true }))
      .finally(() => setLoading(false));
  }, [reminderId, isEdit, toast]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.recipientId.trim()) {
      toast({ title: "Recipient ID is required", status: "warning", duration: 3000, isClosable: true });
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
      recipientId: form.recipientId.trim(),
      scheduledDate: new Date(form.scheduledDate).toISOString(),
      templateName: form.templateName,
      subject: form.subject.trim(),
      ...(form.redirectUrl.trim() ? { redirectUrl: form.redirectUrl.trim() } : {}),
      ...(form.courseId.trim() ? { courseId: form.courseId.trim() } : {}),
      ...(form.standAloneExaminationId.trim() ? { standAloneExaminationId: form.standAloneExaminationId.trim() } : {}),
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
      toast({ title: err?.response?.data?.message || "Failed to save reminder", status: "error", duration: 4000, isClosable: true });
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
          <Heading as="h2" size="md">{isEdit ? "Edit Reminder" : "Create Email Reminder"}</Heading>
          {existingStatus && (
            <Badge
              bg={STATUS_SCHEME[existingStatus]?.bg ?? "#F7FAFC"}
              color={STATUS_SCHEME[existingStatus]?.color ?? "#718096"}
              px="8px" py="2px" borderRadius="6px" textTransform="capitalize" fontSize="12px"
            >
              {existingStatus}
            </Badge>
          )}
        </Flex>

        {isLocked && (
          <Box bg="#FFF5EA" border="1px solid #FBD38D" borderRadius="8px" p="12px" mb={6}>
            <Text fontSize="13px" color="#C05621">
              This reminder has status <strong>{existingStatus}</strong> and cannot be edited.
            </Text>
          </Box>
        )}

        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="500">Recipient ID</FormLabel>
            <Input
              placeholder="UUID of the recipient (student or staff)"
              value={form.recipientId}
              onChange={set("recipientId")}
              isDisabled={isLocked}
              fontFamily="mono"
              fontSize="13px"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="500">Course ID <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></FormLabel>
            <Input
              placeholder="UUID of the linked course"
              value={form.courseId}
              onChange={set("courseId")}
              isDisabled={isLocked}
              fontFamily="mono"
              fontSize="13px"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="500">Standalone Examination ID <Text as="span" color="gray.400" fontWeight="400">(optional)</Text></FormLabel>
            <Input
              placeholder="UUID of the linked standalone exam"
              value={form.standAloneExaminationId}
              onChange={set("standAloneExaminationId")}
              isDisabled={isLocked}
              fontFamily="mono"
              fontSize="13px"
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
              {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
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
            <FormLabel fontSize="sm" fontWeight="500">Redirect URL <Text as="span" color="gray.400" fontWeight="400">(click tracking)</Text></FormLabel>
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
          <Button secondary onClick={() => history.push("/admin/reminders")}>Cancel</Button>
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
