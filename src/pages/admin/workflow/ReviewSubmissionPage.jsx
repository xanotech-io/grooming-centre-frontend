import React from 'react';
import { Route, useHistory } from 'react-router-dom';
import {
    Box,
    Flex,
    Grid,
    Text,
    IconButton,
    Badge,
    Image,
    Textarea,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaRegFileAlt, FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { Button, Heading } from '../../../components';

const ReviewSubmissionPage = () => {
    const history = useHistory();

    return (
        <Box paddingX={{ base: "20px", lg: "40px" }} paddingY="30px" bg="#FAFAFA" minHeight="100vh">
            {/* Go Back Button */}
            <Flex alignItems="center" cursor="pointer" onClick={() => history.goBack()} mb="24px" width="max-content">
                <Box border="1px solid #E2E8F0" borderRadius="4px" p="6px" mr="12px" bg="white">
                    <FaArrowLeft color="#1A202C" />
                </Box>
                <Text fontWeight="500" color="#1A202C">Go Back</Text>
            </Flex>

            {/* Header / Title Section */}
            <Flex alignItems="center" mb="24px" gap="16px">
                <Heading as="h1" size="lg" color="#1A202C" m={0}>
                    Review Submission
                </Heading>
                <Badge bg="#FFF5EA" color="#DD6B20" px="16px" py="4px" borderRadius="16px" textTransform="none" fontWeight="500" fontSize="14px">
                    Pending
                </Badge>
            </Flex>

            {/* Metadata Row */}
            <Flex gap="32px" mb="40px" flexWrap="wrap">
                <Text color="#718096" fontSize="14px">Workflow ID: <Text as="span" color="#1A202C" fontWeight="600">WF-0234</Text></Text>
                <Text color="#718096" fontSize="14px">Request Type: <Text as="span" color="#1A202C" fontWeight="600">Content Submission</Text></Text>
                <Text color="#718096" fontSize="14px">Submitted By: <Text as="span" color="#1A202C" fontWeight="600">John Doe</Text></Text>
                <Text color="#718096" fontSize="14px">Date Submitted: <Text as="span" color="#1A202C" fontWeight="600">01-12-2025</Text></Text>
            </Flex>

            {/* Main Content Layout */}
            <Grid templateColumns={{ base: "1fr", lg: "2.5fr 1fr" }} gap="40px" alignItems="start">

                {/* Left Column: Course Details */}
                <Box bg="white" borderRadius="8px" p="30px" shadow="sm">
                    {/* Course Title Link */}
                    <Flex justifyContent="space-between" alignItems="center" mb="24px">
                        <Text fontSize="18px" fontWeight="600" color="#1A202C">Course: Data Analysis</Text>
                        <FaExternalLinkAlt color="#6b006b" cursor="pointer" />
                    </Flex>

                    {/* Lesson Title */}
                    <Text fontSize="20px" fontWeight="600" color="#1A202C" mb="16px">
                        Introduction to Data Analysis
                    </Text>

                    {/* Banner Image */}
                    <Box
                        w="100%"
                        h={{ base: "200px", md: "300px" }}
                        bgGradient="linear(to-r, #1A365D, #2B6CB0)"
                        borderRadius="4px"
                        mb="24px"
                        position="relative"
                        overflow="hidden"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1621501104860-2ff58625298f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Data Analysis graphic"
                            objectFit="cover"
                            w="100%"
                            h="100%"
                            opacity={0.8}
                        />
                    </Box>

                    {/* Description */}
                    <Text fontSize="18px" fontWeight="600" color="#1A202C" mb="12px">
                        Description:
                    </Text>
                    <Text color="#4A5568" fontSize="16px" lineHeight="1.6" mb="32px">
                        Lorem ipsum dolor sit amet consectetur. Tellus posuere nulla praesent cursus
                        curabitur vel. Sed in a cras aliquet amet. Nisl eget porttitor ipsum consequat non
                        tincidunt.
                    </Text>

                    {/* Attachments Section */}
                    <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="16px">
                        Supplementary Attachment:
                    </Text>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
                        {/* Attachment Card Placeholder 1-6 */}
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Flex key={i} border="1px solid #E2E8F0" borderRadius="8px" p="16px" alignItems="center" justifyContent="space-between">
                                <Flex alignItems="center" gap="16px">
                                    <Box bg="#F0F4F8" p="10px" borderRadius="4px">
                                        <FaRegFileAlt size="24px" color="#1A202C" />
                                    </Box>
                                    <Box>
                                        <Text fontSize="14px" fontWeight="500" color="#1A202C" noOfLines={1} mb="4px">
                                            Lesson orientation syllabus.pdf
                                        </Text>
                                        <Text fontSize="12px" color="#A0AEC0">2.4mb</Text>
                                    </Box>
                                </Flex>
                                <IconButton
                                    icon={<FaDownload color="#4A5568" />}
                                    variant="ghost"
                                    aria-label="Download attachment"
                                    size="sm"
                                />
                            </Flex>
                        ))}
                    </Grid>
                </Box>

                {/* Right Column: Approval Action Form */}
                <Box position="sticky" top="30px">
                    <Text fontSize="20px" fontWeight="600" color="#1A202C" mb="20px">
                        Approval Action
                    </Text>

                    <Text fontSize="14px" fontWeight="500" color="#1A202C" mb="12px">
                        Feedback/Comment
                    </Text>

                    <Textarea
                        placeholder="Enter feedback...."
                        bg="#F4F5F7"
                        border="none"
                        borderRadius="8px"
                        minH="300px"
                        p="20px"
                        mb="24px"
                        _focus={{ ring: "2px", ringColor: "#6b006b", border: "none" }}
                    />

                    <Flex flexDirection="column" gap="16px">
                        <Button
                            w="100%"
                            h="50px"
                            style={{ backgroundColor: "#6b006b", color: "white" }}
                            _hover={{ bg: "#520052" }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap="10px"
                        >
                            <FaCheckCircle size="18px" />
                            Approve Content Submission
                        </Button>
                        <Button
                            w="100%"
                            h="50px"
                            variant="outline"
                            borderColor="#E53E3E"
                            color="#E53E3E"
                            style={{ backgroundColor: "#FFF5F5", color: "black" }}
                            display="flex"

                            alignItems="center"
                            justifyContent="center"
                            gap="10px"
                        >
                            <FaTimesCircle size="18px" />
                            Reject Content Submission
                        </Button>
                    </Flex>
                </Box>
            </Grid>
        </Box>
    );
};

export const ReviewSubmissionPageRoute = ({ ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => <ReviewSubmissionPage {...props} />}
        />
    );
};

export default ReviewSubmissionPageRoute;
