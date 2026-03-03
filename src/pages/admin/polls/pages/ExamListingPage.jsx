import { Route, useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
} from "../../../../../components";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteMultipleCourses,
  adminGetExaminationListing,
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
      text: "Examination Title",
      fraction: "2fr",
      renderContent: (data) => (
        <Link
          href={`/admin/courses/${data.courseId}/assessment/${data.courseId}/overview?examination=${data.examinationId}`}
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
        link: (examination) =>
          `/admin/courses/${examination.courseId}/assessment/${examination.courseId}/overview?examination=${examination.id}`,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedExaminations) => {
      await adminDeleteMultipleCourses();
    },
    pagination: false,
  },
};

const ExamListingPage = () => {
  const { id: courseId } = useParams();

  const mapExaminationToRow = (examination) => ({
    id: examination.id,
    courseId,
    title: {
      text: examination.title,
      examinationId: examination.id,
      courseId,
    },
    startDate: dayjs(examination.startTime).format("DD/MM/YYYY h:mm a"),
    duration: getDuration(examination.duration).combinedText,
  });

  const fetcher = () => async () => {
    const { examinations } = await adminGetExaminationListing(courseId);

    const rows = examinations.map(mapExaminationToRow);

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
            <Link href="#">Examination</Link>
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
          Examination
        </Heading>

        <Button
          link={`/admin/courses/${courseId}/assessment/new/overview?examination=true`}
        >
          Add Examination
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

export const ExamListingPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ExamListingPage {...props} />} />;
};

export default ExamListingPageRoute;
