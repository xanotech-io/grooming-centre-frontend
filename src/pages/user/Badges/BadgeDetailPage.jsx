import React, { useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Spinner,
  Text,
  Badge,
  Progress,
} from "@chakra-ui/react";
import { Button } from "../../../components";
import { userGetBadgeById } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FaMedal, FaChevronLeft, FaCheckCircle } from "react-icons/fa";
import { FiClock, FiExternalLink } from "react-icons/fi";

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

const BadgeDetailPage = () => {
  const { badgeId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [badge, setBadge] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    userGetBadgeById(badgeId)
      .then((res) => setBadge(res?.data || res?.badge || res))
      .catch((err) =>
        setError(
          capitalizeFirstLetter(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load badge",
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

  if (error || !badge) {
    return (
      <Box
        paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
        paddingY="32px"
      >
        <Text color="red.500" mb="16px">
          {error || "Badge not found."}
        </Text>
        <Button secondary onClick={() => history.push("/badges")}>
          Back to Badges
        </Button>
      </Box>
    );
  }

  const chip = awardChip(badge.awardStatus);
  const pct = badge.progressPercentage ?? 0;
  const isEarned = (badge.awardStatus || "").toLowerCase() === "earned";
  const isPending =
    (badge.awardStatus || "").toLowerCase() === "pending approval";

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
        onClick={() => history.push("/badges")}
        _hover={{ opacity: 0.8 }}
      >
        <FaChevronLeft size={12} />
        <Text fontSize="13px" fontWeight="600">
          All Badges
        </Text>
      </Flex>

      {/* Earned banner */}
      {isEarned && (
        <Box
          bg="#E6F4EA"
          border="1px solid #9AE6B4"
          borderRadius="12px"
          p="16px 20px"
          mb="20px"
        >
          <Flex alignItems="center" gap="10px">
            <FaCheckCircle color="#38A169" size={18} />
            <Box>
              <Text fontSize="14px" fontWeight="700" color="#276749">
                Badge Earned!
              </Text>
              {badge.awardDate && (
                <Text fontSize="12px" color="#38A169">
                  Awarded on{" "}
                  {new Date(badge.awardDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              )}
            </Box>
            {badge.badgeFile && (
              <Box
                as="a"
                href={badge.badgeFile}
                target="_blank"
                rel="noopener noreferrer"
                ml="auto"
              >
                <Flex
                  alignItems="center"
                  gap="4px"
                  color="#38A169"
                  fontSize="12px"
                  fontWeight="600"
                >
                  <FiExternalLink size={13} />
                  Download Badge
                </Flex>
              </Box>
            )}
          </Flex>
        </Box>
      )}

      {/* Pending banner */}
      {isPending && (
        <Box
          bg="#FFF5EA"
          border="1px solid #FBBF24"
          borderRadius="12px"
          p="16px 20px"
          mb="20px"
        >
          <Flex alignItems="center" gap="10px">
            <FiClock color="#DD6B20" size={18} />
            <Text fontSize="14px" fontWeight="600" color="#DD6B20">
              Awaiting Admin Approval — your completion has been recorded and
              is under review.
            </Text>
          </Flex>
        </Box>
      )}

      <Flex gap="24px" flexDirection={{ base: "column", lg: "row" }}>
        {/* Left: badge image + meta */}
        <Box
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="12px"
          p="28px"
          w={{ base: "100%", lg: "300px" }}
          flexShrink={0}
          textAlign="center"
        >
          {badge.badgeFile ? (
            <Box
              w="120px"
              h="120px"
              mx="auto"
              borderRadius="50%"
              overflow="hidden"
              border="4px solid #F0E6FF"
              mb="16px"
            >
              <img
                src={badge.badgeFile}
                alt={badge.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ) : (
            <Box
              w="120px"
              h="120px"
              bg="#F0E6FF"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb="16px"
            >
              <FaMedal color="#6b006b" size={44} />
            </Box>
          )}

          <Text fontSize="18px" fontWeight="700" color="#1A202C" mb="8px">
            {badge.title}
          </Text>
          <Badge
            bg="#F0E6FF"
            color="#6b006b"
            px="10px"
            py="3px"
            borderRadius="10px"
            textTransform="none"
            fontSize="12px"
            mb="16px"
          >
            {badge.badgeType}
          </Badge>

          <Box h="1px" bg="#E2E8F0" mb="16px" />

          <Flex direction="column" gap="10px" textAlign="left">
            <Flex justifyContent="space-between">
              <Text fontSize="12px" color="gray.500">
                Issuing Authority
              </Text>
              <Text fontSize="12px" fontWeight="600" color="#1A202C">
                {badge.issuingAuthority || "—"}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="12px" color="gray.500">
                Validation
              </Text>
              <Text
                fontSize="12px"
                fontWeight="600"
                color="#1A202C"
                textTransform="capitalize"
              >
                {badge.validationMethod}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="12px" color="gray.500">
                Required Courses
              </Text>
              <Text fontSize="12px" fontWeight="700" color="#6b006b">
                {badge.requiredCoursesCount ?? 0}
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Right: description + progress + course list */}
        <Box flex={1} display="flex" flexDirection="column" gap="16px">
          {/* Description */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p="24px">
            <Text
              fontSize="11px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              mb="8px"
            >
              Description
            </Text>
            <Text fontSize="14px" color="#1A202C" lineHeight="1.7">
              {badge.description || "No description provided."}
            </Text>
          </Box>

          {/* Progress */}
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p="24px">
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <Text
                fontSize="11px"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Your Progress
              </Text>
              <Badge
                bg={chip.bg}
                color={chip.color}
                px="10px"
                py="3px"
                borderRadius="10px"
                textTransform="none"
                fontSize="11px"
                fontWeight="600"
              >
                {chip.label}
              </Badge>
            </Flex>

            <Flex alignItems="center" gap="16px" mb="12px">
              <Box
                w="70px"
                h="70px"
                bg={isEarned ? "#E6F4EA" : "#F0E6FF"}
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text
                  fontSize="18px"
                  fontWeight="900"
                  color={isEarned ? "#38A169" : "#6b006b"}
                >
                  {pct.toFixed(0)}%
                </Text>
              </Box>
              <Box flex={1}>
                <Progress
                  value={pct}
                  size="sm"
                  borderRadius="4px"
                  mb="8px"
                  sx={{
                    "& > div": {
                      background: isEarned ? "#38A169" : "#6b006b",
                    },
                  }}
                />
                <Flex justifyContent="space-between">
                  <Text fontSize="12px" color="gray.500">
                    {badge.coursesCompletedSoFar ?? 0} of{" "}
                    {badge.requiredCoursesCount ?? 0} courses completed
                  </Text>
                  {badge.remainingCourses != null &&
                    badge.remainingCourses > 0 && (
                      <Text fontSize="12px" color="gray.400">
                        {badge.remainingCourses} remaining
                      </Text>
                    )}
                </Flex>
              </Box>
            </Flex>
          </Box>

          {/* Required courses */}
          {(badge.requiredCourseList || []).length > 0 && (
            <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p="24px">
              <Text
                fontSize="11px"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                mb="16px"
              >
                Required Courses ({badge.requiredCoursesCount ?? 0})
              </Text>
              <Flex direction="column" gap="10px">
                {badge.requiredCourseList.map((course) => {
                  const done =
                    badge.completedCourseIds &&
                    badge.completedCourseIds.includes(course.id);
                  return (
                    <Flex
                      key={course.id}
                      alignItems="center"
                      gap="12px"
                      p="12px"
                      bg={done ? "#F0FFF4" : "#F7F9FC"}
                      borderRadius="8px"
                      border="1px solid"
                      borderColor={done ? "#9AE6B4" : "#E2E8F0"}
                    >
                      {course.thumbnail ? (
                        <Box
                          w="40px"
                          h="40px"
                          borderRadius="6px"
                          overflow="hidden"
                          flexShrink={0}
                        >
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          w="40px"
                          h="40px"
                          bg={done ? "#E6F4EA" : "#F0E6FF"}
                          borderRadius="6px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <FaMedal
                            color={done ? "#38A169" : "#6b006b"}
                            size={16}
                          />
                        </Box>
                      )}
                      <Box flex={1}>
                        <Text
                          fontSize="13px"
                          fontWeight="600"
                          color="#1A202C"
                          noOfLines={1}
                        >
                          {course.title}
                        </Text>
                        {course.description && (
                          <Text
                            fontSize="11px"
                            color="gray.400"
                            noOfLines={1}
                          >
                            {course.description}
                          </Text>
                        )}
                      </Box>
                      <Box flexShrink={0}>
                        {done ? (
                          <FaCheckCircle color="#38A169" size={16} />
                        ) : (
                          <FiClock color="#A0AEC0" size={15} />
                        )}
                      </Box>
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export const BadgeDetailPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeDetailPage {...props} />} />
);

export default BadgeDetailPageRoute;
