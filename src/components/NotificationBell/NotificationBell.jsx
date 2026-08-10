import { IconButton } from "@chakra-ui/button";
import { Box, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList } from "@chakra-ui/menu";
import { MdNotificationsActive } from "react-icons/md";
import { useHistory } from "react-router-dom";
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

export const NotificationBell = () => {
  const history = useHistory();
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleSelect = (notification) => {
    markRead(notification.id);
    if (notification.contentUrl) history.push(notification.contentUrl);
  };

  return (
    <Box position="relative" display="inline-block">
      <Menu placement="bottom-end">
        <MenuButton
          as={IconButton}
          aria-label="Notifications"
          icon={<MdNotificationsActive />}
          isRound
          variant="ghost"
        />
        <MenuList maxH="400px" overflowY="auto" minW="320px" position="relative" zIndex={2}>
          <MenuGroup title="Notifications">
            {notifications.length === 0 && (
              <Box px={4} py={3}>
                <Text fontSize="sm" color="gray.500">
                  No notifications yet
                </Text>
              </Box>
            )}
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleSelect(notification)}
                bg={notification.read ? undefined : "secondary.05"}
              >
                <VStack align="start" spacing={0} w="100%">
                  <Text
                    fontSize="sm"
                    fontWeight={notification.read ? "normal" : "bold"}
                  >
                    {notification.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={2}>
                    {notification.body}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {formatRelativeTime(notification.receivedAt)}
                  </Text>
                </VStack>
              </MenuItem>
            ))}
          </MenuGroup>
          {notifications.length > 0 && (
            <>
              <MenuDivider />
              <MenuItem onClick={markAllRead} fontSize="sm" color="primary.base">
                Mark all as read
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
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
  );
};
