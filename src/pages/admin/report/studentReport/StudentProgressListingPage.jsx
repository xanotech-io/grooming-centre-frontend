import { Flex, Box } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { Badge } from "@chakra-ui/react";
import { Heading, Table, Breadcrumb, Link, Text } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useTableRows } from "../../../../hooks";
import { adminGetUserListing } from "../../../../services";

const StudentProgressListingPage = () => {
  const tableProps = {
    searchKey: "search",
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
        fraction: "130px",
        renderContent: (data) => <Text>{data.text}</Text>,
      },
      {
        id: "2",
        key: "fullName",
        text: "Full Name",
        fraction: "200px",
        renderContent: (data) => <Text>{data.text}</Text>,
      },
      {
        id: "5",
        key: "email",
        text: "Email Address",
        fraction: "250px",
      },
      {
        id: "6",
        key: "department",
        text: "Department",
        fraction: "180px",
      },
      {
        id: "7",
        key: "status",
        text: "Status",
        fraction: "120px",
        renderContent: (data) => (
          <Badge colorScheme={data.active ? "green" : "orange"} variant="solid">
            {data.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],

    options: {
      action: [
        {
          text: "Progress Report",
          link: (user) => `/admin/report/studentReport/${user.id}/progress`,
        },
        {
          text: "Training Report",
          link: (user) => `/admin/report/studentReport/${user.id}/training-report`,
        },
      ],
      selection: false,
      pagination: true,
    },
  };

  const mapUserToRow = (user) => ({
    ...user,
    fullName: { text: `${user.firstName} ${user.lastName}`, userId: user.id },
    userId: { text: user.displayId, userId: user.id },
    department: user.departmentName ?? "—",
    status: { active: user.active, text: user.active ? "Active" : "Inactive" },
  });

  const fetcher = (props) => async () => {
    const res = await adminGetUserListing(props?.params);
    const rows = (res.users ?? []).map(mapUserToRow);
    return {
      rows,
      showingDocumentsCount: res.showingDocumentsCount ?? rows.length,
      totalDocumentsCount: res.totalDocumentsCount ?? rows.length,
    };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/student-progress">Student Progress Report</Link>
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
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Student Progress Report
          </Heading>
          <Text color="accent.3" mt={1}>
            Select a student to view their progress report or full training report.
          </Text>
        </Box>
      </Flex>

      <Table
        {...tableProps}
        placeholder="Search by student name or ID…"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const StudentProgressListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <StudentProgressListingPage {...props} />} />
  );
};

export default StudentProgressListingPage;
