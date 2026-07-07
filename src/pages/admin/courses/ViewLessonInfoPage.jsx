import { useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/layout";
import { BreadcrumbItem, Badge } from "@chakra-ui/react";
import {
  Heading,
  Breadcrumb,
  Button,
  Text,
  Link,
  SkeletonText,
  RichTextToView,
  WorkflowSubmitModal,
} from "../../../components";
import { FaEdit, FaDownload, FaFilePowerpoint, FaSitemap } from "react-icons/fa";
import useViewLessonInfo from "./hooks/useViewLessonInfo";
import { Skeleton } from "@chakra-ui/skeleton";
import dayjs from "dayjs";

const ViewLessonInfoPage = () => {
  const manager = useViewLessonInfo();
  const { courseId } = useParams();
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  const { lesson, isLoading } = manager;

  console.log(lesson?.file);

  const fileIsAVideo = /((\.)(mp4|mkv))$/i.test(lesson?.file);
  const fileIsPowerPoint = /((\.)(ppt|pptx))$/i.test(lesson?.file) || lesson?.lessonType?.name === "PowerPoint";

  const handleDownloadFile = () => {
    if (lesson?.file) {
      const link = document.createElement('a');
      link.href = lesson.file;
      link.download = lesson.file.split('/').pop() || 'lesson-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box paddingX={4}>
      <Box paddingX={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/courses">Courses </Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href={`/admin/courses/details/${courseId}/lessons`}>
                Lessons
              </Link>
            </BreadcrumbItem>
          }
          item4={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">View</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Box marginY={2} padding={4}>
        <Flex
          paddingBottom={6}
          justifyContent="space-between"
          alignContent="center"
          flexDirection="row"
        >
          <Heading fontSize="heading.h3">Lesson details</Heading>
          <Flex gap={3}>
            <Button
              disabled={!lesson}
              paddingLeft={2}
              sizes="small"
              rightIcon={<FaSitemap />}
              secondary
              onClick={() => setIsWorkflowModalOpen(true)}
            >
              Submit for Approval
            </Button>
            <Button
              disabled={!lesson}
              paddingLeft={2}
              sizes="small"
              rightIcon={<FaEdit />}
              secondary
              link={`/admin/courses/${lesson?.courseId}/lessons/edit/${lesson?.id}`}
            >
              Edit
            </Button>
          </Flex>
        </Flex>

        <Box backgroundColor="white" paddingX={10} paddingY={12} shadow="md">
          {isLoading ? (
            <SkeletonText width="400px" paddingBottom={8} numberOfLines={1} />
          ) : (
            <Heading
              as="h3"
              fontSize="heading.h4"
              fontWeight="700"
              color="black"
              paddingBottom={8}
            >
              {lesson?.title}
            </Heading>
          )}
          <Grid templateColumns="repeat(2, 1fr)" marginBottom={10}>
            <GridItem>
              {isLoading ? (
                <SkeletonText numberOfLines={2} width="100px" />
              ) : (
                <>
                  <Heading lineHeight={8} fontSize="heading.h6">
                    Start Date
                  </Heading>
                  <Text>
                    {dayjs(lesson?.startTime).format("DD/MM/YYYY h:mm a")}
                  </Text>
                </>
              )}
            </GridItem>
            <GridItem>
              {isLoading ? (
                <SkeletonText numberOfLines={2} width="100px" />
              ) : (
                <>
                  <Heading lineHeight={8} fontSize="heading.h6">
                    Status
                  </Heading>
                  <Text>
                    {lesson?.active === true ? (
                      <Badge
                        variant="subtle"
                        borderRadius={5}
                        paddingX={4}
                        paddingY="2px"
                        textTransform="none"
                        backgroundColor="others.6"
                        color="others.5"
                      >
                        Active
                      </Badge>
                    ) : null || lesson?.active === false ? (
                      <Badge variant="subtle" colorScheme="red">
                        Inactive
                      </Badge>
                    ) : null}
                  </Text>
                </>
              )}
            </GridItem>
          </Grid>
          <Box marginBottom={10}>
            {isLoading ? (
              <SkeletonText numberOfLines={2} width="100px" />
            ) : (
              <>
                <Heading lineHeight={8} fontSize="heading.h6">
                  End Date
                </Heading>
                <Text>{dayjs(lesson?.endTime).format("DD/MM/YY h:mm a")}</Text>
              </>
            )}
          </Box>
          <Box marginBottom={10}>
            {isLoading ? (
              <SkeletonText numberOfLines={14} />
            ) : (
              <>
                <Heading fontSize="heading.h6">Content</Heading>
                <RichTextToView
                  marginTop={4}
                  padding={5}
                  rounded="md"
                  shadow="md"
                  text={lesson?.content}
                />
              </>
            )}
          </Box>
          <Box>
            {isLoading ? (
              <>
                <SkeletonText
                  numberOfLines={1}
                  paddingBottom={4}
                  width="300px"
                />
                <Skeleton height="500px" />
              </>
            ) : (
              <>
                {console.log(lesson?.file)}
                <Heading fontSize="heading.6">Lesson File</Heading>
                <Box paddingTop={6}>
                  {fileIsPowerPoint ? (
                    <Flex
                      direction="column"
                      alignItems="center"
                      justifyContent="center"
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      padding={8}
                      minHeight="300px"
                      backgroundColor="gray.50"
                    >
                      <FaFilePowerpoint size={80} color="#D24726" style={{ marginBottom: '16px' }} />
                      <Heading fontSize="lg" color="gray.700" marginBottom={2}>
                        PowerPoint Presentation
                      </Heading>
                      <Text color="gray.600" marginBottom={4} textAlign="center">
                        {lesson?.file?.split('/').pop() || 'Presentation.pptx'}
                      </Text>
                      <Button
                        leftIcon={<FaDownload />}
                        colorScheme="orange"
                        size="lg"
                        onClick={handleDownloadFile}
                      >
                        Download PowerPoint File
                      </Button>
                    </Flex>
                  ) : fileIsAVideo ? (
                    <iframe
                      title="Lesson Video"
                      src={lesson?.file}
                      width="100%"
                      height="500px"
                    />
                  ) : (
                    <iframe
                      title="Lesson Pdf"
                      src={lesson?.file}
                      width="100%"
                      height="500px"
                      // width="320px"
                      // height="400px"
                    />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <WorkflowSubmitModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        contentId={lesson?.id}
        contentTitle={lesson?.title}
        requestType="Lesson"
      />
    </Box>
  );
};

export const ViewLessonInfoPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ViewLessonInfoPage {...props} />} />
  );
};
