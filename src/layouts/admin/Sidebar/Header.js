import React from "react";
import { ButtonGroup, IconButton } from "@chakra-ui/button";
import { Center } from "@chakra-ui/layout";
import { HStack } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { AiFillPlusCircle } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { MdNotificationsActive } from "react-icons/md";
import { Link } from "react-router-dom";
import { Button } from "../../../components";
import { SlideShow } from "../../../components/SlideShow/SlideShow";

export const Header = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <div>
      <HStack spacing={{ base: "0", md: "6" }} h="65px">
        <ButtonGroup paddingEnd="18px">
          <QuickAccess />

          <p onClick={onOpen}>
            <Button asIcon ghost reversePrimaryColor largeSize>
              <MdNotificationsActive />
            </Button>
          </p>

          <Button
            link={`/admin/settings`}
            asIcon
            ghost
            reversePrimaryColor
            largeSize
          >
            <FiSettings />
          </Button>
        </ButtonGroup>
      </HStack>
      <SlideShow isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
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
