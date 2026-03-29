import { Flex, Box } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { Badge } from "@chakra-ui/react";
import {
  Button,
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { adminGetUserListing } from "../../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useTableRows } from "../../../../hooks";

const StudentReport = () => {
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
          ],
        },
      },
    ],

    columns: [
      {
        id: "1",
        key: "userId",
        text: "Student ID",
        fraction: "100px",
        renderContent: (data) => (
          <Text>{data.text}</Text>
        ),
      },
      {
        id: "2",
        key: "fullName",
        text: "Full name",
        fraction: "200px",
        renderContent: (data) => (
          <Text>{data.text}</Text>
        ),
      },
      {
        id: "5",
        key: "email",
        text: "Email Address",
        fraction: "250px",
      },
      {
        id: "7",
        key: "status",
        text: "Status",
        fraction: "100px",
        renderContent: (data) => {
          const isActive = data.active || data.status?.active || (data.text === "Approved");
          return (
            <Badge
              colorScheme={isActive ? "green" : "orange"}
              variant="solid"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
    ],

    options: {
      action: [
        {
          text: "View Report",
          link: (user) => `/admin/report/studentReport/${user.id}/details`,
        },
      ],
      selection: false,
      pagination: true,
    },
  };

  const mapUserToRow = (user) => {
    const mappedUser = {
      ...user,
      fullName: {
        text: `${user.firstName} ${user.lastName}`,
        userId: user.id,
      },
      userId: {
        text: `${user.displayId}`,
        userId: user.id,
      },
      status: {
        active: user.active,
        text: user.active ? "Approved" : "Pending",
      },
    };
    return mappedUser;
  };

  const fetcher = (props) => async () => {
    // MOCK DATA for testing the UI
    const mockUsers = [
      {
        id: "mock_student_1",
        firstName: "John",
        lastName: "Doe",
        displayId: "STU-001",
        email: "john.doe@example.com",
        active: true,
      },
      {
        id: "mock_student_2",
        firstName: "Jane",
        lastName: "Smith",
        displayId: "STU-002",
        email: "jane.smith@example.com",
        active: false,
      },
      {
        id: "mock_student_3",
        firstName: "Alice",
        lastName: "Johnson",
        displayId: "STU-003",
        email: "alice.j@example.com",
        active: true,
      },
      {
        id: "mock_student_4",
        firstName: "Robert",
        lastName: "Downey",
        displayId: "STU-004",
        email: "robert.d@example.com",
        active: true,
      }
    ];

    const rows = mockUsers.map(mapUserToRow);

    return { rows, showingDocumentsCount: 4, totalDocumentsCount: 4 };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/studentReport">Student Report</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column", md: "column" }}
        alignItems={{ base: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Learners Report
        </Heading>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Search by student name or ID..."
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const StudentReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <StudentReport {...props} />} />;
};

export default StudentReport;