import { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { Button, Table, Text, Breadcrumb, Link } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import { FaSortAmountUpAlt } from "react-icons/fa";

const mapInstructorToRow = (instructor) => ({
  id: instructor.id,
  userId: {
    text: `${instructor.displayId || instructor.id}`,
    userId: instructor.id,
  },
  fullName: {
    text: `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim(),
  },
  email: instructor.email,
  status: {
    active: instructor.active,
    text: instructor.active ? "Active" : "Inactive",
  },
});

const InstructorReport = () => {
  const history = useHistory();

  const tableProps = {
    filterControls: [
      {
        triggerText: "Sort",
        queryKey: "sort",
        triggerIcon: <FaSortAmountUpAlt />,
        body: {
          checks: [
            { label: "Name (A-Z)", queryValue: "nameAsc" },
            { label: "Name (Z-A)", queryValue: "nameDesc" },
          ],
        },
      },
    ],
    options: {
      search: true,
      selection: false,
      pagination: true,
      action: [
        {
          text: "View Report",
          onClick: (row) => {
            history.push(`/admin/report/instructorReport/${row.id}/details`);
          },
        },
      ],
    },
    columns: [
      {
        id: "1",
        key: "userId",
        text: "User ID",
        fraction: "150px",
        renderContent: (data) => <Text>{data?.text}</Text>,
      },
      {
        id: "2",
        key: "fullName",
        text: "Full name",
        fraction: "200px",
        renderContent: (data) => <Text>{data?.text}</Text>,
      },
      {
        id: "5",
        key: "email",
        text: "Email",
        fraction: "250px",
      },
      {
        id: "6",
        key: "status",
        text: "Status",
        fraction: "120px",
        renderContent: (data) => (
          <Text color={data?.active ? "green.500" : "orange.400"}>
            {data?.text}
          </Text>
        ),
      },
    ],
  };

  const mockInstructors = [
    { id: "inst_1", displayId: "INS-001", firstName: "James", lastName: "Smith", email: "j.smith@example.com", active: true },
    { id: "inst_2", displayId: "INS-002", firstName: "Kemi", lastName: "Abens", email: "k.abens@example.com", active: true },
    { id: "inst_3", displayId: "INS-003", firstName: "Mike", lastName: "Johnson", email: "m.johnson@example.com", active: false },
    { id: "inst_4", displayId: "INS-004", firstName: "Kolade", lastName: "Adeyemi", email: "k.adeyemi@example.com", active: true },
  ];

  const fetcher = () => async () => {
    const rows = mockInstructors.map(mapInstructorToRow);
    return { rows, showingDocumentsCount: rows.length, totalDocumentsCount: rows.length };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Instructor / Teaching Reports</Link>
            </BreadcrumbItem>
          }
        />
        <Box display="flex" gap="8px">
          <Button secondary onClick={() => { }}>Schedule report</Button>
          <Button onClick={() => { }}>Export Dashboard</Button>
        </Box>
      </Box>

      <Table
        {...tableProps}
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
        placeholder="Search instructors..."
      />
    </AdminMainAreaWrapper>
  );
};

export const InstructorReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <InstructorReport {...props} />} />;
};

export default InstructorReportRoute;