import { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { Badge, Select, useToast } from "@chakra-ui/react";
import { Button, Heading, Spinner, Text } from "../../../components";
import { getMyComplianceNotifications } from "../../../services";
import { useCompliancePush } from "../../../hooks";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import dayjs from "dayjs";

const COMPLIANCE_STATUS_OPTIONS = ["Compliant", "Non-Compliant", "Pending"];
const NOTIFICATION_TYPE_OPTIONS = ["Reminder", "Escalation", "Deadline", "Completion"];

const complianceStatusColor = {
  Compliant: "green",
  "Non-Compliant": "red",
  Pending: "yellow",
};

const ComplianceInboxPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState("");
  const [notificationType, setNotificationType] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (complianceStatus) params.complianceStatus = complianceStatus;
      if (notificationType) params.notificationType = notificationType;

      const data = await getMyComplianceNotifications(params);
      const payload = data?.data ?? data ?? {};
      setNotifications(payload.notifications ?? payload.rows ?? []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Unable to fetch your notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [complianceStatus, notificationType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useCompliancePush({
    onNotification: () => {
      toast({ title: "New compliance update received", status: "info", duration: 3000, isClosable: true });
      fetchNotifications();
    },
  });

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>
      <Box mb={6}>
        <Heading as="h1" fontSize="heading.h2" mb={1}>
          Compliance Notifications
        </Heading>
        <Text color="accent.3">
          Track reminders, escalations, and deadlines for your compliance requirements.
        </Text>
      </Box>

      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" p={4} mb={6} shadow="sm">
        <Flex gap={3} flexWrap="wrap" alignItems="flex-end">
          <Box minW="180px">
            <Text as="level5" color="gray.600" mb={1}>Compliance Status</Text>
            <Select
              size="sm"
              borderRadius="md"
              value={complianceStatus}
              onChange={(e) => setComplianceStatus(e.target.value)}
              placeholder="All"
            >
              {COMPLIANCE_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </Box>

          <Box minW="180px">
            <Text as="level5" color="gray.600" mb={1}>Notification Type</Text>
            <Select
              size="sm"
              borderRadius="md"
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              placeholder="All"
            >
              {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </Box>
        </Flex>
      </Box>

      {loading ? (
        <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} color="gray.500">Loading your notifications...</Text>
        </Flex>
      ) : error ? (
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={6} textAlign="center">
          <Text color="red.600" mb={3}>{error}</Text>
          <Button onClick={fetchNotifications}>Try Again</Button>
        </Box>
      ) : notifications.length === 0 ? (
        <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="md" p={10} textAlign="center">
          <Text color="gray.400" fontSize="lg" mb={1}>No notifications found</Text>
          <Text as="level5" color="gray.400">
            {complianceStatus || notificationType
              ? "Try adjusting your filters."
              : "You're all caught up — nothing pending right now."}
          </Text>
        </Box>
      ) : (
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden" shadow="sm">
          {notifications.map((item, idx) => (
            <Flex
              key={item.id ?? idx}
              justifyContent="space-between"
              alignItems="flex-start"
              px={5}
              py={4}
              borderBottom="1px"
              borderColor="gray.100"
              _last={{ borderBottom: "none" }}
              gap={3}
            >
              <Box flex={1}>
                <Text bold color="gray.800" noOfLines={1}>
                  {item.title ?? item.notificationType ?? "Compliance Notification"}
                </Text>
                <Text as="level5" color="gray.600" mt={1}>
                  {item.message ?? item.body ?? "—"}
                </Text>
                <Text as="level5" color="gray.400" mt={1}>
                  {item.courseTitle ?? item.examTitle ?? ""}
                  {item.sentAt ? ` · ${dayjs(item.sentAt).format("DD MMM YYYY, h:mm A")}` : ""}
                </Text>
              </Box>
              <Flex gap={2} flexShrink={0}>
                {item.notificationType && (
                  <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="11px">
                    {item.notificationType}
                  </Badge>
                )}
                {item.complianceStatus && (
                  <Badge
                    colorScheme={complianceStatusColor[item.complianceStatus] ?? "gray"}
                    borderRadius="full"
                    px={2}
                    fontSize="11px"
                  >
                    {item.complianceStatus}
                  </Badge>
                )}
              </Flex>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

export const ComplianceInboxPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ComplianceInboxPage {...props} />} />
);

export default ComplianceInboxPage;
