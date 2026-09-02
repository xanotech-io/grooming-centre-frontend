import { useEffect, useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Box, Flex, SimpleGrid, VStack } from "@chakra-ui/layout";
import { BreadcrumbItem, Divider, Tag, useToast } from "@chakra-ui/react";
import {
  Breadcrumb,
  Button,
  DashboardMetricCard,
  Heading,
  Link,
  Spinner,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { EmptyState } from "../../../../layouts";
import { adminGetStudentParticipationReport } from "../../../../services";

const engagementColorMap = {
  Active: "green",
  Irregular: "yellow",
  Inactive: "red",
};

const StatRow = ({ label, value }) => (
  <Flex justifyContent="space-between" alignItems="center" py={3}>
    <Text fontSize="sm" color="gray.500" fontWeight="500">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight="600" color="#101828">
      {value ?? "—"}
    </Text>
  </Flex>
);

const StudentParticipationDetailsPage = () => {
  const { studentId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminGetStudentParticipationReport(studentId);
      const data = result?.data ?? result;
      setStudent(data);
    } catch (err) {
      const message = err.message || "Unable to fetch student participation data";
      setError(message);
      toast({ status: "error", description: message, duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchStudentData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (loading) {
    return (
      <AdminMainAreaWrapper>
        <Flex h="400px" justifyContent="center" alignItems="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading student participation data...</Text>
        </Flex>
      </AdminMainAreaWrapper>
    );
  }

  if (error || !student) {
    return (
      <AdminMainAreaWrapper>
        <Box my={4}>
          <Breadcrumb
            item2={
              <BreadcrumbItem>
                <Link href="/admin/report/participation-monitoring">
                  Participation Monitoring
                </Link>
              </BreadcrumbItem>
            }
            item3={
              <BreadcrumbItem isCurrentPage>
                <Link href="#">Student Details</Link>
              </BreadcrumbItem>
            }
          />
        </Box>
        <EmptyState
          heading="No participation data found"
          description={error || "This student has no participation records."}
          cta={<Button onClick={fetchStudentData}>Try Again</Button>}
        />
      </AdminMainAreaWrapper>
    );
  }

  const status = student.engagement_status;
  const alertTriggered = student.alert_triggered;
  const activityTypes = Array.isArray(student.activity_type) && student.activity_type.length
    ? student.activity_type.join(" / ")
    : "None";
  const lastActive = student.last_active_date
    ? new Date(student.last_active_date).toLocaleDateString()
    : "—";

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/report/participation-monitoring">
                Participation Monitoring
              </Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{student.student_name ?? "Student Details"}</Link>
            </BreadcrumbItem>
          }
        />
        <Button onClick={fetchStudentData} secondary>
          Refresh
        </Button>
      </Box>

      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        rowGap={3}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            {student.student_name ?? "Student"}
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {student.student_email ?? ""}
          </Text>
        </Box>
        <Flex gap={3} alignItems="center" flexWrap="wrap">
          {alertTriggered && (
            <Tag size="md" borderRadius="full" colorScheme="red" fontWeight="600">
              Alert Triggered
            </Tag>
          )}
          <Tag
            size="md"
            borderRadius="full"
            colorScheme={engagementColorMap[status] ?? "gray"}
            fontWeight="600"
          >
            {status ?? "Unknown"}
          </Tag>
        </Flex>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        <DashboardMetricCard
          title="Participation Score"
          value={`${student.participation_score ?? 0}%`}
          change={status ?? ""}
          changeColor={
            status === "Active" ? "#1A8F3A" : status === "Irregular" ? "#B7791F" : "#C53030"
          }
        />
        <DashboardMetricCard
          title="Frequency of Access"
          value={`${student.frequency_of_access ?? 0}`}
          change="total interactions"
          changeColor="#6B006B"
        />
        <DashboardMetricCard
          title="Days Since Active"
          value={`${student.days_since_active ?? 0}`}
          change={`Last active: ${lastActive}`}
          changeColor={student.days_since_active > 10 ? "#C53030" : "#1A8F3A"}
        />
        <DashboardMetricCard
          title="Activity Types"
          value={activityTypes}
          change="engagement channels"
          changeColor="#6B006B"
        />
      </SimpleGrid>

      {/* Detail cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Activity Breakdown */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading as="h3" fontSize="md" mb={4}>
            Activity Breakdown
          </Heading>
          <VStack align="stretch" divider={<Divider />} spacing={0}>
            <StatRow label="Login Count" value={student.login_count ?? 0} />
            <StatRow label="Quiz Attempts" value={student.quiz_count ?? 0} />
            <StatRow label="Forum Posts" value={student.forum_count ?? 0} />
            <StatRow label="Assignments Submitted" value={student.assignment_count ?? 0} />
          </VStack>
        </Box>

        {/* Engagement Details */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading as="h3" fontSize="md" mb={4}>
            Engagement Details
          </Heading>
          <VStack align="stretch" divider={<Divider />} spacing={0}>
            <StatRow label="Engagement Status" value={status} />
            <StatRow label="Last Active Date" value={lastActive} />
            <StatRow label="Days Since Active" value={student.days_since_active ?? 0} />
            <StatRow label="Alert Triggered" value={alertTriggered ? "Yes" : "No"} />
          </VStack>
        </Box>

        {/* Remarks */}
        {student.remarks && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" gridColumn={{ md: "span 2" }}>
            <Heading as="h3" fontSize="md" mb={3}>
              System Remarks
            </Heading>
            <Box
              bg={alertTriggered ? "red.50" : "green.50"}
              border="1px"
              borderColor={alertTriggered ? "red.200" : "green.200"}
              borderRadius="md"
              p={4}
            >
              <Text fontSize="sm" color={alertTriggered ? "red.700" : "green.700"}>
                {student.remarks}
              </Text>
            </Box>
          </Box>
        )}
      </SimpleGrid>
    </AdminMainAreaWrapper>
  );
};

export const StudentParticipationDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <StudentParticipationDetailsPage {...props} />}
    />
  );
};

export default StudentParticipationDetailsPage;
