import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Spinner,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { FaUserCheck } from 'react-icons/fa';
import { Button } from '../../../../../components/Button/Button';
import { Select } from '../../../../../components/Form/Select';
import { adminGetInstructorReportDirectory, adminReassignCourse } from '../../../../../services';
import { capitalizeFirstLetter } from '../../../../../utils';

const ReassignInstructorModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const toast = useToast();

  const [instructors, setInstructors] = useState([]);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInstructors = useCallback(async () => {
    setIsLoadingInstructors(true);
    try {
      const result = await adminGetInstructorReportDirectory({ limit: 200 });
      setInstructors(result?.data ?? []);
    } catch {
      setInstructors([]);
    } finally {
      setIsLoadingInstructors(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedInstructorId('');
      fetchInstructors();
    }
  }, [isOpen, fetchInstructors]);

  const instructorOptions = instructors.map((u) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.id,
  }));

  const handleSubmit = async () => {
    if (!selectedInstructorId) {
      toast({ description: 'Please select an instructor.', position: 'top', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { message } = await adminReassignCourse(courseId, {
        reassignedInstructorId: selectedInstructorId,
      });
      toast({
        description: capitalizeFirstLetter(message ?? 'Course reassigned successfully.'),
        position: 'top',
        status: 'success',
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message ?? 'Something went wrong.'),
        position: 'top',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={3}>
            <Box
              bg="#F7F0FF"
              p="8px"
              borderRadius="8px"
              display="flex"
              alignItems="center"
            >
              <FaUserCheck color="#6b006b" size="18px" />
            </Box>
            <Box>
              <Text fontSize="17px" fontWeight="700" color="#1A202C">
                Assign Instructor
              </Text>
              <Text fontSize="13px" fontWeight="400" color="#718096">
                Reassign this course to another instructor.
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
              Select Instructor
            </FormLabel>

            {isLoadingInstructors ? (
              <Flex align="center" gap={3} h="42px">
                <Spinner size="sm" color="#6b006b" />
                <Text fontSize="14px" color="#718096">
                  Loading instructors...
                </Text>
              </Flex>
            ) : (
              <Select
                id="reassign_instructor"
                placeholder="Select an instructor"
                options={instructorOptions}
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
              />
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button secondary onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: '#6b006b', color: 'white' }}
            isLoading={isSubmitting}
            disabled={!selectedInstructorId}
            onClick={handleSubmit}
          >
            Assign Instructor
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReassignInstructorModal;
