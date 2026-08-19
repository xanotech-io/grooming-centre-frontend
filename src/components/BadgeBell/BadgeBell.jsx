import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  Divider,
  IconButton,
  Button,
  Spinner,
  Text,
  Badge,
  Progress,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { FaMedal } from "react-icons/fa";
import { userGetBadges } from "../../services";
import { awardChip } from "../../pages/user/Badges/awardChip";

export const BadgeBell = ({ iconColor = "white" }) => {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  const fetchBadges = () => {
    setLoading(true);
    userGetBadges()
      .then((res) => setBadges(res?.data || res?.badges || []))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const earnedCount = badges.filter(
    (badge) => (badge.awardStatus || "").toLowerCase() === "earned"
  ).length;

  const handleSelect = (badge) => {
    onClose();
    history.push(`/badges/${badge.id}`);
  };

  return (
    <>
      <Box position="relative" display="inline-block">
        <IconButton
          aria-label="Badges"
          icon={<FaMedal size="22px" />}
          isRound
          variant="ghost"
          size="lg"
          color={iconColor}
          _hover={{ bg: iconColor === "white" ? "whiteAlpha.200" : "blackAlpha.100" }}
          _active={{ bg: iconColor === "white" ? "whiteAlpha.300" : "blackAlpha.200" }}
          onClick={() => {
            fetchBadges();
            onOpen();
          }}
        />
        {earnedCount > 0 && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            minW="18px"
            h="18px"
            px="4px"
            borderRadius="full"
            bg="#6b006b"
            color="white"
            fontSize="10px"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            {earnedCount > 9 ? "9+" : earnedCount}
          </Box>
        )}
      </Box>

      <Drawer isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerOverlay />
        <DrawerContent maxW={{ base: "100%", sm: "440px" }}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Text fontWeight={700} fontSize="lg">
              Badges
            </Text>
          </DrawerHeader>
          <DrawerBody p={0}>
            {loading && (
              <Flex align="center" justify="center" h="200px">
                <Spinner color="#6b006b" />
              </Flex>
            )}
            {!loading && badges.length === 0 && (
              <Flex align="center" justify="center" h="200px">
                <Text fontSize="sm" color="gray.500">
                  No badges available yet
                </Text>
              </Flex>
            )}
            {!loading && badges.length > 0 && (
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {badges.map((badge) => {
                  const chip = awardChip(badge.awardStatus);
                  const pct = badge.progressPercentage ?? 0;
                  return (
                    <Flex
                      key={badge.id}
                      align="center"
                      gap={3}
                      px={4}
                      py={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => handleSelect(badge)}
                    >
                      <Box
                        w="40px"
                        h="40px"
                        flexShrink={0}
                        borderRadius="50%"
                        overflow="hidden"
                        bg="#F0E6FF"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {badge.badgeFile ? (
                          <img
                            src={badge.badgeFile}
                            alt={badge.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <FaMedal color="#6b006b" size={16} />
                        )}
                      </Box>
                      <Box flex={1} minW={0}>
                        <Flex align="center" justify="space-between" gap={2}>
                          <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                            {badge.title}
                          </Text>
                          <Badge
                            bg={chip.bg}
                            color={chip.color}
                            px="6px"
                            py="1px"
                            borderRadius="8px"
                            textTransform="none"
                            fontSize="10px"
                            flexShrink={0}
                          >
                            {chip.label}
                          </Badge>
                        </Flex>
                        <Progress
                          value={pct}
                          size="xs"
                          borderRadius="4px"
                          mt="6px"
                          sx={{ "& > div": { background: "#6b006b" } }}
                        />
                        <Text fontSize="xs" color="gray.500" mt="4px">
                          {badge.coursesCompletedSoFar ?? 0} of{" "}
                          {badge.requiredCoursesCount ?? 0} courses · {pct.toFixed(0)}%
                        </Text>
                      </Box>
                    </Flex>
                  );
                })}
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button
              width="100%"
              bg="#6b006b"
              color="white"
              _hover={{ bg: "#52004f" }}
              onClick={() => {
                onClose();
                history.push("/badges");
              }}
            >
              View All Badges
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default BadgeBell;
