import { Box, Flex, HStack, Icon, Stack } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/tooltip';
import { Skeleton } from '@chakra-ui/skeleton';
import PropTypes from 'prop-types';
import { AiFillBook, AiOutlineRead } from 'react-icons/ai';
import { BsFillClockFill } from 'react-icons/bs';
import { Heading, Image, Link, Text, SkeletonText, Button } from '..';
import { getDuration } from '../../utils';
import thumbnailPlaceholder from '../../assets/images/onboarding1.png';
import { useDisclosure } from '@chakra-ui/hooks';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { MdAudiotrack, MdFileDownload } from 'react-icons/md';
import { IoPlay } from 'react-icons/io5';
import { useDownload } from '../../hooks';
import { Avatar } from '@chakra-ui/avatar';

export const DownloadButton = ({ file, title, fileExtension, asIcon }) => {
  const { isLoading, handleDownload } = useDownload();

  return (
    <>
      {asIcon ? (
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          asIcon
          backgroundColor="primary.base"
          onClick={handleDownload(file, title + '.' + fileExtension)}
          _hover={{ backgroundColor: 'primary.hover' }}
          color="white"
        >
          <MdFileDownload />
        </Button>
      ) : (
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          leftIcon={<MdFileDownload />}
          mr={3}
          onClick={handleDownload(file, title + '.' + fileExtension)}
        >
          Download
        </Button>
      )}
    </>
  );
};

export const CourseBoxCard = ({
  thumbnail,
  disabled,
  duration,
  id,
  preRequisite,
  instructor,
  isLoading,
  lessonCount,
  courseTracking,
  title,
  file,
  fileExtension,
}) => {
  duration = getDuration(duration);

  console.log(preRequisite);

  const progressPercentage = courseTracking
    ? courseTracking[0]?.progressPercentage  
    : null;
  

  const preRequisiteIncomplete =
    preRequisite?.courseTracking[0]?.progressPercentage < 100;

  const isLibraryPage = /library/i.test(window.location.pathname);

  const IsVideo = /videos/i.test(window.location.pathname);

  const IsAudio = /audio/i.test(window.location.pathname);

  const IsPdf = /books/i.test(window.location.pathname);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const LibraryModal = ({ title, downloadButton, modalBody }) => {
    return (
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size={IsPdf ? 'full' : 'xl'}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex>{title}</Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody height={IsPdf ? '600px' : null}>{modalBody}</ModalBody>

          <ModalFooter>
            <Button secondary mr={3} onClick={onClose}>
              Close
            </Button>

            {downloadButton}
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <>
      {isLibraryPage ? (
        <div
          className={`course-box-card ${
            disabled ? 'course-box-card--disabled' : ''
          }`}
        >
          {IsVideo ? (
            <Box position="relative" width="100%" height="100%">
              <video
                width="100%"
                height="100%"
                controls={false}
                style={{ cursor: 'pointer' }}
                onClick={onOpen}
                src={file}
              />

              <IoPlay
                onClick={onOpen}
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '42%',
                  zIndex: 1,
                  fontSize: '48px',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.7,
                }}
              />
              <LibraryModal
                title={title}
                file={file}
                fileExtension={fileExtension}
                modalBody={
                  <video
                    autoPlay
                    controls
                    width="100%"
                    height="100%"
                    src={file}
                  />
                }
                downloadButton={
                  <DownloadButton
                    title={title}
                    file={file}
                    fileExtension={fileExtension}
                  />
                }
              />
            </Box>
          ) : null}

          <Stack
            flex={1}
            justifyContent="space-between"
            padding={2}
            paddingBottom={4}
            spacing={5}
          >
            <HStack spacing={2}>
              <Avatar
                name={instructor?.firstName + ' ' + instructor?.lastName}
                src={instructor?.profilePics}
                // isLoading={isLoading}
                boxSize="37px"
                rounded="full"
              />

              <Box flex={1}>
                {isLoading ? (
                  <>
                    <SkeletonText numberOfLines={2} />
                  </>
                ) : (
                  <>
                    <Text>
                      {`${instructor?.firstName} ${instructor?.lastName}`}
                    </Text>
                    <Text as="level5" color="accent.3">
                      {instructor?.title}
                    </Text>
                  </>
                )}
              </Box>
            </HStack>

            <Box flex={1}>
              {isLoading ? (
                <SkeletonText numberOfLines={2} />
              ) : (
                <Heading as="h3" fontSize="h4">
                  {title}
                </Heading>
              )}
            </Box>

            <Flex color="accent.3" justifyContent="space-between">
              {isLoading ? (
                <Flex width="100%" justifyContent="flex-end">
                  <Skeleton height="7px" width="80px" />
                </Flex>
              ) : (
                <Flex width="100%" justifyContent="flex-end">
                  {IsAudio ? (
                    <>
                      <Button
                        secondary
                        leftIcon={<MdAudiotrack />}
                        marginRight={4}
                        onClick={onOpen}
                      >
                        Listen
                      </Button>
                      <LibraryModal
                        title={title}
                        modalBody={
                          <audio
                            style={{ width: '100%' }}
                            autoPlay
                            src={file}
                            controls
                          />
                        }
                        downloadButton={
                          <DownloadButton
                            title={title}
                            file={file}
                            fileExtension={fileExtension}
                          />
                        }
                      />
                    </>
                  ) : IsPdf ? (
                    <>
                      <Button
                        secondary
                        leftIcon={<AiOutlineRead />}
                        marginRight={4}
                        onClick={onOpen}
                      >
                        Read
                      </Button>
                      <LibraryModal
                        title={title}
                        modalBody={
                          <iframe
                            src={file}
                            title={title}
                            height="600px"
                            width="100%"
                          />
                        }
                        downloadButton={
                          <DownloadButton
                            title={title}
                            file={file}
                            fileExtension={fileExtension}
                          />
                        }
                      />
                    </>
                  ) : null}
                  <DownloadButton
                    asIcon
                    file={file}
                    title={title}
                    fileExtension={fileExtension}
                  />
                </Flex>
              )}
            </Flex>
          </Stack>
        </div>
      ) : !preRequisiteIncomplete ? (
        <Link
          className={`course-box-card ${
            disabled ? 'course-box-card--disabled' : ''
          }`}
          href={`/courses/details/${id}`}
          disabled={isLoading}
        >
          {progressPercentage ? (
            <Box
              backgroundColor="accent.5"
              position="absolute"
              zIndex={1}
              width={`${progressPercentage}%`}
              paddingY={1}
              textShadow="1px 1px 1.5px rgba(0, 0, 0, .5)"
            >
              <Text
                transform="translateX(10px)"
                as="level5"
                color="white"
                width="100px"
              >
                progress {progressPercentage}%
              </Text>
            </Box>
          ) : null}

          <Image
            src={thumbnail || thumbnailPlaceholder}
            filter={disabled ? 'sepia(10%)' : 'none'}
            isLoading={isLoading}
            className="course-box-card__image"
            transitionDuration=".7s"
            transitionDelay=".5s"
            height={{ base: '150px' }}
            width="100%"
          />

          <Stack
            flex={1}
            justifyContent="space-between"
            padding={2}
            paddingBottom={4}
            spacing={5}
          >
            <HStack spacing={2}>
              <Avatar
                name={instructor?.firstName + ' ' + instructor?.lastName}
                src={instructor?.profilePics}
                // isloading={isLoading}
                boxSize="37px"
                rounded="full"
              />

              <Box flex={1}>
                {isLoading ? (
                  <>
                    <SkeletonText numberOfLines={2} />
                  </>
                ) : (
                  <>
                    <Text>
                      {`${instructor?.firstName} ${instructor?.lastName}`}
                    </Text>
                    <Text as="level5" color="accent.3">
                      {instructor?.title}
                    </Text>
                  </>
                )}
              </Box>
            </HStack>

            <Box flex={1}>
              {isLoading ? (
                <SkeletonText numberOfLines={2} />
              ) : (
                <>
                  <Heading as="h3" fontSize="h4">
                    {title}
                  </Heading>
                  {preRequisite && (
                    <Text>prerequisite: {preRequisite.title}</Text>
                  )}
                </>
              )}
            </Box>

            <Flex color="accent.3" justifyContent="space-between">
              {isLoading ? (
                <>
                  <Skeleton height="7px" width="80px" />
                  <Skeleton height="7px" width="80px" />
                </>
              ) : (
                <>
                  <Flex alignItems="flex-end">
                    <Icon fontSize="text.level1">
                      <AiFillBook />
                    </Icon>
                    <Text>{lessonCount} lessons</Text>
                  </Flex>
                  <Flex alignItems="flex-end">
                    <Icon fontSize="text.level1">
                      <BsFillClockFill />
                    </Icon>
                    {/* TODO: convert minutes to hours and minutes */}
                    <Text>
                      {duration?.hours}hrs {duration.minutes}mins
                    </Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Stack>
        </Link>
      ) : (
        <Tooltip
          label={`Complete ${preRequisite?.title} to have access to this course`}
          aria-label={preRequisite?.title}
        >
          <div
            className={`course-box-card ${
              disabled ? 'course-box-card--disabled' : ''
            }`}
            style={{ cursor: 'pointer' }}
          >
            {console.log(progressPercentage)}
            {progressPercentage ? (
              <Box
                backgroundColor="accent.5"
                position="absolute"
                zIndex={1}
                width={`${progressPercentage}%`}
                paddingY={1}
                textShadow="1px 1px 1.5px rgba(0, 0, 0, .5)"
              >
                <Text
                  transform="translateX(10px)"
                  as="level5"
                  color="white"
                  width="100px"
                >
                  progress {progressPercentage}%
                </Text>
              </Box>
            ) : null}

            <Image
              src={thumbnail || thumbnailPlaceholder}
              filter={disabled ? 'sepia(10%)' : 'none'}
              isLoading={isLoading}
              className="course-box-card__image"
              transitionDuration=".7s"
              transitionDelay=".5s"
              height={{ base: '150px' }}
              width="100%"
            />

            <Stack
              flex={1}
              justifyContent="space-between"
              padding={2}
              paddingBottom={4}
              spacing={5}
            >
              <HStack spacing={2}>
                <Avatar
                  name={instructor?.firstName + ' ' + instructor?.lastName}
                  src={instructor?.profilePics}
                  // isloading={isLoading}
                  boxSize="37px"
                  rounded="full"
                />

                <Box flex={1}>
                  {isLoading ? (
                    <>
                      <SkeletonText numberOfLines={2} />
                    </>
                  ) : (
                    <>
                      <Text>
                        {`${instructor?.firstName} ${instructor?.lastName}`}
                      </Text>
                      <Text as="level5" color="accent.3">
                        {instructor?.title}
                      </Text>
                    </>
                  )}
                </Box>
              </HStack>

              <Box flex={1}>
                {isLoading ? (
                  <SkeletonText numberOfLines={2} />
                ) : (
                  <>
                    <Heading as="h3" fontSize="h4">
                      {title}
                    </Heading>
                    {preRequisite && (
                      <Text>prerequisite: {preRequisite.title}</Text>
                    )}
                  </>
                )}
              </Box>

              <Flex color="accent.3" justifyContent="space-between">
                {isLoading ? (
                  <>
                    <Skeleton height="7px" width="80px" />
                    <Skeleton height="7px" width="80px" />
                  </>
                ) : (
                  <>
                    <Flex alignItems="flex-end">
                      <Icon fontSize="text.level1">
                        <AiFillBook />
                      </Icon>
                      <Text>{lessonCount} lessons</Text>
                    </Flex>
                    <Flex alignItems="flex-end">
                      <Icon fontSize="text.level1">
                        <BsFillClockFill />
                      </Icon>
                      {/* TODO: convert minutes to hours and minutes */}
                      <Text>
                        {duration?.hours}hrs {duration.minutes}mins
                      </Text>
                    </Flex>
                  </>
                )}
              </Flex>
            </Stack>
          </div>
        </Tooltip>
      )}
    </>
  );
};

CourseBoxCard.propTypes = {
  thumbnail: PropTypes.string,
  disabled: PropTypes.bool,
  duration: PropTypes.number,
  id: PropTypes.string,
  isLoading: PropTypes.bool,
  lessonCount: PropTypes.number,
  title: PropTypes.string,
  instructor: PropTypes.shape({
    profilePics: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    role: PropTypes.string,
  }),
};
