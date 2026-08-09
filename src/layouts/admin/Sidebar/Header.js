import React from "react";
import { ButtonGroup, IconButton } from "@chakra-ui/button";
import { Center } from "@chakra-ui/layout";
import { HStack } from "@chakra-ui/layout";
import { Avatar, Text, VStack, Box } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { AiFillPlusCircle } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, NotificationBell } from "../../../components";
import { useApp } from "../../../contexts";

export const Header = () => {
  return (
    <div>
      <HStack spacing={{ base: "0", md: "6" }} h="65px">
        <ButtonGroup paddingEnd="18px">
          <QuickAccess />

          <NotificationBell />

          <Button
            link={`/admin/settings`}
            asIcon
            ghost
            reversePrimaryColor
            largeSize
          >
            <FiSettings />
          </Button>

          <Box display="flex" alignItems="center" ml={2}>
            <UserProfileMenu />
          </Box>
        </ButtonGroup>
      </HStack>
    </div>
  );
};
const QuickAccess = () => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        isRound
        backgroundColor="others.3"
        _hover={{ backgroundColor: "others.3" }}
        _active={{ backgroundColor: "others.3" }}
      >
        <Center>
          <AiFillPlusCircle color="white" size="24px" />
        </Center>
      </MenuButton>


      <MenuList position="relative" zIndex={2}>
        <MenuGroup>
          <MenuItem as={Link} to="/admin/departments/create">
            Add Department
          </MenuItem>
          <MenuItem as={Link} to="/admin/users/edit/new">
            Add User
          </MenuItem>
          <MenuItem as={Link} to="/admin/courses/edit/new">
            Add Course
          </MenuItem>

          <MenuItem as={Link} to="/admin/events/edit/new">
            Add Event
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
};

const UserProfileMenu = () => {
  const { state, getOneMetadata } = useApp();

  if (!state?.user) return null;

  const role = getOneMetadata("userRoles", state.user.userRoleId);

  return (
    <Menu w="100%">
      <MenuButton
        as={IconButton}
        isRound
        variant="ghost"
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
      >
        <Avatar
          size="sm"
          name={`${state.user.firstName || ""} ${state.user.lastName || ""}`}
          src={state.user.profilePics}
        />
      </MenuButton>

      <MenuList position="relative" zIndex={2} minW="250px" p={4} boxShadow="lg" borderRadius="lg">
        <VStack spacing={4}>
          <Avatar
            size="2xl"
            name={`${state.user.firstName || ""} ${state.user.lastName || ""}`}
            src={state.user.profilePics}
          />
          <Box textAlign="center">
            <Text
              as={Link}
              to={`/admin/users/details/${state.user.id}/profile`}
              fontSize="2xl"
              fontWeight="medium"
              lineHeight="1.2"
              _hover={{ color: "primary.base", textDecoration: "underline" }}
              display="block"
            >
              {state.user.firstName || ""} {state.user.lastName || ""}
            </Text>
            <Text mt={2} fontSize="lg" color="gray.500" textTransform="capitalize">
              {role?.name || "User"}
            </Text>
          </Box>
        </VStack>
      </MenuList>
    </Menu>
  );
};
