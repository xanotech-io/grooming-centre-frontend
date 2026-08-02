import React from 'react';
import {
  Box,
  Flex,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { Select } from '../Form/Select.jsx';

export const WorkflowReviewSection = ({
  requestReview,
  onToggle,
  selectedSupervisorId,
  onSupervisorChange,
  supervisors = [],
  supervisorsLoading = false,
  supervisorsError = null,
}) => {
  const supervisorOptions = supervisors
    .filter((s) => s.id)
    .map((s) => ({
      label: `${s.firstName} ${s.lastName}`,
      value: s.id,
    }));

  return (
    <Box mt={8}>
      <Divider mb={6} />

      <Text fontSize="15px" fontWeight="700" color="#1A202C" mb={4}>
        Supervisor Review
      </Text>

      {/* Toggle card */}
      <Flex
        align="center"
        justify="space-between"
        bg={requestReview ? '#F7F0FF' : '#F7FAFC'}
        border="1px solid"
        borderColor={requestReview ? '#6b006b' : '#E2E8F0'}
        borderRadius="8px"
        px={5}
        py={4}
        mb={requestReview ? 5 : 0}
        cursor="pointer"
        onClick={onToggle}
        userSelect="none"
      >
        <Box>
          <Text fontWeight="600" fontSize="15px" color="#1A202C" mb="2px">
            Request supervisor review before publishing
          </Text>
          <Text fontSize="13px" color="#718096">
            {requestReview
              ? 'Content will remain unpublished until a supervisor approves it.'
              : 'Skip review — content will be published as soon as you save.'}
          </Text>
        </Box>
        <Switch
          isChecked={requestReview}
          colorScheme="purple"
          size="lg"
          onChange={() => {}}
          onClick={(e) => e.stopPropagation()}
        />
      </Flex>

      {/* Supervisor picker — shown only when toggle is on */}
      {requestReview && (
        <Box
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="8px"
          p={5}
        >
          <Alert
            status="info"
            borderRadius="8px"
            mb={4}
            bg="#EBF8FF"
            border="1px solid #BEE3F8"
            py={2}
          >
            <AlertIcon color="#3182CE" boxSize="16px" />
            <AlertDescription fontSize="13px" color="#2C5282">
              Selecting a supervisor is optional — if left blank the system will
              automatically assign one from your department.
            </AlertDescription>
          </Alert>

          <FormControl>
            <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
              Assign Supervisor{' '}
              <Text as="span" fontWeight="400" color="#718096">
                (optional)
              </Text>
            </FormLabel>

            {supervisorsLoading ? (
              <Flex align="center" gap={3} h="42px">
                <Spinner size="sm" color="#6b006b" />
                <Text fontSize="14px" color="#718096">
                  Loading supervisors...
                </Text>
              </Flex>
            ) : supervisorsError ? (
              <Text fontSize="14px" color="red.500">
                Could not load supervisors. The system will auto-assign one.
              </Text>
            ) : (
              <Select
                id="workflow_supervisor"
                placeholder="Leave blank to auto-assign"
                options={supervisorOptions}
                value={selectedSupervisorId}
                onChange={(e) => onSupervisorChange(e.target.value)}
              />
            )}
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default WorkflowReviewSection;
