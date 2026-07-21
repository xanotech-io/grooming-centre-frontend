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
import { useFetch } from '../../hooks/useFetch';
import { useApp } from '../../contexts';
import {
  adminGetAllDepartmentSupervisors,
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
  departmentId,
  onSuccess,
  onCreate,
  isDismissable = true,
}) => {
  const toast = useToast();
  const { state: appState } = useApp();

  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supervisorError, setSupervisorError] = useState(false);

  const { resource: supervisorsResource, handleFetchResource: fetchSupervisors } =
    useFetch();

  const supervisorFetcher = useCallback(async () => {
    const { supervisors } = courseId
      ? await adminGetDepartmentSupervisors(courseId)
      : departmentId
        ? await adminGetWorkflowSupervisors(departmentId)
        : await adminGetAllDepartmentSupervisors();
    return supervisors;
  }, [courseId, departmentId]);

  useEffect(() => {
    if (isOpen) {
      fetchSupervisors({ fetcher: supervisorFetcher });
      setSelectedSupervisorId('');
      setSupervisorError(false);
    }
  }, [isOpen, fetchSupervisors, supervisorFetcher]);

  const supervisors = Array.isArray(supervisorsResource.data) ? supervisorsResource.data : [];
  const supervisorOptions = supervisors
    .filter((s) => s.id)
    .map((s) => ({
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
      let finalContentId = contentId;
      let finalContentTitle = contentTitle;

      // Nothing has been created yet in this flow — creation only happens
      // once a supervisor is assigned and approval is submitted. The backend
      // requires the supervisor on the create/edit call itself, not just on
      // the later workflow submission, so it's passed through here.
      if (onCreate) {
        const created = await onCreate(selectedSupervisorId);
        finalContentId = created?.id;
        finalContentTitle = created?.title ?? contentTitle;
      }

      const payload = {
        request_type: requestType,
        content_id: finalContentId,
        content_title: finalContentTitle,
        submitted_by: appState.user?.id,
        supervisor_id: selectedSupervisorId,
        submission_date: new Date().toISOString(),
      };

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isCentered
      closeOnOverlayClick={isDismissable}
      closeOnEsc={isDismissable}
    >
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
                {onCreate
                  ? 'This will only be created once you assign a supervisor and submit it for approval.'
                  : isDismissable
                    ? 'Content will be unpublished until a supervisor approves it.'
                    : 'This content was saved as a draft. Assign a supervisor to submit it for approval.'}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        {isDismissable && <ModalCloseButton />}

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
              {requestType}
              {contentId && <>&nbsp;·&nbsp; ID: {contentId}</>}
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
            ) : supervisorOptions.length === 0 ? (
              <Text fontSize="13px" color="red.500">
                No supervisors are available to assign. Contact an admin before submitting.
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
