import { useState, useEffect, useCallback } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Input, Select, Textarea,
  VStack, useToast, Button, Spinner, Flex,
} from '@chakra-ui/react';
import {
  logProctoringEvent,
  adminGetStandaloneExaminationListing,
  adminGetUserListing,
} from '../../../../../services';
import EntityCombobox from '../../components/EntityCombobox';

const INITIAL = {
  examId: '',
  studentId: '',
  alertType: 'warning',
  description: '',
  sessionStart: '',
  sessionEnd: '',
};

const LogEventModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingOptions(true);
    adminGetStandaloneExaminationListing({ limit: 200 })
      .then((examRes) => setExams(examRes.examinations ?? []))
      .catch(() => {
        toast({ title: 'Failed to load options', status: 'error', duration: 3000, isClosable: true });
      })
      .finally(() => setLoadingOptions(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchStudentOptions = useCallback(async (query) => {
    const res = await adminGetUserListing({ role: 'student', search: query, limit: 50 });
    return (res.users ?? []).map((u) => ({
      id: u.id,
      label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      sublabel: u.email ?? null,
    }));
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.examId || !form.studentId || !form.description) {
      toast({ title: 'Fill in required fields', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      await logProctoringEvent({
        examId: form.examId,
        studentId: form.studentId,
        alertType: form.alertType,
        description: form.description,
        sessionStart: form.sessionStart || undefined,
        sessionEnd: form.sessionEnd || undefined,
      });
      toast({ title: 'Event logged successfully', status: 'success', duration: 3000, isClosable: true });
      setForm(INITIAL);
      onClose();
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to log event', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600" color="#101928">Log Proctoring Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loadingOptions ? (
            <Flex justify="center" py={8}>
              <Spinner color="#660066" />
            </Flex>
          ) : (
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="13px" color="#344054">Examination</FormLabel>
                <Select name="examId" value={form.examId} onChange={handleChange} size="sm" placeholder="Select examination">
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>{exam.title}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="13px" color="#344054">Student</FormLabel>
                <EntityCombobox
                  fetchFn={fetchStudentOptions}
                  value={form.studentId}
                  onSelect={(opt) => setForm((p) => ({ ...p, studentId: opt ? opt.id : '' }))}
                  placeholder="Search student by name or email..."
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="#344054">Alert Type</FormLabel>
                <Select name="alertType" value={form.alertType} onChange={handleChange} size="sm">
                   <option value="compliance">Compliance</option>
                  <option value="warning">Warning</option>
                  <option value="violation">Violation</option>
                  <option value="system_flag">System Flag</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="#344054">Description</FormLabel>
                <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the event..." size="sm" rows={3} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="#344054">Session Start</FormLabel>
                <Input name="sessionStart" type="datetime-local" value={form.sessionStart} onChange={handleChange} size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="#344054">Session End</FormLabel>
                <Input name="sessionEnd" type="datetime-local" value={form.sessionEnd} onChange={handleChange} size="sm" />
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            bg="#660066"
            color="white"
            _hover={{ bg: '#550055' }}
            isLoading={saving}
            isDisabled={loadingOptions}
            onClick={handleSubmit}
          >
            Log Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogEventModal;
