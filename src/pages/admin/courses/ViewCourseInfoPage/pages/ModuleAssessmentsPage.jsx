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
} from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";

const ModuleAssessmentsPage = () => {
  const { courseId, moduleId } = useParams();

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
            href={`/admin/courses/${courseId}/assessment/${data.assessmentId}/overview`}
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
        id: "status",
        key: "status",
        text: "Status",
        fraction: "120px",
        renderContent: (data) => (
          <Badge colorScheme={data === "Active" ? "green" : "gray"}>
            {data}
          </Badge>
        ),
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (assessment) =>
            `/admin/courses/${courseId}/assessment/${assessment.id}/overview`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedAssessments) => {
        await adminDeleteAssessment(selectedAssessments[0]?.id);
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
    status: assessment.active ? "Active" : "Inactive",
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

        <Button
          link={`/admin/courses/${courseId}/module/${moduleId}/assessments/edit/new`}
        >
          Add Assessment
        </Button>
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
