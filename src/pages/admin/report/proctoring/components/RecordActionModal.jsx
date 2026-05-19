import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Select, Textarea, VStack,
  useToast, Button, Text,
} from '@chakra-ui/react';
import { recordProctoringAction } from '../../../../../services';

const INITIAL = { actionTaken: 'warning_issued', remarks: '', updatedStatus: 'resolved' };

const RecordActionModal = ({ isOpen, onClose, event, onSuccess }) => {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await recordProctoringAction(event?.id, form);
      toast({ title: 'Action recorded', status: 'success', duration: 3000, isClosable: true });
      setForm(INITIAL);
      onClose();
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to record action', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600" color="#101928">Record Proctor Action</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {event && (
            <Text fontSize="13px" color="#475367" mb={4}>
              Event: <b>{event.description}</b> — {event.student?.firstName} {event.student?.lastName}
            </Text>
          )}
          <VStack spacing={4}>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Action Taken</FormLabel>
              <Select name="actionTaken" value={form.actionTaken} onChange={handleChange} size="sm">
                <option value="warning_issued">Warning Issued</option>
                <option value="exam_paused">Exam Paused</option>
                <option value="exam_suspended">Exam Suspended</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Remarks</FormLabel>
              <Textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Notes or observations..." size="sm" rows={3} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Updated Status</FormLabel>
              <Select name="updatedStatus" value={form.updatedStatus} onChange={handleChange} size="sm">
                <option value="resolved">Resolved</option>
                <option value="active">Active</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" bg="#660066" color="white" _hover={{ bg: '#550055' }} isLoading={saving} onClick={handleSubmit}>
            Save Action
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RecordActionModal;
