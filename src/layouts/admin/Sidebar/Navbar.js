import { AiOutlinePoweroff } from "react-icons/ai";
import { Button, Heading } from "../../../components";
import { useApp } from "../../../contexts";
import { links, settingsLinks, superAdminSettingsLinks } from "./links";
import SidebarLink from "./SidebarLink";
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Stack,
  useColorModeValue,
  Drawer,
  DrawerContent,
  DrawerOverlay,
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
  const isSupervisor = /supervisor/i.test(role?.name);

  const visibleLinks = links.filter((link) => {
    if (isSupervisor) {
      return link.roles?.some((r) => new RegExp(r, "i").test(role?.name));
    }
    if (!link.roles) return true;
    return link.roles.some((r) => new RegExp(r, "i").test(role?.name));
  });
  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.100", "gray.700")}
      w={{ md: "270px", base: "full", lg: "270px" }}
      pos="fixed"
      h="full"
      zIndex="6"
      {...rest}
    >
      <Flex
        h="16"
        alignItems="center"
        justifyContent="center"
        paddingX={6}
        borderBottom="1px"
        borderBottomColor={useColorModeValue("gray.100", "gray.700")}
        position="relative"
      >
        <Brand sm />
        <CloseButton
          position="absolute"
          right={4}
          display={{ base: "flex", md: "none" }}
          onClick={onClose}
        />
      </Flex>
      <Box
        as="div"
        w="full"
        display="flex"
        flexDirection="column"
        height="calc(100vh - 64px)"
      >
        {isSettingsPage && (
          <Box paddingTop={6} paddingX={5} paddingBottom={1}>
            <Heading fontSize="heading.h3">Settings</Heading>
          </Box>
        )}

        <Box as="nav" paddingX={3} paddingY={4} flex="1" overflowY="auto">
          <Stack as="ul" spacing={1} listStyleType="none">
            {isSettingsPage
              ? isSuperAdmin
                ? superAdminSettingsLinks.map((link) => (
                  <SidebarLink key={link.text} link={link} roleName={role?.name} />
                ))
                : settingsLinks.map((link) => (
                  <SidebarLink key={link.text} link={link} roleName={role?.name} />
                ))
              : visibleLinks.map((link) => (
                <SidebarLink key={link.text} link={link} onClick={onClose} roleName={role?.name} />
              ))}
          </Stack>
        </Box>
        <Box
          padding={4}
          borderTop="1px"
          borderTopColor={useColorModeValue("gray.100", "gray.700")}
        >
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
