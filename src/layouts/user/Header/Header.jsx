import { ButtonGroup, IconButton } from "@chakra-ui/button";
import { Skeleton } from "@chakra-ui/skeleton";
import { Box, Flex, HStack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { MdNotificationsActive } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BrandLogo, Button } from "../../../components";
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
import { SlideShow } from "../../../components/SlideShow/SlideShow";
import useGetAnnouncements from "./useGetAnnouncements";
import { useState, useEffect } from "react";

const Header = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { announcement } = useGetAnnouncements();
  const [data, setData] = useState();
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [id, setId] = useState("");
  //z

  useEffect(() => {
    setData(announcement);
  }, [announcement]);

  const handleModal = (id) => {
    setModal(true);
    setId(id);
    onClose();
  };

  useEffect(() => {
    const idData = data?.find((item) => item?.id === id);
    setModalData(idData);
  }, [data, id]);

  return (
    <>
      {modal && (
        <Box
          zIndex="10"
          backgroundColor="rgba(0, 0, 0, 0.6)"
          width="100vw"
          top="0"
          right="0"
          position="fixed"
          height="100vh"
          padding="40px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            borderRadius="10px"
            backgroundColor="white"
            padding="20px"
            width="525px"
            height="256px"
          >
            <Box
              cursor="pointer"
              display="flex"
              justifyContent="flex-end"
              onClick={() => setModal(false)}
            >
              <AiOutlineCloseCircle color="red" size={20} />
            </Box>
            <Box display="flex" gap="10px" alignItems="center">
              <Box>
                {!modalData?.profilePic ? (
                  <Skeleton rounded="full" boxSize="50px" />
                ) : (
                  <Box
                    borderRadius="100%"
                    shadow="md"
                    border="2px solid #800020"
                    padding="10px"
                  >
                    <img
                      width="30px"
                      height="30px"
                      alt="profile"
                      src={modalData?.profilePic}
                    />
                  </Box>
                )}
              </Box>
              <Box>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {modalData?.firstName + " " + modalData?.lastName}
                </p>
                <p
                  style={{
                    color: "#800020",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {modalData?.department}
                </p>
              </Box>
            </Box>
            <p
              style={{
                color: "rgba(0, 0, 0, 0.56)",
                fontSize: "14px",
                marginTop: "20px",
              }}
            >
              {modalData?.text}
            </p>
          </Box>
        </Box>
      )}
      <Box shadow="md">
        <Flex
          alignItems="center"
          justifyContent="space-between"
          minHeight="60px"
          {...maxWidthStyles_userPages}
        >
          <HStack spacing={{ base: 2, laptop: 5 }} flex={1}>
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
            <p
              style={{
                position: "relative",
              }}
              onClick={onOpen}
            >
              <Button asIcon>
                <MdNotificationsActive />
              </Button>
              {data?.length !== 0 && (
                <p
                  style={{
                    position: "absolute",
                    top: "1px",
                    left: "25px",
                    width: "10px",
                    height: "10px",
                    background: "#660066",
                    borderRadius: "100%",
                  }}
                />
              )}
            </p>
          </ButtonGroup>
        </Flex>
        <SlideShow
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
          children={
            <Box>
              {data?.map((item) => (
                <Box
                  marginBottom="10px"
                  padding="10px"
                  borderRadius="10px"
                  shadow="md"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  gap="12px"
                  onClick={() => handleModal(item?.id)}
                  key={item.id}
                >
                  <Box>
                    {!item?.profilePic ? (
                      <Skeleton rounded="full" boxSize="50px" />
                    ) : (
                      <Box
                        borderRadius="100%"
                        shadow="md"
                        border="1px solid #800020"
                        padding="10px"
                      >
                        <img
                          width="20px"
                          height="20px"
                          alt="profile"
                          src={item?.profilePic}
                        />
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {item?.firstName + " " + item?.lastName}
                    </p>
                    <p
                      style={{
                        color: "rgba(0, 0, 0, 0.56)",
                        fontSize: "14px",
                      }}
                    >
                      {item?.text.substring(0, 15).concat("...")}
                    </p>
                  </Box>
                </Box>
              ))}
            </Box>
          }
        />
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
