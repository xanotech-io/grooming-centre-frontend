import { Box, Flex, HStack, Stack } from '@chakra-ui/layout';
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from 'react-icons/ai';
import { FiChevronsDown, FiCornerDownRight, FiMenu } from 'react-icons/fi';
import { DeletedMsg, Image, Link, Text } from '..';
import { ForumMessageCardMoreIconButton } from './QuestionListCard';
import thumbnailPlaceholder from '../../assets/images/onboarding1.png';
import { capitalizeWords, formatToUsername, getFullName } from '../../utils';
import CommentForm from '../../pages/user/Forum/Comments/CommentForm';
import { useLoggedInUserIsTheCreator } from '../../hooks';
import { useApp } from '../../contexts';

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

export const CommentListCard = ({
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
  expressions,
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

  const showMoreIconButton = useLoggedInUserIsTheCreator(user);

  const {
    state: { user: loggedInUser },
  } = useApp();

  const currentExpression = expressions.find(
    (exp) => exp.userId === loggedInUser?.id
  );

  const hasLiked = currentExpression?.expression === 'like';
  const hasDisliked = currentExpression?.expression === 'dislike';

  return (
    <Stack
      paddingY={3}
      paddingX={6}
      spacing={3}
      shadow="2px 1px 5px rgba(0, 0, 0, 0.15)"
      margin={1}
      marginBottom={5}
      borderLeft={!noBorder && '5px solid'}
      borderColor="accent.7"
      position="relative"
    >
      <Box>
        {user ? (
          <Flex
            alignItems="center"
            justifyContent="space-between"
            marginBottom={2}
          >
            <HStack spacing={5}>
              <Image
                src={user.profilePics || thumbnailPlaceholder}
                boxSize="30px"
                rounded="full"
              />

              <Box flex={1}>
                <Text bold>{capitalizeWords(user.fullName)}</Text>
                <Text as="level5" color="accent.3">
                  {createdAt}
                </Text>
              </Box>
            </HStack>

            {showMoreIconButton && active && (
              <ForumMessageCardMoreIconButton
                onEdit={handleDisplayEditForm}
                onDelete={onCommentDelete?.bind(null, id)}
                deleteStatusIsLoading={
                  deleteStatusIsLoading === id ? true : false
                }
                context="comment"
              />
            )}
          </Flex>
        ) : (
          showMoreIconButton &&
          active && (
            <Box position="absolute" top={1} right={1}>
              <ForumMessageCardMoreIconButton
                onEdit={handleDisplayEditForm}
                onDelete={onCommentDelete?.bind(null, id)}
                deleteStatusIsLoading={
                  deleteStatusIsLoading === id ? true : false
                }
                context="comment"
              />
            </Box>
          )
        )}
        {mentionedUser && (
          <Text opacity={0.76}>
            Mentioned{' '}
            <Box as="b" color="secondary.6">
              {formatToUsername(getFullName(mentionedUser))}
            </Box>
          </Text>
        )}
      </Box>

      {active ? (
        displayEditForm ? (
          <CommentForm
            initValue={body}
            onCommentSuccess={onCommentEditSuccess}
            commentId={id}
            onCancel={handleHideEditForm}
            mute
            inputMinHeight="100px"
          />
        ) : (
          <Text paddingBottom={2}>{body}</Text>
        )
      ) : (
        <DeletedMsg context="comment" />
      )}

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
              icon={hasLiked ? <AiFillLike color="blue" /> : <AiOutlineLike />}
              onClick={onCommentExpression?.bind(null, id, {
                commentId: id,
                expression: 'like',
                userId: loggedInUser?.id,
              })}
              disabled={expStatusIsLoading === id ? true : false}
              cursor={expStatusIsLoading === id ? 'no-drop' : 'pointer'}
              opacity={expStatusIsLoading === id ? '.7' : '1'}
            />

            <PlainButtonWithIcon
              _active={{
                transform: 'scale(1.03)',
              }}
              text={dislikes}
              icon={
                hasDisliked ? (
                  <AiFillDislike color="blue" />
                ) : (
                  <AiOutlineDislike />
                )
              }
              onClick={onCommentExpression?.bind(null, id, {
                commentId: id,
                expression: 'dislike',
                userId: loggedInUser?.id,
              })}
              disabled={expStatusIsLoading === id ? true : false}
              cursor={expStatusIsLoading === id ? 'no-drop' : 'pointer'}
              opacity={expStatusIsLoading === id ? '.7' : '1'}
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

          {replyCount && !questionId ? (
            <PlainButtonWithIcon
              color="accent.6"
              text={`${
                displayReplies ? 'Hide' : 'Show'
              } All Replies (${replyCount})`}
              icon={<FiChevronsDown />}
              onClick={onReplyToggle}
            />
          ) : null}

          {onReplySuccess && (
            <PlainButtonWithIcon
              color="accent.6"
              text="Reply"
              icon={<FiCornerDownRight />}
              disabled={!active}
              opacity={!active ? 0.7 : 1}
              onClick={handleDisplayReplyForm}
            />
          )}
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

export const PlainButtonWithIcon = ({ icon, text, link, ...rest }) => {
  const renderContent = () => (
    <Flex {...rest} alignItems="center" as={!link && 'button'}>
      {icon}

      <Text as="level5" marginLeft={1}>
        {text}
      </Text>
    </Flex>
  );

  return link ? <Link href={link}> {renderContent()}</Link> : renderContent();
};

CommentListCard.propTypes = {
  id: PropTypes.string,
  questionId: PropTypes.string,
  body: PropTypes.string,
  createdAt: PropTypes.string,
  replyCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  likes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dislikes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  user: PropTypes.shape({
    id: PropTypes.string,
    profilePics: PropTypes.string,
    fullName: PropTypes.string,
  }),
  mentionedUser: PropTypes.object,
  onReplyToggle: PropTypes.func,
  displayReplies: PropTypes.bool,
  onReplySuccess: PropTypes.func,
  onCommentEditSuccess: PropTypes.func,
  noBorder: PropTypes.bool,
  active: PropTypes.bool,
  deleteStatusIsLoading: PropTypes.any,
};
