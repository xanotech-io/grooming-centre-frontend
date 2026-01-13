import { Route } from "react-router-dom";
import { Flex } from "@chakra-ui/layout";
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
} from "../../../components";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { adminDeleteMultipleCourses } from "../../../services";
import { useTableRows } from "../../../hooks";
import {
  adminDeletePolls,
  adminGetPollListing,
} from "../../../services/http/endpoints/poll";

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
      key: "question",
      text: "Question",
      fraction: "2fr",
      renderContent: (data) => (
        <Link href={`/admin/polls/details/${data.pollId}/info`}>
          <Text>{data.text}</Text>
        </Link>
      ),
    },
  ],

  options: {
    action: [
      {
        text: "Edit",
        link: (examination) => ``,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedDepartments) => {
      let format = [];
      format.push(selectedDepartments.map((datum) => datum.id));

      await adminDeletePolls(selectedDepartments);
    },
    pagination: true,
  },
};

const PollsListingPage = () => {
  const mapPollToRow = (poll) => ({
    id: poll.id,
    question: { text: poll.question, pollId: poll.id },
  });

  const fetcher = () => async () => {
    const { polls, showingDocumentsCount, totalDocumentsCount } =
      await adminGetPollListing();

    const rows = polls.map(mapPollToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
      // item2={
      //   <BreadcrumbItem isCurrentPage>
      //     <Link href="/admin/courses">Courses </Link>
      //   </BreadcrumbItem>
      // }
      // item3={
      //   <BreadcrumbItem isCurrentPage>
      //     <Link href="#">Examination</Link>
      //   </BreadcrumbItem>
      // }
      />

      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column" }}
        alignItems={{ sm: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Polls
        </Heading>

        <Button link={`/admin/polls/edit/new`}>Add Poll</Button>
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

export const PollsListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <PollsListingPage {...props} />} />
  );
};

export default PollsListingPage;
