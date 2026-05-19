import { Flex, Box } from "@chakra-ui/layout";
import { Route, useHistory } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { Badge } from "@chakra-ui/react";
import {
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useTableRows } from "../../../../hooks";
import { adminGetUserListing } from "../../../../services";

const StudentReport = () => {
  const history = useHistory();

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
            { label: "Alphabetically: ascending", queryValue: "asc", additionalParams: { date: false } },
            { label: "Alphabetically: descending", queryValue: "desc", additionalParams: { date: false } },
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
          text: "View Report",
          link: (user) => `/admin/report/studentReport/${user.id}/details`,
        },
        {
          text: "Training Report",
          link: (user) => `/admin/student-progress/${user.id}`,
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
    status: { active: user.active, text: user.active ? "Active" : "Inactive" },
  });

  const fetcher = (props) => async () => {
    const result = await adminGetUserListing(props?.params);
    const rows = (result.users ?? []).map(mapUserToRow);
    return {
      rows,
      showingDocumentsCount: result.showingDocumentsCount ?? rows.length,
      totalDocumentsCount: result.totalDocumentsCount ?? rows.length,
    };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/studentReport">Learners Report</Link>
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

export default StudentReportRoute;
