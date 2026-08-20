import { useState } from "react";
import { IconButton, Button } from "@chakra-ui/button";
import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, VStack, Divider } from "@chakra-ui/layout";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/modal";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/hooks";
import { MdNotificationsActive } from "react-icons/md";
import { Text } from "..";
import useNotificationStore from "../../store/notificationStore";

const formatRelativeTime = (timestamp) => {
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
};

export const NotificationBell = ({ iconColor = "white" }) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const [activeNotification, setActiveNotification] = useState(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleSelect = (notification) => {
    markRead(notification.id);
    if (notification.contentUrl) {
      window.location.href = notification.contentUrl;
      return;
    }
    setActiveNotification(notification);
    openModal();
  };

  return (
    <>
      <Box position="relative" display="inline-block">
        <IconButton
          aria-label="Notifications"
          icon={<MdNotificationsActive size="28px" />}
          isRound
          variant="ghost"
          size="lg"
          color={iconColor}
          _hover={{ bg: iconColor === "white" ? "whiteAlpha.200" : "blackAlpha.100" }}
          _active={{ bg: iconColor === "white" ? "whiteAlpha.300" : "blackAlpha.200" }}
          onClick={openDrawer}
        />
        {unreadCount > 0 && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            minW="18px"
            h="18px"
            px="4px"
            borderRadius="full"
            bg="red.500"
            color="white"
            fontSize="10px"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Box>
        )}
      </Box>

      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} placement="right">
        <DrawerOverlay />
        <DrawerContent maxW={{ base: "100%", sm: "440px" }}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center" justify="space-between" pr={6}>
              <Text fontWeight={700} fontSize="lg">
                Notifications
              </Text>
              {notifications.length > 0 && (
                <Button size="xs" variant="link" color="primary.base" onClick={markAllRead}>
                  Mark all as read
                </Button>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerBody p={0}>
            {notifications.length === 0 ? (
              <Flex align="center" justify="center" h="200px">
                <Text fontSize="sm" color="gray.500">
                  No notifications yet
                </Text>
              </Flex>
            ) : (
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {notifications.map((notification) => (
                  <Flex
                    key={notification.id}
                    align="start"
                    gap={3}
                    px={4}
                    py={3}
                    cursor="pointer"
                    bg={notification.read ? undefined : "secondary.05"}
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleSelect(notification)}
                  >
                    <Avatar
                      size="md"
                      name={notification.senderName || notification.title}
                      src={notification.senderAvatar}
                    />
                    <Box flex={1} minW={0}>
                      <Text
                        fontSize="sm"
                        fontWeight={notification.read ? "normal" : "bold"}
                        noOfLines={1}
                      >
                        {notification.senderName || notification.title}
                      </Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {notification.senderName ? notification.title : notification.body}
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {formatRelativeTime(notification.receivedAt)}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Flex align="center" gap={3}>
              <Avatar
                size="sm"
                name={activeNotification?.senderName || activeNotification?.title}
                src={activeNotification?.senderAvatar}
              />
              <Box>
                <Text fontSize="md" fontWeight={700}>
                  {activeNotification?.senderName || activeNotification?.title}
                </Text>
                {activeNotification && (
                  <Text fontSize="xs" color="gray.400">
                    {formatRelativeTime(activeNotification.receivedAt)}
                  </Text>
                )}
              </Box>
            </Flex>
          </ModalHeader>
          <ModalBody>
            {activeNotification?.senderName && (
              <Text fontWeight={600} mb={2}>
                {activeNotification.title}
              </Text>
            )}
            <Text color="gray.700" whiteSpace="pre-wrap">
              {activeNotification?.body}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
