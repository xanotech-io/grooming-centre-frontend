import { Box, Flex, Progress, Badge } from "@chakra-ui/react";
import { Heading, Text, SkeletonText } from "..";

const gradeColors = {
  A: { color: "#38A169", bg: "#E6F4EA" },
  B: { color: "#3182CE", bg: "#EBF4FF" },
  C: { color: "#DD6B20", bg: "#FFF5EA" },
  D: { color: "#E53E3E", bg: "#FED7D7" },
  F: { color: "#E53E3E", bg: "#FED7D7" },
};

const getGradeStyle = (grade) => {
  if (!grade) return { color: "primary.base", bg: "accent.1" };
  return gradeColors[grade.charAt(0).toUpperCase()] || { color: "primary.base", bg: "accent.1" };
};

/**
 * Read-only card showing a student's score and instructor remarks on a
 * review-mode page (assessment / courseExam / project).
 */
export const ExamReviewResultCard = ({
  title = "Your Result",
  isLoading,
  totalScore,
  scoreSuffix = "%",
  grade,
  remark,
  emptyRemarkLabel = "Your instructor hasn't left any remarks yet.",
  mb = 6,
}) => {
  if (isLoading) {
    return (
      <Box bg="white" border="1px solid" borderColor="accent.2" borderRadius="md" p={5} mb={mb}>
        <SkeletonText numberOfLines={3} spacing={4} />
      </Box>
    );
  }

  const hasScore = totalScore !== null && totalScore !== undefined;
  const gs = getGradeStyle(grade);

  return (
    <Box bg="white" border="1px solid" borderColor="accent.2" borderRadius="md" p={5} mb={mb}>
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={4}>
        <Heading fontSize="text.level2">{title}</Heading>
        <Flex alignItems="center" gap={3}>
          <Text bold fontSize="24px" color={gs.color}>
            {hasScore ? `${totalScore}${scoreSuffix}` : "Pending"}
          </Text>
          {grade && (
            <Badge bg={gs.bg} color={gs.color} px={2} py="2px" borderRadius="4px" fontSize="13px" fontWeight="700">
              {grade}
            </Badge>
          )}
        </Flex>
      </Flex>

      {hasScore && scoreSuffix === "%" && (
        <Progress
          value={Math.min(Math.max(Number(totalScore) || 0, 0), 100)}
          size="sm"
          borderRadius="4px"
          mb={4}
          sx={{ "& > div": { background: gs.color } }}
        />
      )}

      <Box borderTop="1px solid" borderColor="accent.1" pt={4}>
        <Text as="level5" bold color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">
          Remarks
        </Text>
        <Text color={remark ? undefined : "gray.400"} whiteSpace="pre-wrap">
          {remark || emptyRemarkLabel}
        </Text>
      </Box>
    </Box>
  );
};

export default ExamReviewResultCard;
