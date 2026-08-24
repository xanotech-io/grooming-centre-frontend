import { Route } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
} from "../../../components";
import { BreadcrumbItem, Tag, useToast } from "@chakra-ui/react";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  deleteStandaloneExamination,
  adminGetStandaloneExaminationListing,
  adminEditStandaloneExamination,
  adminGetStandaloneExamById,
} from "../../../services";
import { getDuration } from "../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../hooks";
import { useAddStandaloneExamToBank } from "../examQuestionBank/useAddStandaloneExamToBank";

const buildTableProps = ({ onAddToBank, onPublish, onUnpublish }) => ({
  filterControls: [
    {
      triggerText: "Sort",
      queryKey: "sort",
      triggerIcon: <FaSortAmountUpAlt />,
      width: "200px",
      position: "right-bottom",
      // noFilterTags: true,
      body: {
        radios: [
          {
            label: "Alphabetically: ascending",
            queryValue: "asc",
            additionalParams: { date: false },
          },
          {
            label: "Alphabetically: descending",
            queryValue: "desc",
            additionalParams: { date: false },
          },
          {
            label: "Date: ascending",
            queryValue: "asc",
            additionalParams: { date: true },
          },
          {
            label: "Date: descending",
            queryValue: "desc",
            additionalParams: { date: true },
          },
        ],
      },
    },
  ],

  columns: [
    {
      id: "2",
      key: "title",
      text: "Examination Title",
      fraction: "2fr",
      renderContent: (data) => (
        <Link href={`/admin/standalone-exams/view/${data.examinationId}`}>
          <Text>{data.text}</Text>
        </Link>
      ),
    },
    {
      id: "3",
      key: "noOfUsers",
      text: "Candidates",
      fraction: "120px",
    },
    {
      id: "questions",
      key: "amountOfQuestions",
      text: "Questions",
      fraction: "100px",
    },
    {
      id: "4",
      key: "startDate",
      text: "Start Date",
      fraction: "180px",
    },
    {
      id: "5",
      key: "duration",
      text: "Duration",
      fraction: "120px",
    },
    {
      id: "markingMode",
      key: "markingMode",
      text: "Marking",
      fraction: "120px",
      renderContent: (mode) => (
        <Tag
          borderRadius="full"
          size="sm"
          backgroundColor="purple.50"
          color="purple.700"
          textTransform="capitalize"
        >
          <Text bold>{mode ?? "—"}</Text>
        </Tag>
      ),
    },
    {
      id: "6",
      key: "status",
      text: "Status",
      fraction: "130px",
      renderContent: (status) => (
        <Box>
          <Tag
            borderRadius="full"
            size="sm"
            backgroundColor={status ? "accent.4" : "accent.1"}
            color={status ? "accent.5" : "accent.3"}
          >
            <Text bold>{status ? "Published" : "Unpublished"}</Text>
          </Tag>
        </Box>
      ),
    },
  ],

  options: {
    action: [
      {
        text: "View",
        link: (examination) =>
          `/admin/standalone-exams/view/${examination.id}`,
      },
      {
        text: "Edit",
        link: (examination) =>
          `/admin/standalone-exams/overview/?examination=${examination.id}`,
      },
      {
        text: "Submission",
        link: (examination) =>
          `/admin/standalone-exams/view/${examination.id}?tab=submissions`,
      },
      {
        text: "Access Links",
        link: (examination) =>
          `/admin/standalone-exams/view/${examination.id}?tab=access-links`,
      },
      {
        text: "Add to Question Bank",
        onClick: onAddToBank,
      },
      {
        text: "Publish",
        onClick: onPublish,
      },
      {
        text: "Unpublish",
        onClick: onUnpublish,
      },
      {
        isDelete: true,
      },
    ],
    multipleDeleteFetcher: async (selectedExaminations) => {
      await deleteStandaloneExamination(selectedExaminations[0]?.id);
    },
    selection: true,
    pagination: true,
  },
});

const StandaloneExaminationListingPage = () => {
  const toast = useToast();
  const { addStandaloneExamToBank } = useAddStandaloneExamToBank();

  const mapExaminationToRow = (examination) => ({
    id: examination.id,
    title: {
      text: examination.title,
      examinationId: examination.id,
    },
    startDate: dayjs(examination.startTime).format("DD/MM/YYYY h:mma"),
    duration: getDuration(examination.duration).combinedText,
    noOfUsers: examination.noOfUsers,
    amountOfQuestions: examination.amountOfQuestions ?? "—",
    markingMode: examination.markingMode,
    status: examination.isPublished,
  });

  const fetcher = (props) => async () => {
    const { examinations, showingDocumentsCount, totalDocumentsCount } =
      await adminGetStandaloneExaminationListing(props?.params);

    const rows = examinations.map(mapExaminationToRow);
    console.log(rows);
    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const setPublishStatus = async (examination, isPublished) => {
    try {
      // The backend re-validates retryCount/retryPolicy together on every
      // edit, so a PATCH that only carries `isPublished` gets rejected
      // whenever the exam already has retries configured — refetch and
      // resend those two fields alongside the status change.
      const { examination: current } = await adminGetStandaloneExamById(
        examination.id,
      );
      const retryCount = Number(current.retryCount) || 0;

      await adminEditStandaloneExamination(examination.id, {
        isPublished,
        retryCount,
        ...(retryCount > 0 ? { retryPolicy: current.retryPolicy } : {}),
      });
      toast({
        title: isPublished ? "Examination published" : "Examination unpublished",
        status: "success",
        duration: 3000,
      });
      fetchRowItems();
    } catch (error) {
      toast({
        title:
          error?.response?.data?.message ||
          `Failed to ${isPublished ? "publish" : "unpublish"} examination`,
        status: "error",
        duration: 3000,
      });
    }
  };

  const tableProps = buildTableProps({
    onAddToBank: (examination) =>
      addStandaloneExamToBank({
        examinationId: examination.id,
        examinationTitle: examination.title?.text,
      }),
    onPublish: (examination) => setPublishStatus(examination, true),
    onUnpublish: (examination) => setPublishStatus(examination, false),
  });

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/standalone-exams"> Standalone Examination</Link>
          </BreadcrumbItem>
        }
      />

      <Box
        display="flex"
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "flex-start", lg: "center" }}
        paddingBottom={5}
        gap={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Standalone Exams
        </Heading>

        <Box display={"flex"} gap="8px">
          <Button link={`/admin/exam-question-bank`} secondary>Question Bank</Button>

          <Button link={`/admin/exam-paper-config-presets`} secondary>Exam Template Library</Button>

          <Button link={`/admin/standalone-exams/overview`}>Create New Exam</Button>
        </Box>

      </Box>

      <Table
        {...tableProps}
        placeholder="Title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const StandaloneExaminationListingPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <StandaloneExaminationListingPage {...props} />}
    />
  );
};

export default StandaloneExaminationListingPageRoute;
