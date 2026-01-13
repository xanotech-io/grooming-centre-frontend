import {
  Avatar,
  Box,
  ButtonGroup,
  Flex,
  Grid,
  Stack,
  HStack,
  SkeletonCircle,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  Modal as ModalChakraUI,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  ModalHeader,
  Skeleton,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Route, useHistory } from "react-router-dom";
import {
  Button,
  Heading,
  Text,
  Input,
  SkeletonText,
  SearchBar,
  Image,
  DownloadButton,
} from "../../../components";
import imagePlaceholder from "../../../assets/images/Avatar.svg";
import breakpoints, {
  maxWidthStyles_userPages,
} from "../../../theme/breakpoints";
import { MdAttachFile } from "react-icons/md";
import { capitalizeFirstLetter, truncateText } from "../../../utils";
import { GrEmoji } from "react-icons/gr";
import {
  BiCheckDouble,
  BiDotsVerticalRounded,
  BiRefresh,
} from "react-icons/bi";
import { AiOutlinePlus, AiOutlineClose, AiOutlineFile } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { useFetch, useQueryParams } from "../../../hooks";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  currentUserMessagePayload,
  userGetOneRoom,
  userGetMessagingRooms,
} from "../../../services";
import { EmptyState } from "../../../layouts";
import errorImage from "../../../assets/images/error.svg";
import { useApp } from "../../../contexts";
import { useForm } from "react-hook-form";
import Picker, { SKIN_TONE_MEDIUM } from "emoji-picker-react";

// //
// //
// import socketClient from "socket.io-client";
// const SERVER = "http://127.0.0.1:8080";
// //
// //

const ChatLayout = () => {
  // const socket = socketClient(SERVER);
  // socket.on("connection", () => {
  //   console.log(`I'm connected with the back-end`);
  // });

  return (
    <Grid
      {...maxWidthStyles_userPages}
      maxWidth={breakpoints["laptop"]}
      gridTemplateColumns="350px 1fr"
      gridGap={10}
      padding={8}
    >
      <Aside />

      <ChatArea />
    </Grid>
  );
};

const useAllMessagingRooms = () => {
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { rooms } = await userGetMessagingRooms();
    return rooms;
  }, []);

  const handleFetch = useCallback(
    () => handleFetchResource({ fetcher }),
    [fetcher, handleFetchResource]
  );

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return { resource, handleFetch };
};

const useRoomConversations = () => {
  const { resource, setResource, handleFetchResource } = useFetch();
  const roomId = useQueryParams().get("roomId");

  const fetcher = useCallback(async () => {
    const { room } = await userGetOneRoom(roomId);
    return room;
  }, [roomId]);

  const handleFetch = useCallback(
    () => handleFetchResource({ fetcher }),
    [fetcher, handleFetchResource]
  );

  useEffect(() => {
    if (roomId) handleFetch();
  }, [handleFetch, roomId]);

  return { resource, setResource, handleFetch };
};

const Aside = () => {
  const { resource: allMessagingRooms, handleFetch: handleMessagesRetry } =
    useAllMessagingRooms();

  return (
    <Box as="aside">
      <Flex
        background="accent.1"
        padding={2}
        roundedTop="md"
        justifyContent="space-between"
        alignItems={"center"}
      >
        <Heading fontSize="text.level3">Messaging</Heading>

        <MoreIconButton
          list={[
            {
              renderContent: () => (
                <ListOfUsers
                  renderTrigger={({ onOpen }) => (
                    <MenuItem onClick={onOpen}>View All Users</MenuItem>
                  )}
                />
              ),
            },
          ]}
        />
      </Flex>

      <Box
        padding={3}
        overflowY="auto"
        height="calc(60vh + 82px + 73px - 55px)"
      >
        {allMessagingRooms.loading &&
          [1, 2, 3, 4, 5].map((i) => <MessagingRoomsItem isLoading key={i} />)}

        {allMessagingRooms.data &&
          allMessagingRooms.data.map((room) => (
            <MessagingRoomsItem
              key={room.id}
              id={room.id}
              isGroup={room.isGroup}
              msg={room.message.text}
              date={room.message.date}
              file={room.message.file}
              name={room.name}
              profilePics={room.image}
              unreadCount={room.unreadCount}
            />
          ))}

        {allMessagingRooms.err && (
          <Flex
            textAlign="center"
            alignItems="center"
            justifyContent="center"
            minHeight="386px"
            flexDirection="column"
          >
            <Text color="secondary.5" fontSize="heading.h4">
              Ops! Something went wrong
            </Text>

            <Button
              mt={5}
              leftIcon={<BiRefresh />}
              onClick={handleMessagesRetry}
            >
              Try Again
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

const ChatArea = () => {
  const toast = useToast();
  const {
    resource: currentRoom,
    setResource: setCurrentRoom,
    handleFetch: handleFetchCurrentRoomRetry,
  } = useRoomConversations();
  const roomId = useQueryParams().get("roomId");

  const {
    state: { user: currentLoggedInUser },
  } = useApp();

  const noCurrentSelectedRoom = !roomId;
  const noCurrentSelectedRoomMessages =
    !currentRoom.loading &&
    !currentRoom.err &&
    currentRoom.data?.conversations.length === 0;

  const getUser = (userId) =>
    currentRoom.data?.users.find((user) => user.id === userId);

  const conversations = currentRoom.data
    ? currentRoom.data.conversations.map((item, index, list) => ({
        ...item,
        date:
          list[index + 1]?.date === list[index].date &&
          list[index + 1]?.userId === list[index].userId
            ? null
            : item.date,
        userProfilePics:
          list[index - 1]?.userId === list[index].userId
            ? "skip"
            : getUser(item.userId)?.profilePics,
      }))
    : null;

  console.log(conversations, noCurrentSelectedRoom, currentRoom.data);

  const messagesRef = useRef();

  const scrollMessagesToBottom = () => {
    setTimeout(() => {
      if (messagesRef.current)
        messagesRef.current.scrollTop = messagesRef.current?.scrollHeight;
    }, 300);
  };

  const handleFocusTypeInput = () =>
    document.querySelector("#type-message")?.focus();

  const handleNewMessageAdd = (payload) => {
    console.log(payload);

    setCurrentRoom((currentRoom) => ({
      data: {
        ...currentRoom.data,
        conversations: [...currentRoom.data.conversations, payload],
      },
    }));
  };

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    getValues,
  } = useForm();

  const handleEmojiSelect = ({ emoji }) =>
    setValue("message", `${getValues("message")}${emoji}`);

  const onSubmit = async ({ message }) => {
    try {
      handleNewMessageAdd(
        currentUserMessagePayload({
          text: message,
          userId: currentLoggedInUser.id,
        })
      );

      reset();
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (conversations?.length > 0) {
      handleFocusTypeInput();
      scrollMessagesToBottom();
    }
  }, [conversations?.length]);

  const groupUserNames = currentRoom.data?.isGroup
    ? [
        currentRoom.data?.users[0],
        currentRoom.data?.users[1],
        currentRoom.data?.users[2],
      ].reduce(
        (acc, user, index) => `${acc}${index ? ", " : ""}${user.name}`,
        ""
      )
    : null;

  const renderHeader = () => (
    <Flex
      justifyContent="space-between"
      background="accent.1"
      padding={4}
      roundedTop="md"
    >
      <Flex>
        {currentRoom.loading && <SkeletonCircle boxSize="50px" />}

        {currentRoom.data && (
          <Avatar
            name={currentRoom.data.name}
            src={currentRoom.data.image}
            boxSize="50px"
            rounded="full"
          />
        )}

        <Box marginLeft={2}>
          {currentRoom.loading && (
            <SkeletonText numberOfLines={2} width="300px" />
          )}

          {currentRoom.data && (
            <>
              <Text bold textTransform="capitalize">
                {currentRoom.data.name}
              </Text>

              {groupUserNames ? (
                <Flex gridGap="3">
                  <Text>{groupUserNames}</Text>
                  {currentRoom.data?.users.length > 3 && (
                    <Text bold>+ {currentRoom.data?.users.length - 3}</Text>
                  )}
                </Flex>
              ) : (
                <Text color="accent.7">Inactive</Text>
              )}
            </>
          )}
        </Box>
      </Flex>

      <ButtonGroup spacing="4">
        <IconButton
          // disabled={currentUserMessages.loading}
          disabled // TODO: remove this we support upload
        >
          <MdAttachFile />
        </IconButton>

        <MoreIconButton
          list={
            !currentRoom.loading && [{ text: "Delete Entire Conversation" }]
          }
        />
      </ButtonGroup>
    </Flex>
  );

  return (
    <Box as="main" shadow="md">
      {noCurrentSelectedRoom ||
      currentRoom.err ||
      noCurrentSelectedRoomMessages ? (
        <>
          {currentRoom.data && renderHeader()}

          <EmptyState
            height={`calc(60vh + 82px${currentRoom.data ? " - 72px" : ""})`}
            illustration={
              noCurrentSelectedRoomMessages ? undefined : (
                <Image
                  src={errorImage}
                  height="200px"
                  alt="Course Header"
                  mb={5}
                  transform="translateX(-10px)"
                />
              )
            }
            heading={
              currentRoom.err
                ? "Ops! Something went wrong"
                : noCurrentSelectedRoomMessages
                ? "No messages yet"
                : "No user selected"
            }
            description={
              noCurrentSelectedRoomMessages
                ? "Start messaging to get started"
                : currentRoom.err
                ? "An unexpected error occurred. Please try again later."
                : "Please select a user"
            }
            cta={
              currentRoom.err ? (
                <Button onClick={handleFetchCurrentRoomRetry}>Try Again</Button>
              ) : noCurrentSelectedRoomMessages ? (
                <Button onClick={handleFocusTypeInput}>
                  Start A Conversation
                </Button>
              ) : (
                <ListOfUsers
                  renderTrigger={({ onOpen }) => (
                    <Button onClick={onOpen}>Start A Conversation</Button>
                  )}
                />
              )
            }
          />
        </>
      ) : (
        <>
          {renderHeader()}

          <Box height="60vh" overflowY="auto" py={4} ref={messagesRef}>
            {currentRoom.loading && !currentLoggedInUser && (
              <>
                <MessageBox isLoading />
                <MessageBox isLoading />
                <MessageBox isLoading isMine />
                <MessageBox isLoading />
                <MessageBox isLoading isMine />
                <MessageBox isLoading />
              </>
            )}

            {currentLoggedInUser &&
              conversations?.map((message) => {
                const isMyMessage = message.userId === currentLoggedInUser?.id;

                return (
                  <MessageBox
                    key={message.id}
                    isMine={isMyMessage}
                    profilePics={message.userProfilePics}
                    name={getUser(message.userId)?.name}
                    date={message.date}
                    file={message.file}
                    showName={currentRoom.data?.isGroup}
                  >
                    <Text>{message.text}</Text>

                    {message.file && (
                      <Flex
                        flexDir={"column"}
                        alignItems="flex-end"
                        mt={message.text && 2}
                      >
                        <Flex
                          border="1px"
                          borderColor="accent.1"
                          p={2}
                          color={!isMyMessage ? "accent.3" : "primary.base"}
                          bg={!isMyMessage ? "accent.1" : "transparent"}
                          w="fit-content"
                          rounded="md"
                          shadow={!isMyMessage && "sm"}
                        >
                          <Text mr={1} as="level5" bold>
                            ({message.file.size}) {message.file.name}.
                            {message.file.extension}
                          </Text>

                          <AiOutlineFile />
                        </Flex>
                      </Flex>
                    )}
                  </MessageBox>
                );
              })}
          </Box>
        </>
      )}

      <Flex
        as="form"
        padding={4}
        borderTop="1px"
        borderColor="accent.1"
        onSubmit={handleSubmit(onSubmit)}
      >
        <IconButton
          backgroundColor="accent.1"
          // disabled={noCurrentUser || !currentUserMessages.data}
          disabled // TODO: remove this we support upload
        >
          <AiOutlinePlus />
        </IconButton>

        <Input
          id="type-message"
          placeholder="Type a message here"
          variant="ghost"
          disabled={noCurrentSelectedRoom || !currentRoom.data}
          mx={2}
          {...register("message", {
            required: true,
          })}
        />

        <EmojiPicker
          disabled={noCurrentSelectedRoom || !currentRoom.data}
          onSelect={handleEmojiSelect}
        />

        <IconButton
          primary
          disabled={
            noCurrentSelectedRoom ||
            !currentRoom.data ||
            isSubmitting ||
            !currentLoggedInUser
          }
          type="submit"
        >
          {isSubmitting ? <Spinner /> : <IoIosSend />}
        </IconButton>
      </Flex>
    </Box>
  );
};

const EmojiPicker = ({ disabled, onSelect }) => {
  const [displayPicker, setDisplayPicker] = useState(false);

  const handleTogglePicker = () => setDisplayPicker((prev) => !prev);

  const onEmojiClick = (_event, emojiObject) => {
    onSelect(emojiObject);
    setDisplayPicker(false);
  };

  return (
    <Box pos="relative">
      <IconButton
        shadow="none"
        marginRight={2}
        disabled={disabled}
        onClick={handleTogglePicker}
        primary={displayPicker}
      >
        {displayPicker ? <AiOutlineClose /> : <GrEmoji />}
      </IconButton>

      {displayPicker && (
        <Box pos="absolute" bottom="110%" right="0" zIndex={100}>
          <Picker
            onEmojiClick={onEmojiClick}
            disableAutoFocus={true}
            skinTone={SKIN_TONE_MEDIUM}
            groupNames={{ smileys_people: "PEOPLE" }}
            native
          />
        </Box>
      )}
    </Box>
  );
};

const MessageBox = ({
  children,
  isMine,
  isLoading,
  profilePics,
  name,
  date,
  file,
  showName,
}) => {
  const style = {
    maxWidth: "80%",
    border: "1px",
    color: isMine ? "accent.3" : "white",
    backgroundColor: !isMine && "accent.3",
    p: 4,
    rounded: "1rem",
    roundedTopStart: !isMine && "none",
    roundedBottomRight: isMine && "none",
    position: "relative",
  };

  let moreList = isMine
    ? [{ text: "Edit This Messages" }, { text: "Delete this Message" }]
    : [{ text: "Delete this Message" }];

  if (file)
    moreList = [
      {
        renderContent: () => (
          <DownloadButton
            title={file.name}
            file={file.url}
            fileExtension={file.extension}
          />
        ),
      },
      ...moreList,
    ];

  const showProfilePics = !isMine && profilePics !== "skip";

  return (
    <Flex
      p={2}
      pb={0}
      justifyContent={isLoading && (isMine ? "flex-end" : "flex-start")}
    >
      {isLoading ? (
        <Skeleton
          {...style}
          width={Math.random() > 0.5 ? "50%" : "40%"}
          height="55px"
        />
      ) : (
        <>
          {showProfilePics && (
            <Avatar
              name={name}
              src={profilePics}
              rounded="full"
              boxSize="30px"
              mr={3}
            />
          )}
          {!isMine && profilePics === "skip" && (
            <Box boxSize="30px" mr={3}></Box>
          )}

          <Stack
            flex={1}
            alignItems={isMine ? "flex-end" : "flex-start"}
            pos="relative"
          >
            {showName && showProfilePics && (
              <Text as="level5" bold>
                {name}
              </Text>
            )}

            <Box {...style}>
              {children}

              <Box
                position="absolute"
                zIndex="1"
                top={"50%"}
                transform="translateY(-50%)"
                left={!isMine && "calc(100% + 20px)"}
                right={isMine && "calc(100% + 20px)"}
              >
                <MoreIconButton
                  transform="rotate(90deg)"
                  color="accent.3"
                  list={moreList}
                  placement={isMine ? "left" : "right"}
                />
              </Box>
            </Box>

            {isMine && (
              <Box position="absolute" right={2} top="-3px">
                {/* <BiCheck /> */}
                <BiCheckDouble />
              </Box>
            )}

            {date && (
              <Text color="accent.3" pb={2}>
                {date}
              </Text>
            )}
          </Stack>
        </>
      )}
    </Flex>
  );
};

const ListOfUsers = ({ renderTrigger }) => {
  // const { resource: allUsers, handleFetch: handleUsersRetry } = useFetch();

  const handleSearch = () => {
    console.log("searching...");
  };

  return (
    <Modal
      renderTrigger={renderTrigger}
      renderHeader={() => "Select a user"}
      showCloseBtn
    >
      <SearchBar
        sm
        marginBottom={2}
        placeholder="First Name, Last Name, Email, Phone"
        fontSize="text.level5"
        onSearch={handleSearch}
      />

      <Text bold marginBottom={5}>
        <Box as="span" color="primary.base">
          1
        </Box>{" "}
        Users found
      </Text>

      {[0, 1, 2, 3].map((e, i) => (
        <Flex
          key={i}
          borderTop={i && "1px"}
          borderColor={i && "accent.1"}
          paddingY="3"
          transition=".05s"
          cursor="pointer"
          _hover={{ transform: "scale(1.01)" }}
        >
          <Avatar
            name="John doe"
            src={imagePlaceholder}
            boxSize="35px"
            rounded="full"
          />

          <Box marginLeft={2}>
            <Text bold textTransform="capitalize">
              John doe
            </Text>
          </Box>
        </Flex>
      ))}
    </Modal>
  );
};

const MessagingRoomsItem = ({
  id,
  msg,
  file,
  name,
  date,
  profilePics,
  unreadCount,
  isLoading,
}) => {
  const { push } = useHistory();

  const handleViewConversation = () => {
    push(`/chats?roomId=${id}`);
  };

  return (
    <HStack
      borderBottom="1px"
      borderColor="accent.1"
      paddingY="5"
      alignItems="flex-start"
      spacing={3}
      pos="relative"
    >
      {unreadCount && (
        <Grid
          placeItems="center"
          boxSize="27px"
          rounded="full"
          backgroundColor="primary.base"
          color="white"
          pos="absolute"
          top={2.5}
          left={2.5}
          zIndex={1}
          border="3px solid"
          borderColor="white"
        >
          <Text as="level5" bold>
            {unreadCount}
          </Text>
        </Grid>
      )}
      {isLoading ? (
        <SkeletonCircle boxSize="60px" />
      ) : (
        <Avatar
          name={name}
          src={profilePics}
          boxSize="60px"
          rounded="full"
          alignSelf={"center"}
          cursor="pointer"
          transition=".05s"
          _hover={{ transform: "scale(1.02)" }}
          onClick={handleViewConversation}
        />
      )}

      <Box
        flex={1}
        cursor="pointer"
        transition=".05s"
        _hover={{ transform: "scale(1.02)" }}
        onClick={handleViewConversation}
      >
        {!isLoading ? (
          <>
            <Box mb={2}>
              {name.length >= 20 ? (
                <Tooltip label={name}>
                  <Text textTransform="capitalize">
                    {truncateText(name, 20)}
                  </Text>
                </Tooltip>
              ) : (
                <Text textTransform="capitalize">{truncateText(name, 22)}</Text>
              )}

              <Text color="accent.5" as="level5">
                active
              </Text>
            </Box>

            {msg ? (
              <Text as="level5">{truncateText(msg, 56)}</Text>
            ) : (
              file && (
                <Flex
                  border="1px"
                  borderColor="accent.1"
                  p={1}
                  color="primary.base"
                  w="fit-content"
                  md
                >
                  <Text mr={1} as="level5" bold>
                    {file.name}
                  </Text>

                  <AiOutlineFile />
                </Flex>
              )
            )}
          </>
        ) : (
          <>
            <SkeletonText numberOfLines={1} mb={5} />
            <SkeletonText numberOfLines={2} />
          </>
        )}
      </Box>

      {!isLoading && (
        <Stack alignItems="center">
          <Text as="level5" opacity={0.8}>
            {date}
          </Text>

          <MoreIconButton
            list={[
              { text: "Delete Conversation" },
              { text: "View Conversation", onClick: handleViewConversation },
            ]}
          />
        </Stack>
      )}
    </HStack>
  );
};

const MoreIconButton = ({ list, placement = "bottom-end", ...rest }) => {
  return (
    <Menu placement={placement}>
      <MenuButton
        as={Box}
        cursor={!list ? "no-drop" : "pointer"}
        opacity={!list ? 0.5 : 1}
      >
        <IconButton {...rest}>
          <BiDotsVerticalRounded />
        </IconButton>
      </MenuButton>

      {list && (
        <MenuList color="black">
          {list.map((item, index) =>
            item.renderContent ? (
              <Fragment key={index}>{item.renderContent()}</Fragment>
            ) : (
              <MenuItem key={item.text} {...item}>
                {item.text}
              </MenuItem>
            )
          )}
        </MenuList>
      )}
    </Menu>
  );
};

export function Modal({
  renderHeader,
  renderTrigger,
  renderCloseBtn,
  renderPrimaryBtn,
  children,
  showCloseBtn,
  ...rest
}) {
  const props = useDisclosure();

  return (
    <>
      {renderTrigger(props)}

      <ModalChakraUI isOpen={props.isOpen} onClose={props.onClose} {...rest}>
        <ModalOverlay />

        <ModalContent>
          {renderHeader && <ModalHeader>{renderHeader(props)}</ModalHeader>}
          {showCloseBtn && <ModalCloseButton />}

          <ModalBody>{children}</ModalBody>

          {(renderPrimaryBtn || renderCloseBtn) && (
            <ModalFooter>
              {renderCloseBtn?.({
                ...props,
                style: { ghost: true, marginRight: 3 },
              })}

              {renderPrimaryBtn?.({ ...props, style: {} })}
            </ModalFooter>
          )}
        </ModalContent>
      </ModalChakraUI>
    </>
  );
}

const IconButton = ({ children, primary, ...rest }) => (
  <Button
    {...(primary ? { backgroundColor: "primary.base", color: "white" } : {})}
    asIcon
    shadow="md"
    {...rest}
  >
    {children}
  </Button>
);

export const ChatLayoutRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ChatLayout {...props} />} />;
};
