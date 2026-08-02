import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Spinner,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Heading, Button } from "../../../components";
import { userGetBadgeProgress } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FaMedal, FaChevronLeft, FaCheckCircle } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

const awardChip = (status) => {
  switch ((status || "").toLowerCase()) {
    case "earned":
      return { label: "Earned", bg: "#E6F4EA", color: "#38A169" };
    case "pending approval":
      return { label: "Pending Approval", bg: "#FFF5EA", color: "#DD6B20" };
    case "in progress":
      return { label: "In Progress", bg: "#EBF4FF", color: "#3182CE" };
    default:
      return { label: "Not Started", bg: "#F7FAFC", color: "#718096" };
  }
};

const BadgeProgressPage = () => {
  const { badgeId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    userGetBadgeProgress(badgeId)
      .then((res) => setData(res?.data || res))
      .catch((err) =>
        setError(
          capitalizeFirstLetter(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load progress",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, [badgeId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  if (error || !data) {
    return (
      <Box
        paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
        paddingY="32px"
      >
        <Text color="red.500" mb="16px">
          {error || "Progress data not found."}
        </Text>
        <Button secondary onClick={() => history.push("/badges")}>
          Back to Badges
        </Button>
      </Box>
    );
  }

  const badge = data.badge || data;
  const pct = data.progressPercentage ?? badge.progressPercentage ?? 0;
  const chip = awardChip(data.awardStatus || badge.awardStatus);
  const isEarned =
    (data.awardStatus || badge.awardStatus || "").toLowerCase() === "earned";
  const remainingCourses = data.remainingCourseList || [];

  return (
    <Box
      paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
      paddingY="32px"
      minH="100vh"
      bg="#F7F9FC"
    >
      {/* Back */}
      <Flex
        as="button"
        alignItems="center"
        gap="6px"
        color="#6b006b"
        mb="24px"
        onClick={() => history.push(`/badges/${badgeId}`)}
        _hover={{ opacity: 0.8 }}
      >
        <FaChevronLeft size={12} />
        <Text fontSize="13px" fontWeight="600">
          Badge Detail
        </Text>
      </Flex>

      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="12px"
        p="32px"
        maxW="600px"
        mx="auto"
      >
        {/* Header */}
        <Flex justifyContent="center" mb="20px">
          {badge.badgeFile ? (
            <Box
              w="96px"
              h="96px"
              borderRadius="50%"
              overflow="hidden"
              border="4px solid #F0E6FF"
            >
              <img
                src={badge.badgeFile}
                alt={badge.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ) : (
            <Box
              w="96px"
              h="96px"
              bg="#F0E6FF"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaMedal color="#6b006b" size={38} />
            </Box>
          )}
        </Flex>

        <Heading
          fontSize="20px"
          fontWeight="700"
          color="#1A202C"
          textAlign="center"
          mb="6px"
        >
          {badge.title}
        </Heading>
        <Flex justifyContent="center" mb="24px">
          <Badge
            bg="#F0E6FF"
            color="#6b006b"
            px="10px"
            py="3px"
            borderRadius="10px"
            textTransform="none"
            fontSize="12px"
          >
            {badge.badgeType}
          </Badge>
        </Flex>

        {/* Required courses count — always visible */}
        <Box
          bg="#F7F9FC"
          border="1px solid #E2E8F0"
          borderRadius="8px"
          p="12px 16px"
          textAlign="center"
          mb="24px"
        >
          <Text fontSize="13px" color="gray.500">
            <Box as="span" fontSize="22px" fontWeight="800" color="#6b006b">
              {badge.requiredCoursesCount ?? 0}
            </Box>{" "}
            required course{badge.requiredCoursesCount !== 1 ? "s" : ""}
          </Text>
        </Box>

        {/* Progress ring */}
        <Flex justifyContent="center" mb="16px">
          <Box
            w="120px"
            h="120px"
            bg={isEarned ? "#E6F4EA" : "#F0E6FF"}
            borderRadius="50%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            border="6px solid"
            borderColor={isEarned ? "#9AE6B4" : "#e0c9e0"}
          >
            <Text
              fontSize="28px"
              fontWeight="900"
              color={isEarned ? "#38A169" : "#6b006b"}
              lineHeight="1"
            >
              {pct.toFixed(0)}%
            </Text>
            <Text fontSize="10px" color="gray.400" mt="2px">
              complete
            </Text>
          </Box>
        </Flex>

        {/* Completed / Total */}
        <Text
          textAlign="center"
          fontSize="14px"
          color="gray.500"
          mb="12px"
        >
          <Box as="span" fontWeight="700" color="#1A202C">
            {data.coursesCompletedSoFar ??
              badge.coursesCompletedSoFar ??
              0}
          </Box>{" "}
          of{" "}
          <Box as="span" fontWeight="700" color="#1A202C">
            {badge.requiredCoursesCount ?? 0}
          </Box>{" "}
          required courses completed
        </Text>

        {/* Status chip */}
        <Flex justifyContent="center" mb="24px">
          <Badge
            bg={chip.bg}
            color={chip.color}
            px="12px"
            py="5px"
            borderRadius="12px"
            textTransform="none"
            fontSize="12px"
            fontWeight="600"
          >
            {chip.label}
          </Badge>
        </Flex>

        {/* Remaining courses */}
        {remainingCourses.length > 0 && (
          <Box>
            <Text
              fontSize="11px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              mb="12px"
            >
              Remaining Courses ({remainingCourses.length})
            </Text>
            <Flex direction="column" gap="8px">
              {remainingCourses.map((course) => (
                <Flex
                  key={course.id}
                  alignItems="center"
                  gap="10px"
                  p="10px 14px"
                  bg="#F7F9FC"
                  borderRadius="8px"
                  border="1px solid #E2E8F0"
                >
                  <FiClock color="#A0AEC0" size={14} />
                  <Text fontSize="13px" color="#1A202C" fontWeight="500">
                    {course.title || course.name}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        )}

        {isEarned && (
          <Flex
            justifyContent="center"
            alignItems="center"
            gap="8px"
            mt="16px"
            p="14px"
            bg="#E6F4EA"
            borderRadius="8px"
          >
            <FaCheckCircle color="#38A169" size={16} />
            <Text fontSize="14px" fontWeight="700" color="#276749">
              All required courses completed — badge earned!
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export const BadgeProgressPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeProgressPage {...props} />} />
);

export default BadgeProgressPageRoute;
