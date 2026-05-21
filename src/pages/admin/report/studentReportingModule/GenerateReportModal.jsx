import { useState } from "react";
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
  useToast,
} from "@chakra-ui/react";
import { Button, Input } from "../../../../components";
import { tc0804CreateStudentReport } from "../../../../services";

const GenerateReportModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    reportType: "progress",
    remarks: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.studentId.trim()) {
      toast({ status: "warning", description: "Student ID is required", duration: 2500, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      await tc0804CreateStudentReport(form);
      toast({ status: "success", description: "Report generated successfully", duration: 3000, isClosable: true });
      setForm({ studentId: "", reportType: "progress", remarks: "" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({ status: "error", description: err.message || "Failed to generate report", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Generate Student Report</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Student ID</FormLabel>
              <Input
                name="studentId"
                placeholder="e.g. STU-2025-054"
                value={form.studentId}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Report Type</FormLabel>
              <Select name="reportType" value={form.reportType} onChange={handleChange} size="sm">
                <option value="progress">Progress Report</option>
                <option value="participation">Participation Report</option>
                <option value="transcript">Transcript</option>
                <option value="full">Full Report</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Remarks</FormLabel>
              <Textarea
                name="remarks"
                placeholder="Optional remarks..."
                value={form.remarks}
                onChange={handleChange}
                size="sm"
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Generate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GenerateReportModal;
