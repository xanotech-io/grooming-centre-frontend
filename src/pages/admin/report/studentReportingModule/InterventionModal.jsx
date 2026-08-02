import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  HStack,
  Box,
  useToast,
} from "@chakra-ui/react";
import { Button, Text } from "../../../../components";
import { pm2LogIntervention } from "../../../../services";
import { adminGetCourseListing } from "../../../../services";
import { adminGetUserListing } from "../../../../services";

const ACTION_OPTIONS = [
  "Email Sent",
  "Phone Call",
  "In-person Meeting",
  "SMS Sent",
  "Advisor Referral",
  "Academic Warning Issued",
  "Follow-up Scheduled",
];

const InterventionModal = ({ isOpen, onClose, student, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    remark: "",
    actionTaken: "",
  });

  // Pre-fill studentId when opened from a table row
  useEffect(() => {
    if (student?.student_id) {
      setForm((prev) => ({ ...prev, studentId: student.student_id }));
    }
  }, [student]);

  // Load students + courses when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setStudentsLoading(true);
    adminGetUserListing({ limit: 200, role: "student" })
      .then((res) => {
        const list = res?.users ?? [];
        setStudents(list);
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));

    setCoursesLoading(true);
    adminGetCourseListing({ limit: 200 })
      .then((res) => {
        const list = res?.courses ?? res?.rows ?? [];
        setCourses(list);
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.studentId) {
      toast({ status: "warning", description: "Please select a student", duration: 2500, isClosable: true });
      return;
    }
    if (!form.remark.trim()) {
      toast({ status: "warning", description: "Remark is required", duration: 2500, isClosable: true });
      return;
    }
    if (!form.actionTaken) {
      toast({ status: "warning", description: "Please select an action taken", duration: 2500, isClosable: true });
      return;
    }

    setLoading(true);
    try {
      const result = await pm2LogIntervention({
        studentId: form.studentId,
        courseId: form.courseId || undefined,
        remark: form.remark,
        actionTaken: form.actionTaken,
      });
      toast({
        status: "success",
        description: result?.message ?? "Intervention logged successfully",
        duration: 3000,
        isClosable: true,
      });
      setForm({ studentId: "", courseId: "", remark: "", actionTaken: "" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({ status: "error", description: err.message || "Failed to log intervention", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ studentId: "", courseId: "", remark: "", actionTaken: "" });
    onClose();
  };

  const selectedStudent = student
    ? `${student.student_name ?? ""} (${student.studentId ?? student.student_id ?? ""})`
    : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Log Instructor Intervention</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {selectedStudent && (
              <Box w="100%" p={3} bg="#F9F0FF" borderRadius="8px" border="1px solid #E9D8FD">
                <Text fontSize="xs" color="gray.500">Student</Text>
                <Text fontSize="sm" fontWeight="600" color="#660066">{selectedStudent}</Text>
                {student?.engagement_status && (
                  <HStack mt={1} spacing={2}>
                    <Text fontSize="xs" color="gray.500">Status:</Text>
                    <Text fontSize="xs" fontWeight="600"
                      color={
                        student.engagement_status === "Active" ? "#1A8F3A"
                          : student.engagement_status === "Irregular" ? "#B7791F"
                          : "#C53030"
                      }
                    >
                      {student.engagement_status}
                    </Text>
                    {student.participation_score != null && (
                      <>
                        <Text fontSize="xs" color="gray.400">·</Text>
                        <Text fontSize="xs" color="gray.500">Score: <strong>{student.participation_score}%</strong></Text>
                      </>
                    )}
                  </HStack>
                )}
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel fontSize="sm">Student</FormLabel>
              <Select
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                size="sm"
                placeholder={studentsLoading ? "Loading students…" : "Select a student…"}
                isDisabled={studentsLoading}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} — {s.email}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Course (optional)</FormLabel>
              <Select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                size="sm"
                placeholder={coursesLoading ? "Loading courses…" : "Select a course…"}
                isDisabled={coursesLoading}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title ?? c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Action Taken</FormLabel>
              <Select
                name="actionTaken"
                value={form.actionTaken}
                onChange={handleChange}
                size="sm"
                placeholder="Select action…"
              >
                {ACTION_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Remark</FormLabel>
              <Textarea
                name="remark"
                value={form.remark}
                onChange={handleChange}
                placeholder="Describe the intervention or follow-up action taken…"
                size="sm"
                rows={4}
                resize="vertical"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Log Intervention
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InterventionModal;
