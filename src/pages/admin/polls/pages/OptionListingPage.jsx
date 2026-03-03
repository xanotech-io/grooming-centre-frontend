import { Box, Flex } from "@chakra-ui/layout";
import { Route, useParams } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { Tag } from "@chakra-ui/tag";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useApp } from "../../../../contexts";
import { useTableRows } from "../../../../hooks";
import {
  adminDeleteMultipleCourses,
  adminGetModuleListing,
} from "../../../../services";
import { AdminMainAreaWrapper } from "../../../../layouts";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  Table,
  Text,
} from "../../../../components";
import {
  adminDeletePolls,
  adminGetPollOptions,
  adminGetSinglePoll,
} from "../../../../services/http/endpoints/poll";

const OptionListingPage = () => {
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
        id: "1",
        key: "text",
        text: "Option Title",
        fraction: "3fr",
      },
    ],

    options: {
      action: [
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedCourses) => {
        await adminDeletePolls(selectedCourses);
      },
      pagination: true,
    },
  };

  const { id: pollId } = useParams();

  const mapPollOptionToRow = (poll) => ({
    id: poll.id,
    text: poll.text,
    pollId: poll.pollId,
  });

  const fetcher = (props) => async () => {
    const { showingDocumentsCount, totalDocumentsCount, pollOptions } =
      await adminGetPollOptions(pollId);
    const rows = pollOptions.map(mapPollOptionToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/polls">Polls</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Options</Link>
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
          Options
        </Heading>

        <Button link={`/admin/polls/${pollId}/options/edit/new`}>
          Add Option
        </Button>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Title, department, instructor"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const OptionListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <OptionListingPage {...props} />} />
  );
};

export default OptionListingPageRoute;
