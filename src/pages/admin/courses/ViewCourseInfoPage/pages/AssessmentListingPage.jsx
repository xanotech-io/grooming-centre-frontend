import { Route, useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
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
  adminDeleteMultipleCourses,
  adminGetAssessmentListing,
} from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";

const tableProps = {
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
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedAssessments) => {
      console.log(selectedAssessments[0]?.id, "id");
      await adminDeleteAssessment(selectedAssessments[0]?.id);
    },
    pagination: false,
  },
};

const AssessmentListingPage = () => {
  const { id: courseId } = useParams();

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
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/courses">Courses </Link>
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

        <Button link={`/admin/courses/${courseId}/assessment/new/overview`}>
          Add Assessment
        </Button>
      </Flex>

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

export const AssessmentListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AssessmentListingPage {...props} />} />
  );
};

export default AssessmentListingPageRoute;
