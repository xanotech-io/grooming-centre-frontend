import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  Divider,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { FaPaperclip, FaSitemap, FaTimes } from 'react-icons/fa';
import { Button } from '../Button/Button';
import { Select } from '../Form/Select.jsx';
import { Textarea } from '../Form/Textarea';
import { useFetch } from '../../hooks/useFetch';
import { useApp } from '../../contexts';
import {
  adminGetDepartmentSupervisors,
  adminGetWorkflowSupervisors,
  adminSubmitWorkflow,
} from '../../services';
import { capitalizeFirstLetter } from '../../utils';

export const WorkflowSubmitModal = ({
  isOpen,
  onClose,
  contentId,
  contentTitle,
  requestType,
  courseId,
  description: initialDescription = '',
  onSuccess,
}) => {
  const toast = useToast();
  const { state: appState } = useApp();

  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [description, setDescription] = useState(initialDescription);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supervisorError, setSupervisorError] = useState(false);
  const fileInputRef = useRef(null);

  const { resource: supervisorsResource, handleFetchResource: fetchSupervisors } =
    useFetch();

  const supervisorFetcher = useCallback(async () => {
    const { supervisors } = courseId
      ? await adminGetDepartmentSupervisors(courseId)
      : await adminGetWorkflowSupervisors();
    return supervisors;
  }, [courseId]);

  useEffect(() => {
    if (isOpen) {
      fetchSupervisors({ fetcher: supervisorFetcher });
      setDescription(initialDescription);
      setAttachmentFile(null);
      setSelectedSupervisorId('');
      setSupervisorError(false);
    }
  }, [isOpen, fetchSupervisors, supervisorFetcher, initialDescription]);

  const supervisors = Array.isArray(supervisorsResource.data) ? supervisorsResource.data : [];
  const supervisorOptions = supervisors.map((s) => ({
    label: `${s.firstName} ${s.lastName}`,
    value: s.id,
  }));

  const handleSubmit = async () => {
    if (!selectedSupervisorId) {
      setSupervisorError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        request_type: requestType,
        content_id: contentId,
        content_title: contentTitle,
        submitted_by: appState.user?.id,
        supervisor_id: selectedSupervisorId,
        description,
        submission_date: new Date().toISOString(),
      };

      if (attachmentFile) payload.attachment_file = attachmentFile;

      const { message } = await adminSubmitWorkflow(payload);

      toast({
        description: capitalizeFirstLetter(
          message ?? 'Submitted for approval successfully.',
        ),
        position: 'top',
        status: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(
          err.message ?? 'Something went wrong.',
        ),
        position: 'top',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
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
              <FaSitemap color="#6b006b" size="18px" />
            </Box>
            <Box>
              <Text fontSize="17px" fontWeight="700" color="#1A202C">
                Submit for Approval
              </Text>
              <Text fontSize="13px" fontWeight="400" color="#718096">
                Content will be unpublished until a supervisor approves it.
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* Content summary */}
          <Box
            bg="#F7FAFC"
            border="1px solid #E2E8F0"
            borderRadius="8px"
            px={4}
            py={3}
            mb={5}
          >
            <Text fontSize="13px" color="#718096" mb="2px">
              Content being submitted
            </Text>
            <Text fontSize="14px" fontWeight="600" color="#1A202C">
              {contentTitle}
            </Text>
            <Text fontSize="12px" color="#A0AEC0" mt="2px">
              {requestType} &nbsp;·&nbsp; ID: {contentId}
            </Text>
          </Box>

          {/* Supervisor */}
          <FormControl mb={5} isRequired isInvalid={supervisorError}>
            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
              Assign Supervisor
            </FormLabel>

            {supervisorsResource.loading ? (
              <Flex align="center" gap={3} h="42px">
                <Spinner size="sm" color="#6b006b" />
                <Text fontSize="14px" color="#718096">
                  Loading supervisors...
                </Text>
              </Flex>
            ) : supervisorsResource.err ? (
              <Text fontSize="13px" color="red.500">
                Could not load supervisors.
              </Text>
            ) : (
              <Select
                id="wf_supervisor"
                placeholder="Select a supervisor"
                options={supervisorOptions}
                value={selectedSupervisorId}
                onChange={(e) => {
                  setSelectedSupervisorId(e.target.value);
                  setSupervisorError(false);
                }}
              />
            )}
            {supervisorError && (
              <Text fontSize="12px" color="red.500" mt={1}>
                Please select a supervisor.
              </Text>
            )}
          </FormControl>

          <Divider mb={5} />

          {/* Description */}
          <FormControl mb={4}>
            <Textarea
              id="wf_description"
              label="Description"
              placeholder="Describe what you are submitting for review..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minHeight="100px"
            />
          </FormControl>

          {/* Attachment file */}
          <FormControl>
            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
              Attachment{' '}
              <Text as="span" fontWeight="400" color="#718096">
                (optional)
              </Text>
            </FormLabel>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => setAttachmentFile(e.target.files[0] ?? null)}
            />
            {attachmentFile ? (
              <Flex
                align="center"
                gap={2}
                px={3}
                py={2}
                border="1px solid #CBD5E0"
                borderRadius="6px"
                bg="#F7FAFC"
              >
                <FaPaperclip size="13px" color="#718096" />
                <Text fontSize="13px" color="#1A202C" flex={1} noOfLines={1}>
                  {attachmentFile.name}
                </Text>
                <Box
                  as="button"
                  type="button"
                  onClick={() => {
                    setAttachmentFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  color="#A0AEC0"
                  _hover={{ color: '#E53E3E' }}
                  lineHeight={1}
                >
                  <FaTimes size="12px" />
                </Box>
              </Flex>
            ) : (
              <Box
                as="button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                border="1px dashed #CBD5E0"
                borderRadius="6px"
                bg="white"
                color="#718096"
                fontSize="13px"
                width="100%"
                _hover={{ borderColor: '#6b006b', color: '#6b006b' }}
              >
                <FaPaperclip size="13px" />
                Click to attach a file
              </Box>
            )}
          </FormControl>

          {/* Info alert */}
          <Alert
            status="warning"
            borderRadius="8px"
            mt={5}
            bg="#FFFBEB"
            border="1px solid #F6E05E"
            py={2}
          >
            <AlertIcon color="#D69E2E" boxSize="16px" />
            <AlertDescription fontSize="13px" color="#744210">
              Once submitted, this content cannot be published until the
              assigned supervisor approves it.
            </AlertDescription>
          </Alert>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button secondary onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: '#6b006b', color: 'white' }}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Submit for Approval
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WorkflowSubmitModal;
