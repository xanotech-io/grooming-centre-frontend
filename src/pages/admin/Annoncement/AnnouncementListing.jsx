import { Route } from "react-router-dom";
import { Box } from "@chakra-ui/layout";

import { BreadcrumbItem, Tag } from "@chakra-ui/react";
import { FaSortAmountUpAlt } from "react-icons/fa";

import { getDuration } from "../../../utils";
import dayjs from "dayjs";
import { useTableRows } from "../../../hooks";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  Table,
  Text,
} from "../../../components";
import {
  adminDeleteAnnouncement,
  adminDeleteStandaloneExaminationQuestion,
  adminGetAnnouncementListing,
  adminGetStandaloneExaminationListing,
} from "../../../services";
import { AdminMainAreaWrapper } from "../../../layouts";

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
      key: "department",
      text: "Department",
      fraction: "200px",
      renderContent: (data) => (
        <Link href={`/admin/announcement/edit/?announcement=${data.courseId}`}>
          <Text>{data.text}</Text>
        </Link>
      ),
    },
    {
      id: "2",
      key: "author",
      text: "Author",
      fraction: "250px",
    },
    {
      id: "3",
      key: "text",
      text: "Content",
      fraction: "250px",
    },
    {
      id: "4",
      key: "createdAt",
      text: "Date Created",
      fraction: "250px",
    },
  ],

  options: {
    action: [
      {
        text: "Edit",
        link: (announcement) =>
          `/admin/announcement/edit/?announcement=${announcement.id}`,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedExaminations) => {
      await adminDeleteAnnouncement(selectedExaminations[0]?.id);
    },
    pagination: true,
  },
};

const AnnouncementListing = () => {
  const mapExaminationToRow = (announcement) => ({
    id: announcement.id,
    department: {
      text: announcement.department,
      courseId: announcement.id,
    },
    author: announcement.firstName + " " + announcement.lastName,
    text: announcement.text.substring(0, 15).concat("..."),
    createdAt: dayjs(announcement.createdAt).format("DD/MM/YYYY h:mm a"),
  });

  const fetcher = (props) => async () => {
    const { announcements, showingDocumentsCount, totalDocumentsCount } =
      await adminGetAnnouncementListing(props?.params);
    console.log(announcements);

    const rows = announcements.map(mapExaminationToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/announcement"> Announcement</Link>
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
          Announcements
        </Heading>

        <Button link={`/admin/announcement/edit/?announcement=new`}>
          Create announcement
        </Button>
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

export const AnnouncementListingRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <AnnouncementListing {...props} />} />
  );
};
