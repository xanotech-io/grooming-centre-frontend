import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Select, Textarea, Input,
  VStack, useToast, Button,
} from '@chakra-ui/react';
import { auditTrailV2PostLog } from '../../../../../services/http/endpoints/auditTrailV2';

const EVENT_TYPES = ['login', 'logout', 'create', 'update', 'delete', 'approve', 'export', 'view'];
const MODULES = ['LMS', 'OES', 'Admin', 'Security'];

const INITIAL = {
  eventType: '',
  module: '',
  resourceId: '',
  resourceType: '',
  status: 'success',
  remarks: '',
};

const LogAuditEventModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.eventType || !form.module) {
      toast({ title: 'Event type and module are required', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        eventType: form.eventType,
        module: form.module,
        status: form.status,
        remarks: form.remarks || undefined,
        resourceId: form.resourceId || undefined,
        resourceType: form.resourceType || undefined,
      };
      await auditTrailV2PostLog(payload);
      toast({ title: 'Audit event logged', status: 'success', duration: 3000, isClosable: true });
      setForm(INITIAL);
      onClose();
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to log event', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600" color="#101928">Log Audit Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="#344054">Event Type</FormLabel>
              <Select name="eventType" value={form.eventType} onChange={handleChange} size="sm" placeholder="Select event type">
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="13px" color="#344054">Module</FormLabel>
              <Select name="module" value={form.module} onChange={handleChange} size="sm" placeholder="Select module">
                {MODULES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Status</FormLabel>
              <Select name="status" value={form.status} onChange={handleChange} size="sm">
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Resource ID</FormLabel>
              <Input name="resourceId" value={form.resourceId} onChange={handleChange} size="sm" placeholder="Optional UUID" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Resource Type</FormLabel>
              <Input name="resourceType" value={form.resourceType} onChange={handleChange} size="sm" placeholder="e.g. Course, User" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="#344054">Remarks</FormLabel>
              <Textarea name="remarks" value={form.remarks} onChange={handleChange} size="sm" placeholder="Additional notes..." rows={3} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button size="sm" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            size="sm"
            bg="#660066"
            color="white"
            _hover={{ bg: '#550055' }}
            isLoading={saving}
            onClick={handleSubmit}
          >
            Log Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogAuditEventModal;
