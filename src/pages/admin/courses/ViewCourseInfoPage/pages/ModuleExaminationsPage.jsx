import { useState } from "react";
import { Route, useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem, useDisclosure } from "@chakra-ui/react";
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
  adminDeleteExamination,
  adminListModuleExaminations,
} from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../../../hooks";
import AddExaminationToBankModal from "../../../examQuestionBank/AddExaminationToBankModal";

const getStatusBadge = (approvalStatus) => {
  const colorSchemes = { Approved: "green", Pending: "orange", Rejected: "red" };
  return <Badge colorScheme={colorSchemes[approvalStatus] || "gray"}>{approvalStatus}</Badge>;
};

const ModuleExaminationsPage = () => {
  const { courseId, moduleId } = useParams();
  const [selectedExam, setSelectedExam] = useState(null);
  const { isOpen: isBankOpen, onOpen: onBankOpen, onClose: onBankClose } = useDisclosure();

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
        text: "Examination Title",
        fraction: "3fr",
        renderContent: (data) => (
          <Link
            href={`/admin/courses/${courseId}/module/${moduleId}/examinations/view/${data.examinationId}`}
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
          link: (examination) =>
            `/admin/courses/${courseId}/module/${moduleId}/examinations/view/${examination.id}`,
        },
        {
          text: "Edit",
          link: (examination) =>
            `/admin/courses/${courseId}/module/${moduleId}/examinations/edit/${examination.id}`,
        },
        {
          text: "Submission",
          link: (examination) =>
            `/admin/courses/${courseId}/module/${moduleId}/examinations/${examination.id}/grading`,
        },
        {
          text: "Add to Question Bank",
          onClick: (examination) => {
            setSelectedExam(examination);
            onBankOpen();
          },
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async () => {
        await adminDeleteExamination(courseId);
      },
      pagination: false,
    },
  };

  const mapExaminationToRow = (examination) => ({
    id: examination.id,
    title: { text: examination.title, examinationId: examination.id },
    startDate: dayjs(examination.startTime).format("DD/MM/YYYY h:mm a"),
    duration: getDuration(examination.duration).combinedText,
    amountOfQuestions: examination.amountOfQuestions,
    approvalStatus: examination.approvalStatus,
  });

  const fetcher = () => async () => {
    const { examinations } = await adminListModuleExaminations(moduleId);
    const rows = examinations.map(mapExaminationToRow);
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
            <Link href="#">Examinations</Link>
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
          Examinations
        </Heading>

        <Flex gap="8px">
          <Button secondary link={`/admin/exam-question-bank?courseId=${courseId}&moduleId=${moduleId}`}>
            Question Bank
          </Button>
          <Button
            link={`/admin/courses/${courseId}/module/${moduleId}/examinations/edit/new`}
          >
            Add Examination
          </Button>
        </Flex>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Examination title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />

      <AddExaminationToBankModal
        isOpen={isBankOpen}
        onClose={onBankClose}
        examinationId={selectedExam?.id}
        courseId={courseId}
        moduleId={moduleId}
        examinationTitle={selectedExam?.title?.text}
      />
    </AdminMainAreaWrapper>
  );
};

export const ModuleExaminationsPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ModuleExaminationsPage {...props} />}
    />
  );
};

export default ModuleExaminationsPageRoute;
