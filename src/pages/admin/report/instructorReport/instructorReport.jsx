import { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { Button, Table, Text, Breadcrumb, ExportMenu, Link } from "../../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { adminGetInstructorReportDirectory } from "../../../../services";

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
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetcher = (props) => async () => {
    setLoading(true);
    try {
      const response = await adminGetInstructorReportDirectory(
        props?.params || {},
      );
      const rows = (response.data || []).map(mapInstructorToRow);
      setTotalCount(response.total || rows.length);
      return {
        rows,
        showingDocumentsCount: response.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.totalDocumentsCount || rows.length,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
      };
    } finally {
      setLoading(false);
    }
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const instructorRows = rows?.data?.rows ?? [];

  const exportRows = [
    ["User ID", "Full Name", "Email", "Status"],
    ...instructorRows.map((row) => [
      row.userId?.text || row.id,
      row.fullName?.text || "",
      row.email || "",
      row.status?.text || "",
    ]),
  ];

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
              <Link href="#">Instructor / Teaching Reports</Link>
            </BreadcrumbItem>
          }
        />
        <Box display="flex" gap="8px">
          <Button secondary onClick={() => {}}>
            Schedule report
          </Button>
          <ExportMenu
            rows={exportRows}
            filename="instructor-report"
            title="Instructor / Teaching Reports"
            isDisabled={instructorRows.length === 0}
          />
        </Box>
      </Box>

      <Table
        {...tableProps}
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
        placeholder="Search instructors..."
        totalCount={totalCount}
        isLoading={loading}
      />
    </AdminMainAreaWrapper>
  );
};

export const InstructorReportRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <InstructorReport {...props} />} />
  );
};

export default InstructorReportRoute;
