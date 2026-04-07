
import { Route } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Tag } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Button } from "../../../components";

// ─── Mock questions ────────────────────────────────────────────────────────────
const MOCK_QUESTIONS = [
    {
        number: 1,
        type: "Multiple -choice",
        gradeStatus: "Auto-graded",
        text: "Select the odd one out of the following",
        score: "5",
        maxScore: "5",
    },
    {
        number: 2,
        type: "True / False",
        gradeStatus: "Auto-graded",
        text: "Explain the role of photosynthesis",
        score: "5",
        maxScore: "5",
    },
    {
        number: 3,
        type: "Essay / Descriptive",
        gradeStatus: "Needs grading",
        text: "Explain the role of photosynthesis",
        score: null,
        maxScore: "5",
    },
    {
        number: 4,
        type: "Essay / Descriptive",
        gradeStatus: "Needs grading",
        text: "Explain the role of photosynthesis",
        score: null,
        maxScore: "5",
    },
    {
        number: 5,
        type: "Fill in the blank",
        gradeStatus: "Needs grading",
        text: "Explain the role of photosynthesis",
        score: null,
        maxScore: "5",
    },
];

// ─── Badge configs ─────────────────────────────────────────────────────────────
// const TYPE_BADGE = { bg: "#F0E6FF", color: "#6b006b" };
// const GRADE_STATUS = {
//     "Auto-graded": { bg: "#F0FFF4", color: "#38A169" },
//     "Needs grading": { bg: "#FFFAF0", color: "#DD6B20" },
// };

// ─── Small pill badge ─────────────────────────────────────────────────────────
const Pill = ({ label, bg, color }) => (
    <Tag
        size="sm"
        borderRadius="full"
        px={3}
        py="2px"
        bg={bg}
        color={color}
        fontWeight="500"
        fontSize="12px"
        whiteSpace="nowrap"
    >
        {label}
    </Tag>
);

// ─── Single question row ───────────────────────────────────────────────────────
const QuestionRow = ({ q }) => {
    const isNeedsGrading = q.gradeStatus === "Needs grading";

    // Status badges matching the screenshot directly
    const getGradeConfig = (status) => {
        if (status === "Auto-graded") return { bg: "transparent", color: "#38A169" };
        return { bg: "transparent", color: "#DD6B20" };
    };

    // Determine the type pill styling
    const getTypeConfig = () => {
        return { bg: "#F0E6FF", color: "#6b006b" };
    };

    const gradeConfig = getGradeConfig(q.gradeStatus);
    const scoreDisplay = q.score !== null ? `${q.score} / ${q.maxScore} pts` : `-- / ${q.maxScore} pts`;

    return (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p={6} mb={4}>
            <Flex justifyContent="space-between" alignItems="flex-start">
                {/* Left side */}
                <Box>
                    <Flex alignItems="center" gap={4} mb={3}>
                        <Text fontWeight="600" fontSize="18px" color="#1A202C">
                            Question {q.number}
                        </Text>
                        <Pill label={q.type} {...getTypeConfig()} />
                        <Pill label={q.gradeStatus} bg={gradeConfig.bg} color={gradeConfig.color} />
                    </Flex>
                    <Text fontSize="16px" color="#1A202C">
                        {q.text}
                    </Text>
                </Box>

                {/* Right side */}
                <Flex direction="column" alignItems="flex-end" ml={8} minW="160px">
                    <Text
                        fontSize="18px"
                        fontWeight="600"
                        color={q.score !== null && !isNeedsGrading ? "#38A169" : "#4A5568"}
                        mb={isNeedsGrading ? 4 : 0}
                    >
                        {scoreDisplay}
                    </Text>
                    {isNeedsGrading && (
                        <Button
                            style={{ backgroundColor: "#6b006b", color: "white" }}
                            _hover={{ bg: "#520052" }}
                            size="sm"
                            borderRadius="6px"
                            fontSize="14px"
                            px={6}
                        >
                            Grade Question
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SingleExaminationPage = () => {
    const { goBack } = useHistory();

    return (
        <AdminMainAreaWrapper>
            {/* ── Go Back ─────────────────────────────────── */}
            <Flex
                alignItems="center"
                cursor="pointer"
                onClick={goBack}
                mb="24px"
                width="max-content"
            >
                <Box border="1px solid #E2E8F0" borderRadius="4px" p="6px" mr="12px" bg="white">
                    <FaArrowLeft color="#1A202C" />
                </Box>
                <Text fontWeight="500" color="#1A202C">Go Back</Text>
            </Flex>

            {/* ── Title row ──────────────────────────────── */}
            <Flex
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                gap={4}
                mb={6}
            >
                <Box>
                    <Text fontSize="28px" fontWeight="600" color="#1A202C" mb={2}>
                        Data Analysis Exam single
                    </Text>
                    <Text fontSize="16px" fontWeight="600" color="#4A5568">
                        Section B | Fall Semester
                    </Text>
                </Box>

                <Flex gap={4}>
                    <Flex
                        border="1px solid #E2E8F0"
                        borderRadius="10px"
                        px={4}
                        py={3}
                        bg="white"
                        alignItems="center"
                    >
                        <Text fontSize="16px" color="#4A5568">
                            Marking mode:{" "}
                            <Text as="span" fontWeight="500" color="#1A202C">
                                Hybrid (Manual + Automatic)
                            </Text>
                        </Text>
                    </Flex>
                    <Flex
                        border="1px solid #E2E8F0"
                        borderRadius="10px"
                        px={4}
                        py={3}
                        bg="white"
                        alignItems="center"
                    >
                        <Text fontSize="16px" color="#4A5568">
                            Submissions:{" "}
                            <Text as="span" fontWeight="500" color="#1A202C">
                                45/45
                            </Text>
                        </Text>
                    </Flex>
                </Flex>
            </Flex>

            {/* ── Student info card ──────────────────────── */}
            <Box
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="10px"
                p={6}
                mb={8}
            >
                <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
                    {/* Left: student details */}
                    <Box>
                        <Text fontSize="22px" fontWeight="600" color="#1A202C" mb={2}>
                            John Doe
                        </Text>
                        <Flex gap={4} alignItems="center">
                            <Text fontSize="14px" color="#718096">
                                ID:{" "}
                                <Text as="span" fontWeight="600" color="#1A202C">
                                    #12345
                                </Text>
                            </Text>
                            <Text fontSize="14px" color="#718096">
                                Date Submitted:{" "}
                                <Text as="span" fontWeight="600" color="#1A202C">
                                    01-12-2025 | 10:30am
                                </Text>
                            </Text>
                        </Flex>
                    </Box>

                    {/* Right: scores */}
                    <Flex gap={4}>
                        <Box border="1px solid #E2E8F0" borderRadius="10px" p={4} textAlign="left" minW="130px">
                            <Text fontSize="15px" color="#4A5568" mb={2}>Auto Score:</Text>
                            <Text fontSize="20px" fontWeight="600" color="#1A202C">40/100pts</Text>
                        </Box>
                        <Box border="1px solid #E2E8F0" borderRadius="10px" p={4} textAlign="left" minW="130px">
                            <Text fontSize="15px" color="#4A5568" mb={2}>Manual Score:</Text>
                            <Text fontSize="20px" fontWeight="600" color="#1A202C">10/100pts</Text>
                        </Box>
                    </Flex>
                </Flex>
            </Box>

            {/* ── Questions list ─────────────────────────── */}
            <Box>
                {MOCK_QUESTIONS.map((q) => (
                    <QuestionRow key={q.number} q={q} />
                ))}
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const SingleExaminationPageRoute = ({ ...rest }) => (
    <Route
        {...rest}
        render={(props) => <SingleExaminationPage {...props} />}
    />
);

export default SingleExaminationPageRoute;
