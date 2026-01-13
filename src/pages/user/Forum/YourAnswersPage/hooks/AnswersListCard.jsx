import { Flex, HStack, Stack, Text } from '@chakra-ui/layout';
import React, { useState } from 'react';
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from 'react-icons/ai';
import { FiChevronsDown, FiCornerDownRight, FiMenu } from 'react-icons/fi';
import { PlainButtonWithIcon } from '../../../../../components';
import CommentForm from '../../Comments/CommentForm';

const useCommentListCard = () => {
  const [displayEditForm, setDisplayEditForm] = useState(false);
  const [displayReplyForm, setDisplayReplyForm] = useState(false);

  const handleDisplayReplyForm = () => setDisplayReplyForm(true);
  const handleHideReplyForm = () => setDisplayReplyForm(false);

  const handleDisplayEditForm = () => setDisplayEditForm(true);
  const handleHideEditForm = () => setDisplayEditForm(false);

  return {
    displayReplyForm,
    displayEditForm,
    handleDisplayReplyForm,
    handleHideReplyForm,
    handleDisplayEditForm,
    handleHideEditForm,
  };
};

const AnswersListCard = ({
  id,
  questionId,
  createdAt,
  body,
  replyCount,
  likes,
  dislikes,
  user,
  onReplySuccess,
  onCommentEditSuccess,
  onCommentDelete,
  deleteStatusIsLoading,
  expStatusIsLoading,
  onCommentExpression,
  onReplyToggle,
  displayReplies,
  noBorder,
  active,
  mentionedUser,
  deactivateAddComment,
}) => {
  const {
    displayReplyForm,
    displayEditForm,
    handleDisplayReplyForm,
    handleDisplayEditForm,
    handleHideEditForm,
    handleHideReplyForm,
  } = useCommentListCard();

  return (
    <Stack
      paddingY={3}
      paddingX={6}
      spacing={3}
      shadow="2px 1px 5px rgba(0, 0, 0, 0.15)"
      margin={1}
      marginBottom={5}
      borderColor="accent.7"
      position="relative"
    >
      <Text>{body}</Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderTop="1px"
        borderColor="accent.1"
        paddingTop={2}
      >
        {active && (
          <HStack spacing={3}>
            <PlainButtonWithIcon
              _active={{
                transform: 'scale(1.03)',
              }}
              text={likes}
              icon={<AiOutlineLike />}
            />

            <PlainButtonWithIcon
              _active={{
                transform: 'scale(1.03)',
              }}
              text={dislikes}
              icon={<AiOutlineDislike />}
              // onClick={onCommentExpression?.bind(null, id, {
              //   commentId: id,
              //   expression: 'dislike',
              //   userId: loggedInUser?.id,
              // })}
              // disabled={expStatusIsLoading === id ? true : false}
              // cursor={expStatusIsLoading === id ? 'no-drop' : 'pointer'}
              // opacity={expStatusIsLoading === id ? '.7' : '1'}
            />
          </HStack>
        )}

        <HStack spacing={3} flex={1} justifyContent="flex-end">
          {questionId && (
            <PlainButtonWithIcon
              color="accent.6"
              text={'View question'}
              icon={<FiMenu />}
              link={`/forum/questions/details/${questionId}`}
            />
          )}

          {/* <PlainButtonWithIcon
            color="accent.6"
            text={`${displayReplies ? 'Hide' : 'Show'} All Replies (${0})`}
            icon={<FiChevronsDown />}
            onClick={onReplyToggle}
          />

          {onReplySuccess && (
            <PlainButtonWithIcon
              color="accent.6"
              text="Reply"
              icon={<FiCornerDownRight />}
              disabled={!active}
              opacity={!active ? 0.7 : 1}
              onClick={handleDisplayReplyForm}
            />
          )} */}
        </HStack>
      </Flex>
      {displayReplyForm && active && (
        <CommentForm
          onReplySuccess={onReplySuccess}
          onCancel={handleHideReplyForm}
          commentId={id}
          isReply
          mute
        />
      )}
    </Stack>
  );
};

export default AnswersListCard;
