import { Route, useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
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
  adminListModuleAssessments,
  auditTrailV2PostLog,
} from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";
import { useAddAssessmentToBank } from "../../../examQuestionBank/useAddAssessmentToBank";

const getStatusBadge = (approvalStatus) => {
  const colorSchemes = { Approved: "green", Pending: "orange", Rejected: "red" };
  return <Badge colorScheme={colorSchemes[approvalStatus] || "gray"}>{approvalStatus}</Badge>;
};

const ModuleAssessmentsPage = () => {
  const { courseId, moduleId } = useParams();
  const { addAssessmentToBank } = useAddAssessmentToBank();

  const tableProps = {
    filterControls: [
      {
        triggerText: "Sort",
        queryKey: "sort",
        triggerIcon: <FaSortAmountUpAlt />,
        width: "200px",
        position: "right-bottom",
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
        id: "title",
        key: "title",
        text: "Assessment Title",
        fraction: "3fr",
        renderContent: (data) => (
          <Link
            href={`/admin/courses/${courseId}/assessment/${data.assessmentId}/overview?moduleId=${moduleId}`}
          >
            <Text>{data.text}</Text>
          </Link>
        ),
      },
      {
        id: "startDate",
        key: "startDate",
        text: "Start Date",
        fraction: "200px",
      },
      {
        id: "duration",
        key: "duration",
        text: "Duration",
        fraction: "150px",
      },
      {
        id: "amountOfQuestions",
        key: "amountOfQuestions",
        text: "Questions",
        fraction: "120px",
      },
      {
        id: "approvalStatus",
        key: "approvalStatus",
        text: "Status",
        fraction: "120px",
        renderContent: (approvalStatus) => getStatusBadge(approvalStatus),
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (assessment) =>
            `/admin/courses/${courseId}/assessment/${assessment.id}/overview?moduleId=${moduleId}`,
        },
        {
          text: "Submission",
          link: (assessment) =>
            `/admin/courses/${courseId}/assessment/${assessment.id}/grading?moduleId=${moduleId}`,
        },
        {
          text: "Add to Question Bank",
          onClick: (assessment) =>
            addAssessmentToBank({
              assessmentId: assessment.id,
              courseId,
              assessmentTitle: assessment.title?.text,
            }),
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
  };

  const mapAssessmentToRow = (assessment) => ({
    id: assessment.id,
    title: { text: assessment.title, assessmentId: assessment.id },
    startDate: dayjs(assessment.startTime).format("DD/MM/YYYY h:mm a"),
    duration: getDuration(assessment.duration).combinedText,
    amountOfQuestions: assessment.amountOfQuestions,
    approvalStatus: assessment.approvalStatus,
  });

  const fetcher = () => async () => {
    const { assessments } = await adminListModuleAssessments(moduleId);
    const rows = assessments.map(mapAssessmentToRow);
    return { rows };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem>
            <Link href={`/admin/courses/details/${courseId}/modules`}>
              Modules
            </Link>
          </BreadcrumbItem>
        }
        item4={
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
          <Button secondary link={`/admin/exam-question-bank?courseId=${courseId}&moduleId=${moduleId}`}>
            Question Bank
          </Button>
          <Button
            link={`/admin/courses/${courseId}/module/${moduleId}/assessments/edit/new`}
          >
            Add Assessment
          </Button>
        </Flex>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Assessment title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const ModuleAssessmentsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ModuleAssessmentsPage {...props} />} />
  );
};

export default ModuleAssessmentsPageRoute;
