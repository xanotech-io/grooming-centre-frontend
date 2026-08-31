import { useEffect, useState } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/react";
import {
  Button,
  Heading,
  Breadcrumb,
  Link,
  Text,
  ExportMenu,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { BreadcrumbItem } from "@chakra-ui/react";
import { adminGetStudentProgressV2 } from "../../../../services";

const REPORT_TYPE_LABELS = {
  progress: "Progress report",
  transcript: "Transcript report",
  attendance: "Attendance report",
  assessment: "Assessment & Quizzes",
  compliance: "Compliance & Training",
};

const StudentReportDetails = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const [selectedReportType, setSelectedReportType] = useState("progress");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);

  const safeStudentId =
    studentId && studentId !== "undefined" ? studentId : null;

  useEffect(() => {
    if (!safeStudentId) return;
    let mounted = true;

    const fetchCourseOptions = async () => {
      try {
        const response = await adminGetStudentProgressV2(safeStudentId);
        const courses = (response?.courses ?? []).map((c) => ({
          id: c.courseId,
          title: c.courseTitle || c.courseId,
        }));
        if (mounted) setCourseOptions(courses);
      } catch {
        if (mounted) setCourseOptions([]);
      }
    };

    fetchCourseOptions();
    return () => {
      mounted = false;
    };
  }, [safeStudentId]);

  const handleGenerateReport = () => {
    if (!selectedReportType || !safeStudentId) return;

    const queryParams = new URLSearchParams();
    if (selectedReportType === "progress" && selectedCourse) {
      queryParams.append("courseId", selectedCourse);
    }

    const queryString = queryParams.toString();
    history.push(
      `/admin/report/studentReport/${safeStudentId}/${selectedReportType}${
        queryString ? `?${queryString}` : ""
      }`,
    );
  };

  const selectedCourseLabel =
    courseOptions.find((c) => c.id === selectedCourse)?.title ||
    (selectedCourse ? selectedCourse : "All Courses");
  const dashboardRows = [
    ["Student ID", "Report Type", "Selected Course"],
    [
      safeStudentId,
      REPORT_TYPE_LABELS[selectedReportType] || selectedReportType,
      selectedCourseLabel,
    ],
    [],
    ["Available Courses"],
    ["Course ID", "Course Title"],
    ...courseOptions.map((c) => [c.id, c.title]),
  ];

  return (
    <AdminMainAreaWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/report/studentReport">Student Progress Report</Link></BreadcrumbItem>}
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Student Report Details</Link>
            </BreadcrumbItem>
          }
        />
        <Box display="flex" gap="8px">
          <Button secondary>Schedule report</Button>
          <ExportMenu
            rows={dashboardRows}
            filename="student-report-details"
            title="Student Report Details"
            isDisabled={!safeStudentId}
          />
        </Box>
      </Box>

      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={4}>
        <Heading as="h2" size="md" mb={6}>
          Report Details
        </Heading>

        <VStack spacing={6} align="stretch" maxW="3xl">
          <Box>
            <Text mb={2} fontWeight="500" fontSize="sm">
              Report Type
            </Text>
            <Select
              bg="gray.50"
              value={selectedReportType}
              onChange={(event) => setSelectedReportType(event.target.value)}
            >
              <option value="progress">Progress report</option>
              <option value="transcript">Transcript report</option>
              <option value="attendance">Attendance report</option>
              <option value="assessment">Assessment & Quizzes</option>
              <option value="compliance">Compliance & Training</option>
            </Select>
          </Box>

          {selectedReportType === "progress" && (
            <Box>
              <Text mb={2} fontWeight="500" fontSize="sm">
                Course
              </Text>
              <Select
                bg="gray.50"
                placeholder="Select course"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
              >
                <option value="">All Courses</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </Box>
          )}
        </VStack>

        <Flex justify="flex-end" gap="10px" mt={10}>
          <Button
            secondary
            onClick={() =>
              history.push(`/admin/student-progress/${safeStudentId}`)
            }
          >
            Full Training Report (TC09)
          </Button>
          <Button onClick={handleGenerateReport}>Generate report</Button>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const StudentReportDetailsRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StudentReportDetails {...props} />} />
  );
};

export default StudentReportDetails;
