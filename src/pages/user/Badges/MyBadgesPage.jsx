import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box, Flex, Grid, Spinner, Text, Badge } from "@chakra-ui/react";
import { Heading, Button } from "../../../components";
import { userGetMyBadges } from "../../../services";
import { FaMedal, FaChevronRight, FaDownload } from "react-icons/fa";

const EarnedBadgeCard = ({ record }) => {
  const history = useHistory();
  const badge = record.badge || record;

  return (
    <Box
      bg="white"
      border="1px solid #E2E8F0"
      borderRadius="12px"
      overflow="hidden"
      _hover={{ borderColor: "#6b006b", shadow: "md" }}
      transition="all 0.15s"
    >
      {/* Green top bar */}
      <Box h="4px" bg="#38A169" />
      <Box p="20px">
        {/* Badge image */}
        <Flex justifyContent="center" mb="14px">
          {badge.badgeFile ? (
            <Box
              w="72px"
              h="72px"
              borderRadius="50%"
              overflow="hidden"
              border="3px solid #E6F4EA"
            >
              <img
                src={badge.badgeFile}
                alt={badge.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ) : (
            <Box
              w="72px"
              h="72px"
              bg="#E6F4EA"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaMedal color="#38A169" size={28} />
            </Box>
          )}
        </Flex>

        {/* Title */}
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

        {/* Type */}
        <Flex justifyContent="center" mb="10px">
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

        {/* Award date */}
        <Box
          bg="#F0FFF4"
          border="1px solid #9AE6B4"
          borderRadius="8px"
          p="8px 12px"
          mb="12px"
          textAlign="center"
        >
          <Text fontSize="11px" color="#276749" fontWeight="500">
            Earned on{" "}
            {record.awardDate
              ? new Date(record.awardDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </Text>
        </Box>

        {/* Issuing authority */}
        <Text
          fontSize="11px"
          color="gray.400"
          textAlign="center"
          mb="14px"
        >
          Issued by {badge.issuingAuthority || "System"}
        </Text>

        {/* Required courses — always visible */}
        <Flex justifyContent="center" mb="14px">
          <Text fontSize="12px" color="gray.500">
            <Box as="span" fontWeight="700" color="#6b006b">
              {badge.requiredCoursesCount ?? 0}
            </Box>{" "}
            required course{badge.requiredCoursesCount !== 1 ? "s" : ""}
          </Text>
        </Flex>

        {/* Actions */}
        <Flex gap="8px">
          {badge.badgeFile && (
            <Box
              as="a"
              href={badge.badgeFile}
              target="_blank"
              rel="noopener noreferrer"
              flex={1}
            >
              <Flex
                justifyContent="center"
                alignItems="center"
                gap="6px"
                py="8px"
                bg="#F0FFF4"
                borderRadius="6px"
                border="1px solid #9AE6B4"
                color="#38A169"
                fontSize="12px"
                fontWeight="600"
                _hover={{ bg: "#c6e8d1" }}
              >
                <FaDownload size={11} />
                Download
              </Flex>
            </Box>
          )}
          <Box
            as="button"
            flex={1}
            py="8px"
            bg="#F0E6FF"
            borderRadius="6px"
            border="1px solid #e0c9e0"
            color="#6b006b"
            fontSize="12px"
            fontWeight="600"
            _hover={{ bg: "#e0c9e0" }}
            onClick={() => history.push(`/badges/${badge.id}`)}
          >
            <Flex justifyContent="center" alignItems="center" gap="4px">
              View
              <FaChevronRight size={9} />
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

const MyBadgesPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    userGetMyBadges()
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
            My Earned Badges
          </Heading>
          <Text fontSize="14px" color="gray.500" mt="4px">
            Badges you have successfully earned
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
          onClick={() => history.push("/badges")}
        >
          Browse All Badges
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
            No Badges Yet
          </Text>
          <Text
            fontSize="14px"
            color="gray.500"
            maxW="360px"
            mx="auto"
            mb="20px"
          >
            You haven&apos;t earned any badges yet. Start completing courses!
          </Text>
          <Button onClick={() => history.push("/badges")}>Browse Badges</Button>
        </Box>
      )}

      {!loading && badges.length > 0 && (
        <>
          <Text fontSize="13px" color="gray.500" mb="16px">
            {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap="16px"
          >
            {badges.map((record) => (
              <EarnedBadgeCard key={record.id} record={record} />
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export const MyBadgesPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MyBadgesPage {...props} />} />
);

export default MyBadgesPageRoute;
