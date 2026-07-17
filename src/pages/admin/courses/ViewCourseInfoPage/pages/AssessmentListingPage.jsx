import { useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
import { BreadcrumbItem, useDisclosure } from "@chakra-ui/react";
import {
  Button,
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from "../../../../../components";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteAssessment,
  adminGetAssessmentListing,
  auditTrailV2PostLog,
} from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";
import AddAssessmentToBankModal from "../../../examQuestionBank/AddAssessmentToBankModal";

const buildTableProps = ({ onAddToBank }) => ({
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
      text: "Assessment Title",
      fraction: "2fr",
      renderContent: (data) => (
        <Link
          href={`/admin/courses/${data.courseId}/assessment/${data.assessmentId}/overview`}
        >
          <Text>{data.text}</Text>
        </Link>
      ),
    },
    {
      id: "4",
      key: "startDate",
      text: "Start Date",
      fraction: "200px",
    },
    {
      id: "5",
      key: "duration",
      text: "Duration",
      fraction: "150px",
    },
  ],

  options: {
    action: [
      {
        text: "Edit",
        link: (assessment) =>
          `/admin/courses/${assessment.courseId}/assessment/${assessment.id}/overview`,
      },
      {
        text: "Add to Question Bank",
        onClick: onAddToBank,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedAssessments) => {
      const assessmentId = selectedAssessments[0]?.id;
      const assessmentTitle = selectedAssessments[0]?.title?.text;
      try {
        await adminDeleteAssessment(assessmentId);
        auditTrailV2PostLog({
          eventType: "delete",
          module: "LMS",
          status: "success",
          resourceId: assessmentId,
          resourceType: "Assessment",
          remarks: `Deleted assessment "${assessmentTitle}"`,
        }).catch(() => {});
      } catch (error) {
        auditTrailV2PostLog({
          eventType: "delete",
          module: "LMS",
          status: "failure",
          resourceId: assessmentId,
          resourceType: "Assessment",
          remarks: error?.response?.data?.message || error.message || `Failed to delete assessment "${assessmentTitle}"`,
        }).catch(() => {});
        throw error;
      }
    },
    pagination: false,
  },
});

const AssessmentListingPage = () => {
  const { id: courseId } = useParams();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const { isOpen: isBankOpen, onOpen: onBankOpen, onClose: onBankClose } = useDisclosure();

  const tableProps = buildTableProps({
    onAddToBank: (assessment) => {
      setSelectedAssessment(assessment);
      onBankOpen();
    },
  });

  const mapAssessmentToRow = (assessment) => ({
    id: assessment.id,
    courseId,
    title: { text: assessment.title, assessmentId: assessment.id, courseId },
    startDate: dayjs(assessment.startTime).format("DD/MM/YYYY h:mm a"),
    duration: getDuration(assessment.duration).combinedText,
  });

  const fetcher = () => async () => {
    const { assessments } = await adminGetAssessmentListing(courseId);

    const rows = assessments.map(mapAssessmentToRow);

    return { rows };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem>
            <Link href={`/admin/courses/details/${courseId}/info`}>Courses </Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Assessments</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Assessments
        </Heading>

        <Flex gap="8px">
          <Button secondary link={`/admin/exam-question-bank?courseId=${courseId}`}>
            Question Bank
          </Button>
          <Button link={`/admin/courses/${courseId}/assessment/new/overview`}>
            Add Assessment
          </Button>
        </Flex>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />

      <AddAssessmentToBankModal
        isOpen={isBankOpen}
        onClose={onBankClose}
        assessmentId={selectedAssessment?.id}
        courseId={selectedAssessment?.courseId}
        assessmentTitle={selectedAssessment?.title?.text}
      />
    </AdminMainAreaWrapper>
  );
};

export const AssessmentListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AssessmentListingPage {...props} />} />
  );
};

export default AssessmentListingPageRoute;
