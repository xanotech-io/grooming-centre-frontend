import { BreadcrumbItem } from "@chakra-ui/breadcrumb";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import { FaEdit } from "react-icons/fa";
import { Route } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  SkeletonText,
  Text,
} from "../../../components";
import { useApp } from "../../../contexts";
import useViewLibraryFile from "./hook/useViewLibraryFile";

const ViewFileDetailsPage = () => {
  const { getOneMetadata } = useApp();
  const { library } = useViewLibraryFile();
  const libraryFile = library.data;
  const isLoading = library.loading;

  const fileIsAVideo = libraryFile?.fileExtension === "mp4";
  const fileIsPDF = libraryFile?.fileExtension === "pdf";
  const fileIsAudio = libraryFile?.fileExtension === "mpeg";

  return (
    <Box paddingX={4}>
      <Box paddingX={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/library">Library</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Details</Link>
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
          <Heading fontSize="heading.h3">File details</Heading>
          <Button
            paddingLeft={2}
            sizes="small"
            rightIcon={<FaEdit />}
            secondary
            link={`/admin/library/edit/${libraryFile?.id}`}
          >
            Edit
          </Button>
        </Flex>

        <Box backgroundColor="white" paddingX={10} paddingY={12} shadow="md">
          <Grid templateColumns="repeat(2, 1fr)" gap={10} marginBottom={10}>
            {/* Row 1 */}
            <GridItem>
              {isLoading ? (
                <SkeletonText
                  width="400px"
                  paddingBottom={8}
                  numberOfLines={2}
                />
              ) : (
                <>
                  <Heading
                    as="h3"
                    fontSize="heading.h4"
                    fontWeight="700"
                    color="black"
                    lineHeight={8}
                  >
                    Title
                  </Heading>
                  <Text>{libraryFile?.title}</Text>
                </>
              )}
            </GridItem>
            <GridItem>
              {isLoading ? (
                <SkeletonText numberOfLines={2} width="100px" />
              ) : (
                <>
                  <Heading lineHeight={8} fontSize="heading.h6">
                    Department
                  </Heading>
                  <Text>
                    {
                      getOneMetadata("departments", libraryFile?.departmentId, {
                        allMetadata: true,
                      })?.name
                    }
                  </Text>
                </>
              )}
            </GridItem>
          </Grid>

          <Box marginBottom={10}>
            {isLoading ? (
              <SkeletonText numberOfLines={14} />
            ) : (
              <>
                <Heading fontSize="heading.h6">Description</Heading>
                <Text>{libraryFile?.description}</Text>
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
                {console.log(libraryFile?.file)}
                <Heading fontSize="heading.6">File</Heading>
                <Box paddingTop={6}>
                  {fileIsAVideo ? (
                    <video
                      title="Library Video"
                      src={libraryFile?.file}
                      controls
                      width="100%"
                      height="500px"
                    />
                  ) : fileIsPDF ? (
                    <iframe
                      title="library Pdf"
                      src={libraryFile?.file}
                      width="100%"
                      height="500px"
                    />
                  ) : fileIsAudio ? (
                    <audio src={libraryFile?.file} controls />
                  ) : null}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const ViewFileDetailsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ViewFileDetailsPage {...props} />} />
  );
};
