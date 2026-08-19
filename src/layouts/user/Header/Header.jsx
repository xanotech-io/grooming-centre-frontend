import { ButtonGroup, IconButton } from "@chakra-ui/button";
import { Box, Flex, HStack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { BrandLogo } from "../../../components";
import { useApp } from "../../../contexts";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";
import { Avatar as AvatarImage } from "@chakra-ui/avatar";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { AccountPage } from "../../../pages/admin";
import { NotificationBell } from "../../../components/NotificationBell/NotificationBell";
import { BadgeBell } from "../../../components/BadgeBell/BadgeBell";

const Header = () => {
  return (
    <>
      <Box shadow="md">
        <Flex
          alignItems="center"
          justifyContent="space-between"
          minHeight="60px"
          {...maxWidthStyles_userPages}
        >
          <HStack spacing={{ base: 2, laptop: 5 }} flexShrink={0}>
            <BrandLogo sm marginRight={{ base: 2, laptop: 5 }} />

            {/* <SearchBar width="400px" display={{ base: "none", tablet: "flex" }} /> */}
          </HStack>

          <NavBar
            display={{ base: "none", tablet: "flex" }}
            flex={1}
            marginRight={5}
          />
          {/* <NavBar display={{ base: "none", laptop: "flex" }} flex={1} /> */}

          <ButtonGroup spacing={{ base: 2, laptop: 5 }}>
            <Avatar />
            <BadgeBell iconColor="black" />
            <NotificationBell iconColor="black" />
          </ButtonGroup>
        </Flex>
      </Box>
    </>
  );
};

const Avatar = () => {
  const { handleLogout, state, getOneMetadata } = useApp();

  const isAdmin = () => {
    const role = getOneMetadata("userRoles", state.user.userRoleId);

    if (/admin/i.test(role?.name) || /instructor/i.test(role?.name))
      return true;
  };

  return (
    <Box display={{ lg: "none", base: "block", md: "none" }}>
      <Menu>
        <MenuButton as={IconButton} isRound>
          <AvatarImage
            name={state.user?.firstName + " " + state.user?.lastName}
            rounded="full"
            boxSize="40px"
            src={state.user?.profilePics}
          />
        </MenuButton>
        <MenuList position="relative" zIndex={100000}>
          <MenuGroup>
            <AccountMenuItem />

            <MenuItem as={Link} to="/dashboard">
              Home
            </MenuItem>
            <MenuItem as={Link} to="/courses">
              Courses
            </MenuItem>
            <MenuItem as={Link} to="/library/books">
              Library
            </MenuItem>
            <MenuItem as={Link} to="/forum/questions?tab=new">
              Forum
            </MenuItem>
            <MenuItem as={Link} to="/events">
              Event
            </MenuItem>
            <MenuItem as={Link} to="/polls">
              Polls
            </MenuItem>
            <MenuItem as={Link} to="/courses/grade-overview#certificates">
              Certificates
            </MenuItem>
            <MenuItem as={Link} to="/standalone-exams">
              Examination
            </MenuItem>
            <MenuItem as={Link} to="/badges">
              Badges
            </MenuItem>
            <MenuItem as={Link} to="/courses/grade-overview">
              Grades
            </MenuItem>
            <MenuItem as={Link} to="/profile">
              Profile
            </MenuItem>
            {state.user && isAdmin() && (
              <MenuItem as={Link} to="/admin">
                Admin Dashboard
              </MenuItem>
            )}
          </MenuGroup>
          <MenuDivider />
          <MenuItem onClick={handleLogout} color="secondary.6">
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

function AccountMenuItem() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <MenuItem onClick={onOpen}> My Account</MenuItem>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>My Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AccountPage onCallToActionClick={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Header;
