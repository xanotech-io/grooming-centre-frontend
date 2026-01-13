import { Box, Flex, HStack, Stack } from "@chakra-ui/layout";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { ForumMessageCardMoreIconButton, PlainButtonWithIcon, Text } from "..";
import { useLoggedInUserIsTheCreator } from "../../hooks";
import CommentForm from "../../pages/user/Forum/Comments/CommentForm";
import { formatToUsername, getFullName } from "../../utils";

const useReplyListCard = () => {
  const [displayEditForm, setDisplayEditForm] = useState(false);

  const handleDisplayEditForm = () => setDisplayEditForm(true);
  const handleHideEditForm = () => setDisplayEditForm(false);

  return {
    displayEditForm,
    handleHideEditForm,
    handleDisplayEditForm,
  };
};

export const ReplyListCard = ({
  id,
  body,
  user,
  deleteStatusIsLoading,
  onReplyDeleteSuccess,
  onReplyEditSuccess,
  commentId,
  viewQuestion,
  questionId,
  mentionedUser,
}) => {
  const { displayEditForm, handleHideEditForm, handleDisplayEditForm } =
    useReplyListCard();

  const wrapperRef = useRef();

  useEffect(() => {
    wrapperRef.current.focus();
  }, []);

  const showMoreIconButton = useLoggedInUserIsTheCreator(user);

  return (
    <Stack
      paddingTop={3}
      paddingBottom={showMoreIconButton ? 1 : 3}
      paddingX={6}
      spacing={3}
      shadow="2px 1px 5px rgba(0, 0, 0, 0.15)"
      margin={1}
      marginBottom={5}
      borderLeft="10px solid"
      borderColor="accent.6"
      ref={wrapperRef}
      tabIndex={0}
    >
      {mentionedUser && (
        <Text
          opacity={0.76}
          borderBottom="1px"
          borderColor="accent.2"
          paddingBottom={2}
        >
          Mentioned{" "}
          <Box as="b" color="secondary.6">
            {formatToUsername(getFullName(mentionedUser))}
          </Box>
        </Text>
      )}

      {displayEditForm ? (
        <CommentForm
          initValue={body}
          onReplySuccess={onReplyEditSuccess}
          commentId={commentId}
          replyId={id}
          onCancel={handleHideEditForm}
          mute
          isReply
        />
      ) : (
        <Text paddingBottom={2}>{body}</Text>
      )}

      <Flex
        borderTop="1px"
        borderColor="accent.1"
        color="accent.3"
        paddingTop={2}
        justifyContent={user ? "space-between" : "flex-end"}
      >
        {user && (
          <Text>
            by <b>{formatToUsername(user.fullName)}</b>
          </Text>
        )}

        <HStack>
          {viewQuestion && (
            <PlainButtonWithIcon
              color="accent.6"
              text={"View question"}
              icon={<FiMenu />}
              link={`/forum/questions/details/${questionId}`}
            />
          )}

          {showMoreIconButton && (
            <ForumMessageCardMoreIconButton
              onEdit={handleDisplayEditForm}
              onDelete={onReplyDeleteSuccess?.bind(null, commentId, id)}
              deleteStatusIsLoading={
                deleteStatusIsLoading === id ? true : false
              }
              context="reply"
            />
          )}
        </HStack>
      </Flex>
    </Stack>
  );
};

ReplyListCard.propTypes = {
  onReplyDeleteSuccess: PropTypes.func,
  onReplyEditSuccess: PropTypes.func,
  deleteStatusIsLoading: PropTypes.any,
  commentId: PropTypes.string,
  id: PropTypes.string,
  body: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string,
    fullName: PropTypes.string,
  }),
};
