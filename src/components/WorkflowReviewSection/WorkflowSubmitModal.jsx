import React, { useCallback, useEffect, useState } from 'react';
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
import { FaSitemap } from 'react-icons/fa';
import { Button } from '../Button/Button';
import { Select } from '../Form/Select.jsx';
import { Input } from '../Form/Input/Input';
import { Textarea } from '../Form/Textarea';
import { useFetch } from '../../hooks/useFetch';
import { useApp } from '../../contexts';
import {
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
  description: initialDescription = '',
  attachmentUrl: initialAttachmentUrl = '',
  onSuccess,
}) => {
  const toast = useToast();
  const { state: appState } = useApp();

  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [description, setDescription] = useState(initialDescription);
  const [attachmentUrl, setAttachmentUrl] = useState(initialAttachmentUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resource: supervisorsResource, handleFetchResource: fetchSupervisors } =
    useFetch();

  const supervisorFetcher = useCallback(async () => {
    const { supervisors } = await adminGetWorkflowSupervisors();
    return supervisors;
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSupervisors({ fetcher: supervisorFetcher });
      setDescription(initialDescription);
      setAttachmentUrl(initialAttachmentUrl);
      setSelectedSupervisorId('');
    }
  }, [isOpen, fetchSupervisors, supervisorFetcher, initialDescription, initialAttachmentUrl]);

  const supervisors = supervisorsResource.data ?? [];
  const supervisorOptions = supervisors.map((s) => ({
    label: `${s.firstName} ${s.lastName}`,
    value: s.id,
  }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        request_type: requestType,
        content_id: contentId,
        content_title: contentTitle,
        submitted_by: appState.user?.id,
        description,
        submission_date: new Date().toISOString(),
      };

      if (selectedSupervisorId) payload.supervisor_id = selectedSupervisorId;
      if (attachmentUrl?.trim()) payload.attachment_url = attachmentUrl.trim();

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
          <FormControl mb={5}>
            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
              Assign Supervisor{' '}
              <Text as="span" fontWeight="400" color="#718096">
                (optional)
              </Text>
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
                Could not load supervisors — the system will auto-assign one.
              </Text>
            ) : (
              <Select
                id="wf_supervisor"
                placeholder="Leave blank to auto-assign from your department"
                options={supervisorOptions}
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
              />
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

          {/* Attachment URL */}
          <FormControl>
            <Input
              id="wf_attachment"
              label="Attachment URL (optional)"
              placeholder="https://example.com/files/document.pdf"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
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
