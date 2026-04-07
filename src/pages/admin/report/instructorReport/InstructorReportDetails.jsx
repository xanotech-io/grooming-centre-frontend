import { useState } from "react";
import { Route, useParams, useHistory } from "react-router-dom";
import { Box, Flex, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/react";
import { Button, Heading, Breadcrumb, Link, Text } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { BreadcrumbItem } from "@chakra-ui/react";

const InstructorReportDetails = () => {
    const { instructorId } = useParams();
    const history = useHistory();
    const [selectedReportType, setSelectedReportType] = useState("courseCompletion");

    const handleGenerateReport = () => {
        if (!selectedReportType) return;
        history.push(`/admin/report/instructorReport/${instructorId}/${selectedReportType}`);
    };

    return (
        <AdminMainAreaWrapper>
            <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                <Breadcrumb
                    item2={
                        <BreadcrumbItem>
                            <Link href="/admin/report/instructorReport">Instructors</Link>
                        </BreadcrumbItem>
                    }
                    item3={
                        <BreadcrumbItem isCurrentPage>
                            <Link href="#">Report Details</Link>
                        </BreadcrumbItem>
                    }
                />
                <Box display="flex" gap="8px">
                    <Button secondary onClick={() => { }}>Schedule report</Button>
                    <Button onClick={() => { }}>Export Dashboard</Button>
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
                            <option value="courseCompletion">Course Completion and Pass Rate</option>
                            <option value="instructorPerformance">Instructor Performance</option>
                            <option value="assignmentGrading">Assignment Grading Summary</option>
                            <option value="assignmentAnalysis">Assessment Item Analysis</option>
                        </Select>
                    </Box>
                </VStack>

                <Flex justify="flex-end" mt={10}>
                    <Button onClick={handleGenerateReport}>Generate report</Button>
                </Flex>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const InstructorReportDetailsRoute = ({ ...rest }) => {
    return <Route {...rest} render={(props) => <InstructorReportDetails {...props} />} />;
};

export default InstructorReportDetails;
