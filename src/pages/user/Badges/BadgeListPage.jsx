import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Spinner,
  Text,
  Badge,
  Progress,
} from "@chakra-ui/react";
import { Heading } from "../../../components";
import { userGetBadges } from "../../../services";
import { FaMedal, FaChevronRight } from "react-icons/fa";
import { awardChip } from "./awardChip";

const BadgeCard = ({ badge }) => {
  const history = useHistory();
  const chip = awardChip(badge.awardStatus);
  const pct = badge.progressPercentage ?? 0;

  return (
    <Box
      bg="white"
      border="1px solid #E2E8F0"
      borderRadius="12px"
      overflow="hidden"
      cursor="pointer"
      onClick={() => history.push(`/badges/${badge.id}`)}
      _hover={{ borderColor: "#6b006b", shadow: "md" }}
      transition="all 0.15s"
    >
      <Box h="4px" bg="#6b006b" />
      <Box p="20px">
        {/* Badge image */}
        <Flex justifyContent="center" mb="14px">
          {badge.badgeFile ? (
            <Box
              w="64px"
              h="64px"
              borderRadius="50%"
              overflow="hidden"
              border="3px solid #F0E6FF"
            >
              <img
                src={badge.badgeFile}
                alt={badge.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ) : (
            <Box
              w="64px"
              h="64px"
              bg="#F0E6FF"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaMedal color="#6b006b" size={26} />
            </Box>
          )}
        </Flex>

        {/* Title + type */}
        <Text
          fontSize="15px"
          fontWeight="700"
          color="#1A202C"
          textAlign="center"
          mb="4px"
          noOfLines={2}
        >
          {badge.title}
        </Text>
        <Flex justifyContent="center" mb="12px">
          <Badge
            bg="#F0E6FF"
            color="#6b006b"
            px="8px"
            py="2px"
            borderRadius="8px"
            textTransform="none"
            fontSize="11px"
          >
            {badge.badgeType}
          </Badge>
        </Flex>

        {/* Description */}
        <Text
          fontSize="12px"
          color="gray.500"
          textAlign="center"
          mb="14px"
          noOfLines={2}
        >
          {badge.description}
        </Text>

        {/* Required courses count — always visible */}
        <Flex
          justifyContent="center"
          bg="#F7F9FC"
          borderRadius="6px"
          px="10px"
          py="6px"
          mb="14px"
        >
          <Text fontSize="12px" color="gray.500">
            <Box as="span" fontWeight="700" color="#6b006b">
              {badge.requiredCoursesCount ?? 0}
            </Box>{" "}
            required course{badge.requiredCoursesCount !== 1 ? "s" : ""}
          </Text>
        </Flex>

        {/* Progress */}
        {badge.awardStatus && badge.awardStatus !== "Not Started" ? (
          <>
            <Flex justifyContent="space-between" mb="4px">
              <Text fontSize="11px" color="gray.500">
                {badge.coursesCompletedSoFar ?? 0} of{" "}
                {badge.requiredCoursesCount ?? 0} completed
              </Text>
              <Text fontSize="11px" fontWeight="700" color="#6b006b">
                {pct.toFixed(0)}%
              </Text>
            </Flex>
            <Progress
              value={pct}
              size="sm"
              borderRadius="4px"
              mb="10px"
              sx={{ "& > div": { background: "#6b006b" } }}
            />
            {badge.remainingCourses != null && badge.remainingCourses > 0 && (
              <Text fontSize="11px" color="gray.400" textAlign="center" mb="10px">
                {badge.remainingCourses} course
                {badge.remainingCourses !== 1 ? "s" : ""} remaining
              </Text>
            )}
          </>
        ) : (
          <Box h="38px" />
        )}

        {/* Status chip + view */}
        <Flex justifyContent="space-between" alignItems="center">
          <Badge
            bg={chip.bg}
            color={chip.color}
            px="8px"
            py="3px"
            borderRadius="10px"
            textTransform="none"
            fontSize="11px"
            fontWeight="500"
          >
            {chip.label}
          </Badge>
          <Flex alignItems="center" gap="4px" color="#6b006b">
            <Text fontSize="12px" fontWeight="600">
              View
            </Text>
            <FaChevronRight size="10px" />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

const BadgeListPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    userGetBadges()
      .then((res) => setBadges(res?.data || res?.badges || []))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
      paddingY="32px"
      minH="100vh"
      bg="#F7F9FC"
    >
      <Flex justifyContent="space-between" alignItems="center" mb="28px">
        <Box>
          <Heading fontSize="24px" fontWeight="700" color="#1A202C">
            Badges
          </Heading>
          <Text fontSize="14px" color="gray.500" mt="4px">
            Earn badges by completing required courses
          </Text>
        </Box>
        <Box
          as="button"
          px="16px"
          py="8px"
          fontSize="13px"
          fontWeight="600"
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="8px"
          color="#6b006b"
          _hover={{ bg: "#F0E6FF" }}
          onClick={() => history.push("/badges/my-badges")}
        >
          My Earned Badges
        </Box>
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && badges.length === 0 && (
        <Box
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="12px"
          p="48px"
          textAlign="center"
        >
          <Box
            w="64px"
            h="64px"
            bg="#F0E6FF"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb="16px"
          >
            <FaMedal color="#6b006b" size={26} />
          </Box>
          <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="8px">
            No Badges Available
          </Text>
          <Text fontSize="14px" color="gray.500">
            Check back later — badges will appear here once published.
          </Text>
        </Box>
      )}

      {!loading && badges.length > 0 && (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap="16px"
        >
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export const BadgeListPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeListPage {...props} />} />
);

export default BadgeListPageRoute;
