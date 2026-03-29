import { useState, useEffect } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/react";
import { Button, Heading, Breadcrumb, Link, Text } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { adminGetUserCourseListing } from "../../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";

const StudentReportDetails = () => {
    const { studentId } = useParams();
    const history = useHistory();
    const [courses, setCourses] = useState([]);
    const [selectedReportType, setSelectedReportType] = useState("progress");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                // HARDCODED MOCK COURSES FOR TESTING
                const mockCourses = [
                    { id: "course_1", title: "Microfinance Basics" },
                    { id: "course_2", title: "Advanced Accounting" },
                    { id: "course_3", title: "Business Ethics" }
                ];

                // Simulating network delay
                setTimeout(() => {
                    setCourses(mockCourses);
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error("Failed to fetch student courses", error);
                setLoading(false);
            }
        };
        if (studentId) {
            fetchCourses();
        }
    }, [studentId]);

    const handleGenerateReport = () => {
        if (!selectedReportType) return;

        // Build query params
        const queryParams = new URLSearchParams();
        if (selectedReportType === "progress" && selectedCourse) {
            queryParams.append("courseId", selectedCourse);
        }

        history.push(`/admin/report/studentReport/${studentId}/${selectedReportType}?${queryParams.toString()}`);
    };

    return (
        <AdminMainAreaWrapper>
            <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                <Breadcrumb
                    item2={
                        <BreadcrumbItem>
                            <Link href="/admin/report/studentReport">Learners</Link>
                        </BreadcrumbItem>
                    }
                    item3={
                        <BreadcrumbItem isCurrentPage>
                            <Link href="#">Student Report</Link>
                        </BreadcrumbItem>
                    }
                />
                <Box display={"flex"} gap="8px">
                    <Button secondary onClick={() => { }}>
                        Schedule report
                    </Button>
                    <Button onClick={() => { }}>
                        Export Dashboard
                    </Button>
                </Box>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={4}>
                <Heading as="h2" size="md" mb={6}>
                    Report Details
                </Heading>

                <VStack spacing={6} align="stretch" maxW="3xl">
                    <Box>
                        <Text mb={2} fontWeight="500" fontSize="sm">Report Type</Text>
                        <Select
                            bg="gray.50"
                            value={selectedReportType}
                            onChange={(e) => setSelectedReportType(e.target.value)}
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
                            <Text mb={2} fontWeight="500" fontSize="sm">Course</Text>
                            <Select
                                bg="gray.50"
                                placeholder="Select course"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                isDisabled={loading}
                            >
                                <option value="">All Courses</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </Select>
                        </Box>
                    )}
                </VStack>

                <Flex justify="flex-end" mt={10}>
                    <Button onClick={handleGenerateReport}>Generate report</Button>
                </Flex>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const StudentReportDetailsRoute = ({ ...rest }) => {
    return <Route {...rest} render={(props) => <StudentReportDetails {...props} />} />;
};

export default StudentReportDetails;
