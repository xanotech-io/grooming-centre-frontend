import React, { useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Text, Grid, GridItem } from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import { FaArrowLeft, FaClipboardList } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Button } from "../../../components";

// ─── Mock question data (keyed by questionId) ─────────────────────────────────
const QUESTIONS_DATA = {
    "3": {
        number: 4,
        type: "Essay",
        marks: 5,
        text: "Explain the role of photosynthesis",
        studentAnswer:
            "Lorem ipsum dolor sit amet consectetur. Tellus posuere nulla praesent cursus curabitur vel. Sed in a cras aliquet amet. Nisl eget porttitor ipsum consequat non tincidunt. Mattis in ut condimentum ornare gravida felis quam etiam semper. Dis dignissim elit sed pretium sodales posuere risus. Lectus lectus arcu scelerisque proin. Ac at libero pellentesque ultricies. Fringilla arcu eget nam a. Id montes purus mi amet eu viverra duis commodo. Non tortor mattis et in. Nunc vitae et est suspendisse sodales. Pellentesque urna pellentesque amet viverra tellus sit.",
    },
};

const FALLBACK_QUESTION = {
    number: 4,
    type: "Essay",
    marks: 5,
    text: "Explain the role of photosynthesis",
    studentAnswer:
        "Lorem ipsum dolor sit amet consectetur. Tellus posuere nulla praesent cursus curabitur vel. Sed in a cras aliquet amet. Nisl eget porttitor ipsum consequat non tincidunt. Mattis in ut condimentum ornare gravida felis quam etiam semper. Dis dignissim elit sed pretium sodales posuere risus. Lectus lectus arcu scelerisque proin. Ac at libero pellentesque ultricies. Fringilla arcu eget nam a. Id montes purus mi amet eu viverra duis commodo. Non tortor mattis et in. Nunc vitae et est suspendisse sodales. Pellentesque urna pellentesque amet viverra tellus sit.",
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const GradeQuestionPage = () => {
    const { goBack, push } = useHistory();
    const { examId, studentId, questionId } = useParams();
    const [score, setScore] = useState("-");
    const [feedback, setFeedback] = useState("");

    const question = QUESTIONS_DATA[questionId] || FALLBACK_QUESTION;

    const handleSubmitNext = () => {
        // Navigate forward — for now go back to student exam view
        push(`/admin/examination/${examId}/${studentId}`);
    };

    const handlePrevQuestion = () => {
        goBack();
    };

    return (
        <AdminMainAreaWrapper>
            {/* ── Go Back ─────────────────────────────────── */}
            <Flex
                alignItems="center"
                gap="8px"
                mb={5}
                cursor="pointer"
                onClick={goBack}
                width="fit-content"
                color="#4A5568"
                _hover={{ color: "#1A202C" }}
            >
                <FaArrowLeft size="13px" />
                <Text fontSize="14px" fontWeight="500">Go Back</Text>
            </Flex>

            {/* ── Title + Student info ────────────────────── */}
            <Box mb={6}>
                <Text fontSize="26px" fontWeight="700" color="#1A202C" mb={1}>
                    Data Analysis Exam
                </Text>
                <Flex alignItems="center" gap={4} flexWrap="wrap">
                    <Text fontSize="14px" color="#4A5568">
                        Student:{" "}
                        <Text as="span" fontWeight="700" color="#1A202C">
                            John Doe (#12345)
                        </Text>
                    </Text>
                    <Text fontSize="14px" color="#4A5568">
                        Date Submitted:{" "}
                        <Text as="span" fontWeight="700" color="#1A202C">
                            01-12-2025
                        </Text>
                    </Text>
                </Flex>
            </Box>

            {/* ── Two-column layout ─────────────────────────── */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 320px" }} gap={6} alignItems="start">

                {/* Left: Question + Student answer */}
                <Box
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="10px"
                    p={6}
                >
                    {/* Question header */}
                    <Flex justifyContent="space-between" alignItems="center" mb={4}>
                        <Text fontSize="15px" color="#4A5568" fontWeight="500">
                            Question {question.number} ({question.type})
                        </Text>
                        <Text fontSize="15px" color="#4A5568" fontWeight="500">
                            {question.marks} marks
                        </Text>
                    </Flex>

                    {/* Question text */}
                    <Text fontSize="18px" fontWeight="700" color="#1A202C" mb={5}>
                        {question.text}
                    </Text>

                    {/* Student answer */}
                    <Text fontSize="14px" fontWeight="600" color="#4A5568" mb={3}>
                        Student Answer:
                    </Text>
                    <Text fontSize="14px" color="#4A5568" lineHeight="1.8">
                        {question.studentAnswer}
                    </Text>
                </Box>

                {/* Right: Grading panel */}
                <Box>
                    <Text fontSize="18px" fontWeight="700" color="#1A202C" mb={5}>
                        Grading
                    </Text>

                    {/* Assign score */}
                    <Box mb={5}>
                        <Text fontSize="14px" color="#4A5568" mb={2}>Assign Score</Text>
                        <Flex alignItems="center" gap={2}>
                            <Box
                                as="input"
                                type="text"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                border="1px solid #E2E8F0"
                                borderRadius="6px"
                                px={3}
                                py={2}
                                width="56px"
                                textAlign="center"
                                fontSize="14px"
                                color="#1A202C"
                                bg="#F7FAFC"
                                _focus={{ outline: "none", borderColor: "#6b006b" }}
                            />
                            <Text fontSize="14px" color="#718096" fontWeight="500">
                                /{question.marks}
                            </Text>
                        </Flex>
                    </Box>

                    {/* Feedback / Comment */}
                    <Box>
                        <Text fontSize="14px" color="#4A5568" mb={2}>Feedback/Comment</Text>
                        <Textarea
                            placeholder="Enter feedback...."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            border="1px solid #E2E8F0"
                            borderRadius="8px"
                            bg="#F7FAFC"
                            fontSize="14px"
                            minH="220px"
                            resize="vertical"
                            _focus={{ borderColor: "#6b006b", boxShadow: "none" }}
                            _placeholder={{ color: "#A0AEC0" }}
                        />
                    </Box>
                </Box>
            </Grid>

            {/* ── Bottom navigation ─────────────────────────── */}
            <Flex justifyContent="flex-end" gap={3} mt={8}>
                <Button
                    secondary
                    onClick={handlePrevQuestion}
                    display="flex"
                    alignItems="center"
                    gap="8px"
                    border="1px solid #6b006b"
                    color="#6b006b"
                    bg="white"
                    _hover={{ bg: "#FAF5FF" }}
                >
                    <FaArrowLeft size="12px" />
                    Prev. Question
                </Button>
                <Button
                    onClick={handleSubmitNext}
                    display="flex"
                    alignItems="center"
                    gap="8px"
                    style={{ backgroundColor: "#6b006b", color: "white" }}
                    _hover={{ bg: "#520052" }}
                >
                    <FaClipboardList size="14px" />
                    Submit &amp; Next
                </Button>
            </Flex>
        </AdminMainAreaWrapper>
    );
};

export const GradeQuestionPageRoute = ({ ...rest }) => (
    <Route
        {...rest}
        render={(props) => <GradeQuestionPage {...props} />}
    />
);

export default GradeQuestionPageRoute;
