import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Badge,
  Spinner,
  Divider,
  Textarea,
  Select as ChakraSelect,
  FormControl,
  FormLabel,
  useToast,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaSave, FaEye, FaEdit } from "react-icons/fa";
import { convertFromRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { Button, Heading, RichText, RichTextToView, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFetch, useRichText } from "../../../hooks";
import {
  getCourseContent,
  createCourseContent,
  updateCourseContent,
} from "../../../services";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getApprovalBadge = (status) => {
  const map = {
    Approved: { bg: "#E6F4EA", color: "#38A169" },
    Pending: { bg: "#FFF5EA", color: "#DD6B20" },
    Rejected: { bg: "#FED7D7", color: "#E53E3E" },
  };
  const s = map[status] || { bg: "gray.100", color: "gray.600" };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="10px"
      py="3px"
      borderRadius="10px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {status}
    </Badge>
  );
};

const getPublishBadge = (status) => {
  const map = {
    Published: { bg: "#E6F4EA", color: "#38A169" },
    Draft: { bg: "#EDF2F7", color: "#4A5568" },
  };
  const s = map[status] || { bg: "gray.100", color: "gray.600" };
  return (
    <Badge
      bg={s.bg}
      color={s.color}
      px="10px"
      py="3px"
      borderRadius="10px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {status}
    </Badge>
  );
};

const MetaRow = ({ label, value }) => (
  <Box mb="14px">
    <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" mb="2px">
      {label}
    </Text>
    <Text fontSize="13px" color="gray.700" fontWeight="500">
      {value || "—"}
    </Text>
  </Box>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const CourseContentEditorPage = () => {
  const { courseId, contentId } = useParams();
  const isEditMode = contentId && contentId !== "new";
  const history = useHistory();
  const toast = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [publishStatus, setPublishStatus] = useState("Draft");
  const [changeSummary, setChangeSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedContent, setSavedContent] = useState(null);

  // Rich text editor hook
  const contentManager = useRichText();

  // Fetch existing content when in edit mode
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    if (!isEditMode) return null;
    const { content } = await getCourseContent(courseId, contentId);
    return { content };
  }, [courseId, contentId, isEditMode]);

  useEffect(() => {
    if (isEditMode) handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher, isEditMode]);

  // Seed form when content loads
  useEffect(() => {
    const content = resource.data?.content;
    if (content) {
      setTitle(content.title || "");
      setPublishStatus(content.publishStatus || "Draft");
      setChangeSummary(content.changeSummary || "");
      contentManager.handleInitData(content.draftContent);
      setSavedContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.data]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let htmlContent = "";
    try {
      const stringified = contentManager.handleGetValueAndValidate("Content");
      const raw = JSON.parse(stringified);
      htmlContent = stateToHTML(convertFromRaw(raw));
    } catch (err) {
      toast({
        title: err.message || "Content is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        content: htmlContent,
        fileType: "HTML",
        publishStatus,
        changeSummary: changeSummary.trim(),
      };

      const { message, content } = isEditMode
        ? await updateCourseContent(courseId, contentId, body)
        : await createCourseContent(courseId, body);

      setSavedContent(content);
      toast({
        title: message || "Content saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (!isEditMode && content?.contentId) {
        history.replace(
          `/admin/courses/${courseId}/content/${content.contentId}`,
        );
      }
    } catch {
      toast({
        title: "Failed to save content",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading / error state for edit mode initial fetch
  if (isEditMode && resource.loading) {
    return (
      <Flex
        height="calc(100vh - 200px)"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (isEditMode && resource.err) {
    return (
      <Flex
        height="calc(100vh - 200px)"
        justifyContent="center"
        alignItems="center"
      >
        <Text color="red.500">Failed to load content. Please try again.</Text>
      </Flex>
    );
  }

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Course Content Editor</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Box marginX="22px" marginY="20px">
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="24px">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<FaArrowLeft />}
          onClick={() => history.push(`/admin/courses/details/${courseId}`)}
          color="gray.500"
          px="8px"
        >
          Back to Course
        </Button>
        <Divider orientation="vertical" height="20px" />
        <Heading fontSize="20px" fontWeight="600">
          {isEditMode ? "Edit Course Content" : "Create Course Content"}
        </Heading>
        {savedContent?.versionNumber && (
          <Badge
            bg="#EBF8FF"
            color="#2B6CB0"
            px="10px"
            py="3px"
            borderRadius="10px"
            fontSize="12px"
            fontWeight="600"
          >
            {savedContent.versionNumber}
          </Badge>
        )}
        {savedContent?.approvalStatus &&
          getApprovalBadge(savedContent.approvalStatus)}
        {savedContent?.publishStatus &&
          getPublishBadge(savedContent.publishStatus)}
      </Flex>

      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 280px" }}
        gap="24px"
        alignItems="start"
      >
        {/* ---- Left: Editor ---- */}
        <Box
          bg="white"
          borderRadius="8px"
          border="1px solid #E2E8F0"
          overflow="hidden"
        >
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList px="16px" pt="12px" borderBottom="1px solid #E2E8F0">
              <Tab fontSize="13px" fontWeight="500" _selected={{ color: "blue.600", borderColor: "blue.500" }}>
                <Flex alignItems="center" gap="6px">
                  <FaEdit size={12} />
                  Edit
                </Flex>
              </Tab>
              <Tab fontSize="13px" fontWeight="500" _selected={{ color: "blue.600", borderColor: "blue.500" }}>
                <Flex alignItems="center" gap="6px">
                  <FaEye size={12} />
                  Preview
                </Flex>
              </Tab>
            </TabList>

            <TabPanels>
              {/* ---- Edit Tab ---- */}
              <TabPanel p="24px">
                {/* Title */}
                <FormControl mb="20px" isRequired>
                  <FormLabel
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.600"
                    mb="6px"
                  >
                    Content Title
                  </FormLabel>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to Crop Science"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid #CBD5E0",
                      borderRadius: "6px",
                      outline: "none",
                      color: "#2D3748",
                    }}
                  />
                </FormControl>

                {/* Rich Text Editor */}
                <Box mb="20px">
                  <RichText
                    id="course-content"
                    label="Content"
                    isRequired
                    defaultValue={contentManager.data.default}
                    onChange={contentManager.handleChange}
                  />
                </Box>

                {/* Publish Status */}
                <FormControl mb="20px">
                  <FormLabel
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.600"
                    mb="6px"
                  >
                    Publish Status
                  </FormLabel>
                  <ChakraSelect
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value)}
                    size="sm"
                    borderRadius="6px"
                    maxW="200px"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </ChakraSelect>
                </FormControl>

                {/* Change Summary */}
                <FormControl mb="28px">
                  <FormLabel
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.600"
                    mb="6px"
                  >
                    Change Summary
                    <Text as="span" fontSize="12px" color="gray.400" fontWeight="400" ml="6px">
                      (optional)
                    </Text>
                  </FormLabel>
                  <Textarea
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="e.g. Updated lesson text & images"
                    size="sm"
                    borderRadius="6px"
                    rows={2}
                  />
                </FormControl>

                {/* Save button */}
                <Flex justifyContent="flex-end">
                  <Button
                    leftIcon={<FaSave />}
                    onClick={handleSave}
                    isLoading={isSubmitting}
                    loadingText="Saving..."
                    bg="#6b006b"
                    color="white"
                    _hover={{ bg: "#560056" }}
                    size="md"
                  >
                    {isEditMode ? "Save Changes" : "Create Content"}
                  </Button>
                </Flex>
              </TabPanel>

              {/* ---- Preview Tab ---- */}
              <TabPanel p="24px">
                {title && (
                  <Text
                    fontSize="18px"
                    fontWeight="700"
                    color="gray.800"
                    mb="16px"
                  >
                    {title}
                  </Text>
                )}
                {contentManager.data.stringified ? (
                  <Box
                    border="1px solid #E2E8F0"
                    borderRadius="6px"
                    p="20px"
                    minH="200px"
                    sx={{
                      "& h1": { fontSize: "22px", fontWeight: "700", mb: "10px" },
                      "& h2": { fontSize: "18px", fontWeight: "600", mb: "8px" },
                      "& strong": { fontWeight: "700" },
                      "& em": { fontStyle: "italic" },
                      "& ul": { pl: "24px", listStyleType: "disc" },
                      "& ol": { pl: "24px" },
                      "& p": { mb: "8px" },
                    }}
                  >
                    <RichTextToView text={contentManager.data.stringified} />
                  </Box>
                ) : (
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    minH="200px"
                    border="1px dashed #CBD5E0"
                    borderRadius="6px"
                  >
                    <Text color="gray.400" fontSize="14px">
                      Start typing in the Edit tab to see a preview here.
                    </Text>
                  </Flex>
                )}

                {savedContent?.formattingApplied?.htmlTags?.length > 0 && (
                  <Box mt="20px">
                    <Text fontSize="12px" color="gray.400" fontWeight="600" textTransform="uppercase" mb="8px">
                      HTML Tags Used
                    </Text>
                    <Flex flexWrap="wrap" gap="6px">
                      {savedContent.formattingApplied.htmlTags.map((tag) => (
                        <Badge
                          key={tag}
                          bg="#EDF2F7"
                          color="#4A5568"
                          px="8px"
                          py="3px"
                          borderRadius="4px"
                          fontSize="11px"
                          fontFamily="mono"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* ---- Right: Metadata panel ---- */}
        <Box
          bg="white"
          borderRadius="8px"
          border="1px solid #E2E8F0"
          p="20px"
          position="sticky"
          top="20px"
        >
          <Text
            fontSize="12px"
            fontWeight="700"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.05em"
            mb="16px"
          >
            Content Info
          </Text>

          <MetaRow label="Content ID" value={savedContent?.contentId} />
          <MetaRow label="Course ID" value={courseId} />
          <MetaRow label="File Type" value={savedContent?.fileType || "HTML"} />

          <Divider my="14px" />

          <Box mb="14px">
            <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" mb="6px">
              Version
            </Text>
            {savedContent?.versionNumber ? (
              <Badge
                bg="#EBF8FF"
                color="#2B6CB0"
                px="10px"
                py="3px"
                borderRadius="10px"
                fontSize="12px"
              >
                {savedContent.versionNumber}
              </Badge>
            ) : (
              <Text fontSize="13px" color="gray.400">—</Text>
            )}
          </Box>

          <Box mb="14px">
            <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" mb="6px">
              Approval Status
            </Text>
            {savedContent?.approvalStatus
              ? getApprovalBadge(savedContent.approvalStatus)
              : <Text fontSize="13px" color="gray.400">—</Text>}
          </Box>

          <Box mb="14px">
            <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" mb="6px">
              Publish Status
            </Text>
            {savedContent?.publishStatus
              ? getPublishBadge(savedContent.publishStatus)
              : <Text fontSize="13px" color="gray.400">—</Text>}
          </Box>

          <Divider my="14px" />

          <MetaRow
            label="Last Saved"
            value={
              savedContent?.lastSaved
                ? new Date(savedContent.lastSaved).toLocaleString()
                : null
            }
          />
          <MetaRow
            label="Last Edited"
            value={
              savedContent?.editDate
                ? new Date(savedContent.editDate).toLocaleString()
                : null
            }
          />
          <MetaRow label="Edited By" value={savedContent?.editedBy} />

          {savedContent?.mediaCount > 0 && (
            <>
              <Divider my="14px" />
              <MetaRow
                label="Embedded Media"
                value={`${savedContent.mediaCount} item${savedContent.mediaCount > 1 ? "s" : ""}`}
              />
              {savedContent.mediaEmbedded?.map((media, i) => (
                <Box key={i} mb="8px" pl="8px" borderLeft="2px solid #E2E8F0">
                  <Text fontSize="12px" color="gray.500" textTransform="capitalize">
                    {media.type}
                    {media.duration ? ` · ${media.duration}s` : ""}
                  </Text>
                </Box>
              ))}
            </>
          )}

          {savedContent?.changeSummary && (
            <>
              <Divider my="14px" />
              <Box>
                <Text fontSize="11px" color="gray.400" fontWeight="600" textTransform="uppercase" mb="6px">
                  Last Change Summary
                </Text>
                <Text fontSize="13px" color="gray.600" fontStyle="italic">
                  "{savedContent.changeSummary}"
                </Text>
              </Box>
            </>
          )}
        </Box>
      </Grid>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const CourseContentEditorPageRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => <CourseContentEditorPage {...props} />}
  />
);

export default CourseContentEditorPageRoute;
