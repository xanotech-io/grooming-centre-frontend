import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Icon,
  Input,
  useToast,
} from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";
import { adminCreateMISSchedule } from "../../../../services";

const ScheduleReportModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({ frequency: '', day: '', time: '10:00', delivery: 'dashboard' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.frequency) {
      toast({ description: 'Please select a frequency.', status: 'warning', position: 'top' });
      return;
    }
    setSaving(true);
    try {
      const { message } = await adminCreateMISSchedule({
        frequency: form.frequency,
        day: form.day,
        time: form.time,
        deliveryMethod: form.delivery,
      });
      toast({ description: message || 'Schedule saved.', status: 'success', position: 'top' });
      onClose();
    } catch (err) {
      toast({ description: err?.response?.data?.message || 'Failed to save schedule.', status: 'error', position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader fontSize="lg" fontWeight="700" color="#101928">Schedule Report</ModalHeader>
        <ModalCloseButton mt={3} mr={2} />
        <ModalBody>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Schedule Frequency</FormLabel>
              <Select placeholder="Select schedule frequency" size="md" borderRadius="md" fontSize="14px"
                value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Frequency Day</FormLabel>
              <Select placeholder="Every Monday" size="md" borderRadius="md" fontSize="14px"
                value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}>
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
                  <option key={d} value={d}>Every {d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Time</FormLabel>
              <HStack border="1px solid" borderColor="gray.200" borderRadius="md" px={3} py={2} justify="space-between">
                <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} border="none" p={0} fontSize="14px" color="#101928" _focus={{ boxShadow: 'none' }} />
                <Icon as={FiClock} color="gray.400" flexShrink={0} />
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="#344054" mb={2}>Delivery Method</FormLabel>
              <Select size="md" borderRadius="md" fontSize="14px"
                value={form.delivery} onChange={(e) => setForm((f) => ({ ...f, delivery: e.target.value }))}>
                <option value="dashboard">Dashboard</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3} pt={6} pb={4}>
          <Button variant="outline" flex={1} borderColor="#D0D5DD" color="#344054" fontSize="14px" fontWeight="600" onClick={onClose} borderRadius="md" h="44px">Cancel</Button>
          <Button bg="#660066" flex={1} color="white" _hover={{ bg: "#550055" }} fontSize="14px" fontWeight="600" borderRadius="md" h="44px" isLoading={saving} onClick={handleSave}>Save schedule</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleReportModal;
