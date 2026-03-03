import { Skeleton } from "@chakra-ui/skeleton";
import { AiOutlinePoweroff } from "react-icons/ai";
import { Button, Heading } from "../../../components";
import { useApp } from "../../../contexts";
import { links, settingsLinks, superAdminSettingsLinks } from "./links";
import SidebarLink from "./SidebarLink";
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  Icon,
  Stack,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { Header } from "./Header";
import { Brand } from "../../../components";
export const SideBar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

export const SidebarContent = ({ onClose, ...rest }) => {
  const { state, getOneMetadata, handleLogout } = useApp();

  const isSettingsPage = /settings/i.test(window.location.pathname);
  const role = getOneMetadata("userRoles", state.user?.userRoleId);
  const isSuperAdmin = /super admin/i.test(role?.name);
  return (
    <Box
      transition="2s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ md: "270px", base: "full", lg: "270px" }}
      pos="fixed"
      h="full"
      zIndex="6"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Box
          borderBottom="1px solid #EDF2F7"
          display={{ base: "none", lg: "block", md: "block" }}
          position="absolute"
          w="full"
          left="0px"
          top="64px"
        ></Box>
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          <Box marginLeft={{ lg: "70px", base: "0", md: "70px" }}>
            <Brand sm textColor="white" />
          </Box>
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      <Box as="div" w="full" paddingRight={1} display="flex" flexDirection="column" height="calc(100vh - 80px)">
        {isSettingsPage ? (
          <Box paddingTop={10} paddingX={5}>
            <Heading fontSize="heading.h3" paddingBottom={2}>
              Settings
            </Heading>
          </Box>
        ) : (
          <Box padding={5}>
            <Stack
              as="header"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              borderBottom="1px"
              borderColor="gray.200"
              height="200px"
              marginBottom={5}
              paddingBottom={5}
            >
              {!state.user ? (
                <Skeleton rounded="full" boxSize="100px" />
              ) : (
                <Avatar
                  name={state.user?.firstName + " " + state.user?.lastName}
                  borderRadius="100%"
                  width="100px"
                  height="100px"
                  src={state.user?.profilePics}
                />
              )}

              {state.user && (
                <>
                  <Link href={`/admin/users/details/${state.user.id}/profile`}>
                    <Text fontSize="heading.h3">
                      {state.user.firstName || "NotSet"} {state.user.lastName}
                    </Text>
                  </Link>

                  <Text color="gray.500" textTransform="capitalize">
                    {getOneMetadata("userRoles", state.user.userRoleId)?.name}
                  </Text>
                </>
              )}
            </Stack>
          </Box>
        )}

        <Box as="nav" padding={5} flex="1" overflowY="auto">
          <Stack as="ul" spacing={2} listStyleType="none">
            {isSettingsPage
              ? isSuperAdmin
                ? superAdminSettingsLinks.map((link) => (
                    <SidebarLink key={link.text} link={link} />
                  ))
                : settingsLinks.map((link) => (
                    <SidebarLink key={link.text} link={link} />
                  ))
              : links.map((link) => (
                  <SidebarLink key={link.text} link={link} onClick={onClose} />
                ))}
          </Stack>
        </Box>
        <Box padding={5} mt="auto">
          <Button
            width="100%"
            onClick={handleLogout}
            ghost
            backgroundColor="secondary.02"
            leftIcon={<AiOutlinePoweroff />}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      alignItems="center"
      bgColor="primary.base"
      pos="fixed"
      w="full"
      zIndex="1"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <Box bgColor="#fff" display="flex" alignItems="center" h="66px" gap={20}>
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
          marginLeft={7}
          marginEnd={10}
        />
      </Box>
      <Header />
    </Flex>
  );
};
