import { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, Flex, Text, Spinner, Badge,
} from '@chakra-ui/react';
import { getComplianceNotificationHistory } from '../../../../../services';

const fmtDate = (ts) => (ts ? new Date(ts).toLocaleString() : '—');

const STATUS_COLOR = {
  Sent: 'green',
  Delivered: 'green',
  Failed: 'red',
  Escalated: 'orange',
  Pending: 'gray',
};

const ComplianceHistoryModal = ({ isOpen, onClose, recipient }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !recipient) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { recipientId: recipient.recipientId };
        if (recipient.examId) params.examId = recipient.examId;
        else if (recipient.courseId) params.courseId = recipient.courseId;

        const data = await getComplianceNotificationHistory(params);
        setEntries(data?.data?.history ?? data?.history ?? data?.data ?? []);
      } catch {
        setError('Unable to load notification history.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, recipient]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600" color="#101928">
          Notification History
          {recipient && (
            <Text fontSize="13px" fontWeight="400" color="#475367" mt={1}>
              {recipient.recipientName ?? recipient.recipientId}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner color="#660066" />
            </Flex>
          ) : error ? (
            <Text color="red.500" fontSize="13px" textAlign="center" py={6}>
              {error}
            </Text>
          ) : entries.length === 0 ? (
            <Text color="#475367" fontSize="13px" textAlign="center" py={6}>
              No notification history found for this recipient.
            </Text>
          ) : (
            <Flex direction="column" gap={3}>
              {entries.map((entry, idx) => (
                <Box
                  key={entry.id ?? idx}
                  p={3}
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="md"
                >
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="13px" fontWeight="600" color="#101928">
                      {entry.notificationType ?? entry.type ?? 'Notification'}
                    </Text>
                    <Badge colorScheme={STATUS_COLOR[entry.deliveryStatus] ?? 'gray'} fontSize="10px">
                      {entry.deliveryStatus ?? '—'}
                    </Badge>
                  </Flex>
                  <Text fontSize="12px" color="#475367">
                    {entry.message ?? entry.remarks ?? '—'}
                  </Text>
                  <Text fontSize="11px" color="#98A2B3" mt={1}>
                    {fmtDate(entry.sentAt ?? entry.createdAt)}
                  </Text>
                </Box>
              ))}
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ComplianceHistoryModal;
