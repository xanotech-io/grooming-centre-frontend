import { useToast } from '@chakra-ui/toast';
import Icon from '@chakra-ui/icon';
import { useHistory } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { Box, Flex, HStack, Stack } from '@chakra-ui/layout';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { BiComment } from 'react-icons/bi';
import { HiDotsVertical } from 'react-icons/hi';
import { Image, Link, SelectedTags, Text } from '..';
import thumbnailPlaceholder from '../../assets/images/onboarding1.png';
import { capitalizeWords, formatToUsername, getFullName } from '../../utils';
import { Button } from '../';
import { useLoggedInUserIsTheCreator } from '../../hooks';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { userForumDeleteQuestion } from '../../services';

export const QuestionListCard = ({
  id,
  title,
  body,
  commentCount,
  tags,
  user,
  disabled,
  createdAt,
  active,
  onDeleteSuccess,
  mentionedUser,
}) => {
  const boxStyle = {
    boxShadow: '2px 1px 5px rgba(0, 0, 0, 0.15)',
    margin: '4px',
    marginBottom: '28px',
    display: 'block',
    borderRadius: '5px',
  };

  const showMoreIconButton = useLoggedInUserIsTheCreator(user);

  const { push, location } = useHistory();
  const toast = useToast();

  const handleEdit = () => {
    push(
      `/forum/your-questions/add?questionId=${id}&redirectTo=${
        location.pathname + location.search
      }`
    );
  };

  const handleDelete = async () => {
    try {
      await userForumDeleteQuestion(id);

      toast({
        description: 'Question deleted successfully',
        position: 'top',
        duration: 500,
        status: 'success',
      });

      onDeleteSuccess();
    } catch (error) {
      toast({
        description: capitalizeWords(error.message),
        position: 'top',
        duration: 1000,
        status: 'error',
      });
    }
  };

  return (
    <Stack
      padding={user ? 6 : 4}
      paddingTop={user ? 4 : 1}
      spacing={4}
      {...boxStyle}
      position="relative"
      _hover={
        !disabled && {
          transform: 'scale(1.005)',
          cursor: 'pointer',
        }
      }
    >
      {!disabled && (
        <Link
          href={`/forum/questions/details/${id}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        ></Link>
      )}

      {user && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          marginBottom={2}
        >
          <HStack spacing={5}>
            <Image
              src={user?.profilePics || thumbnailPlaceholder}
              boxSize="40px"
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              position="relative"
            />
          )}
        </Flex>
      )}

      {mentionedUser && (
        <Text opacity={0.76}>
          Mentioned{' '}
          <Box as="b" color="secondary.6">
            {formatToUsername(getFullName(mentionedUser))}
          </Box>
        </Text>
      )}

      {active ? (
        <>
          <Flex alignItems="center" justifyContent="space-between">
            <Text bold as="level3">
              {title}
            </Text>

            {showMoreIconButton && !user && (
              <ForumMessageCardMoreIconButton
                position="relative"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </Flex>

          <Text>{body}</Text>
        </>
      ) : (
        <DeletedMsg />
      )}

      <Flex justifyContent="space-between" alignItems="center">
        {active && <SelectedTags tags={tags} />}

        <Flex justifyContent="flex-end" flex={1}>
          <Icon fontSize="heading.h4" transform="translateY(3px)">
            <BiComment />
          </Icon>

          <Text>{commentCount}</Text>
        </Flex>
      </Flex>
    </Stack>
  );
};

export const ForumMessageCardMoreIconButton = ({
  context = 'question',
  onEdit,
  onDelete,
  deleteStatusIsLoading,
  ...rest
}) => {
  return (
    <Menu placement="bottom-end">
      <MenuButton
        padding={2}
        rounded="full"
        _hover={{ backgroundColor: 'secondary.05' }}
        {...rest}
      >
        <HiDotsVertical />
      </MenuButton>

      <MenuList position="relative" zIndex={2}>
        <MenuItem onClick={onEdit}>Edit {context}</MenuItem>

        <DeleteMenuItemButton
          context={context}
          onDelete={onDelete}
          deleteStatusIsLoading={deleteStatusIsLoading}
        />
      </MenuList>
    </Menu>
  );
};

export function DeleteMenuItemButton({
  context,
  onDelete,
  deleteStatusIsLoading,
  renderTrigger,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      {renderTrigger ? (
        renderTrigger({ isOpen, onOpen, onClose })
      ) : (
        <MenuItem color="secondary.6" onClick={onOpen}>
          Delete {context}
        </MenuItem>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            Are you sure you want to continue? This action cannot be reversed.
          </ModalBody>

          <ModalFooter>
            <Button marginRight={3} onClick={onClose} sm ghost>
              Close
            </Button>
            <Button
              sm
              onClick={() => onDelete({ onClose })}
              isLoading={deleteStatusIsLoading}
              disabled={deleteStatusIsLoading}
            >
              Delete {context}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export const DeletedMsg = ({ context = 'question' }) => (
  <Flex flexDir="column" justifyContent="center" alignItems="center" h="80px">
    <Icon color="red.500" fontSize="heading.h3">
      <AiOutlineCloseCircle />
    </Icon>
    <Text bold as="level3">
      This {context} has been deleted
    </Text>
  </Flex>
);

QuestionListCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  body: PropTypes.string,
  createdAt: PropTypes.string,
  active: PropTypes.bool,
  onDeleteSuccess: PropTypes.func,
  commentCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  user: PropTypes.shape({
    id: PropTypes.string,
    profilePics: PropTypes.string,
    fullName: PropTypes.string,
  }),
};
