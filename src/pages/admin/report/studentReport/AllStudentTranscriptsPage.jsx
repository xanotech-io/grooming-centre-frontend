import { useState, useRef } from "react";
import { Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import { BreadcrumbItem, Select, useToast } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/tag";
import { Breadcrumb, Heading, Link, Table } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { useTableRows } from "../../../../hooks";
import { adminGetAllStudentTranscripts } from "../../../../services";

const statusColorMap = {
  Draft: "gray",
  "Pending Review": "yellow",
  Approved: "blue",
  Issued: "green",
  Returned: "red",
};

const mapToRow = (item) => ({
  id: item.id,
  studentId: item.studentId,
  studentName: `${item.student?.firstName ?? ""} ${item.student?.lastName ?? ""}`.trim(),
  email: item.student?.email ?? "—",
  transcriptType: item.transcriptType,
  status: item.status,
  requestDate: item.requestDate
    ? new Date(item.requestDate).toLocaleDateString()
    : "—",
  issuanceReference: item.issuanceReference ?? "—",
});

const STATUS_PILLS = [
   {label: "Status", value: "" },
  { label: "All", value: "" },
  { label: "Draft", value: "Draft" },
  { label: "Pending Review", value: "Pending Review" },
  { label: "Approved", value: "Approved" },
  { label: "Issued", value: "Issued" },
  { label: "Returned", value: "Returned" },
];

const AllStudentTranscriptsPage = () => {
  const toast = useToast();
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  // const [typeFilter, setTypeFilter] = useState("");
  const statusFilterRef = useRef("");
  const typeFilterRef = useRef("");

  const fetchTranscripts = async (params = {}) => {
    try {
      const allParams = { ...params };
      if (statusFilterRef.current) allParams.status = statusFilterRef.current;
      if (typeFilterRef.current) allParams.transcriptType = typeFilterRef.current;
      const result = await adminGetAllStudentTranscripts(allParams);
      const rows = (result.rows ?? []).map(mapToRow);
      setTotalCount(result.totalDocumentsCount ?? rows.length);
      return {
        rows,
        showingDocumentsCount: rows.length,
        totalDocumentsCount: result.totalDocumentsCount ?? rows.length,
        currentPage: Number(allParams.page) || 1,
        totalPages: Math.ceil((result.totalDocumentsCount ?? rows.length) / (Number(allParams.limit) || 10)) || 1,
      };
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "Unable to fetch transcript requests",
        duration: 3000,
        isClosable: true,
      });
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    }
  };

  const fetcher = (props) => async () => fetchTranscripts(props?.params);
  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const handleStatusPill = (value) => {
    const next = statusFilter === value ? "" : value;
    setStatusFilter(next);
    statusFilterRef.current = next;
    fetchRowItems({ params: { page: 1 } });
  };

  // const handleTypeChange = (e) => {
  //   const val = e.target.value;
  //   setTypeFilter(val);
  //   typeFilterRef.current = val;
  //   fetchRowItems({ params: { page: 1 } });
  // };

  const tableProps = {
    searchKey: "search",
    columns: [
      {
        id: "studentName",
        key: "studentName",
        text: "Student Name",
        fraction: "200px",
      },
      {
        id: "email",
        key: "email",
        text: "Email",
        fraction: "220px",
      },
      // {
      //   id: "transcriptType",
      //   key: "transcriptType",
      //   text: "Type",
      //   fraction: "120px",
      //   renderContent: (type) => (
      //     <Tag size="sm" borderRadius="full" colorScheme={type === "Official" ? "purple" : "gray"}>
      //       {type}
      //     </Tag>
      //   ),
      // },
      {
        id: "status",
        key: "status",
        text: "Status",
        fraction: "150px",
        renderContent: (status) => (
          <Tag size="sm" borderRadius="full" colorScheme={statusColorMap[status] ?? "gray"}>
            {status}
          </Tag>
        ),
      },
      {
        id: "requestDate",
        key: "requestDate",
        text: "Request Date",
        fraction: "140px",
      },
      {
        id: "issuanceReference",
        key: "issuanceReference",
        text: "Issuance Ref",
        fraction: "170px",
      },
    ],
    options: {
      action: [
        {
          text: "View Transcript",
          link: (row) => `/admin/report/studentTranscripts/${row.id}`,
        },
      ],
      selection: false,
      pagination: true,
    },
  };

  return (
    <AdminMainAreaWrapper>
      <Box my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/studentTranscripts">Students Transcripts</Link>
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
          Student Transcripts
        </Heading>
      </Flex>

      <Flex mb={4} gap={3} alignItems="center" flexWrap="wrap">
        <Select size="sm" maxW="180px" value={statusFilter} onChange={(e) => handleStatusPill(e.target.value)}>
          {STATUS_PILLS.map((pill) => (
            <option key={pill.value} value={pill.value}>{pill.label}</option>
          ))}
        </Select>
        {/* <Select size="sm" maxW="180px" value={typeFilter} onChange={handleTypeChange}>
          <option value="">All Types</option>
          <option value="Official">Official</option>
          <option value="Unofficial">Unofficial</option>
        </Select> */}
      </Flex>

      <Table
        {...tableProps}
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
        placeholder="Search by student name or email..."
        totalCount={totalCount}
      />
    </AdminMainAreaWrapper>
  );
};

export const AllStudentTranscriptsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AllStudentTranscriptsPage {...props} />} />;
};

export default AllStudentTranscriptsPage;
