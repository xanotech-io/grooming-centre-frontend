
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { Box, Flex, Grid, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import { useState } from "react";
import {
  Button,
  Table,
  Text,
  Spinner,
  DashboardMetricCard,
  Checkbox,
  Input,
  Select
} from "../../../../components";
import { EmptyState } from "../../../../layouts";
import dayjs from "dayjs";
import { useTableRows } from "../../../../hooks";
import relativeTime from "dayjs/plugin/relativeTime";
import { mockMultiSearchReportsResponse } from "../../../../mocks/server/controllers/management-report/reponses";
import { FiPlus } from "react-icons/fi";

dayjs.extend(relativeTime);

const MultiSearchReport = () => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState([
    { id: 1, field: "", value: "" },
    { id: 2, field: "", value: "" },
    { id: 3, field: "", value: "" }
  ]);

  const fetchReports = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = mockMultiSearchReportsResponse;
      const rows = response.data.rows;
      setTotalCount(response.data.totalDocumentsCount);

      return {
        rows,
        showingDocumentsCount: response.data.showingDocumentsCount || rows.length,
        totalDocumentsCount: response.data.totalDocumentsCount || 0,
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
      };
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch reports");
      return {
        rows: [],
        showingDocumentsCount: 0,
        totalDocumentsCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    } finally {
      setLoading(false);
    }
  };

  const tableProps = {
    searchKey: "search",
    filterControls: [
      {
        triggerText: "Filter",
        queryKey: "role",
        width: "150px",
        body: {
          checks: [
            { label: "Learner", queryValue: "Learner" },
            { label: "Admin", queryValue: "Admin" },
            { label: "Instructor", queryValue: "Instructor" },
          ],
        },
      },
    ],
    columns: [
      {
        id: "name",
        key: "name",
        text: "Name",
        fraction: "500px",
      },
      {
        id: "courseCode",
        key: "courseCode",
        text: "Course Code",
        fraction: "500px",
      },
      {
        id: "enrollmentDate",
        key: "enrollmentDate",
        text: "Enrollment Date",
        fraction: "500px",
      },
    ],
    options: {
      // action: [], // No action required as per screenshot
      selection: true,
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchReports(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const addNewFilter = () => {
    setFilters([...filters, { id: filters.length + 1, field: "", value: "" }]);
  };

  return (
    <AdminMainAreaWrapper>
      <Box
        display={"grid"}
        gridTemplateColumns="repeat(3, 1fr)"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Report Generation Time (seconds)"
          value="140sec"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Saved Template Reuse Rate"
          value="3%"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Export Accuracy (%)"
          value="150secs"
          change="Stable"
          changeColor="#1A8F3A"
        />
      </Box>

      <Grid templateColumns="300px 1fr" gap={8} mb={10}>
        {/* Select Field Section */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>Select field</Text>
          <Accordion allowMultiple defaultIndex={[0, 1, 2]} allowToggle border="none">
            <AccordionItem border="none" mb={2}>
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Learner Information
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="start" spacing={3}>
                  <Checkbox label="Name" isChecked defaultChecked />
                  <Checkbox label="ID" />
                  <Checkbox label="Email address" />
                  <Checkbox label="Department" />
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none" mb={2}>
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Course Information
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="start" spacing={3}>
                  <Checkbox label="Course name" isChecked defaultChecked />
                  <Checkbox label="Course code" />
                  <Checkbox label="Instructor" />
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none" mb={2}>
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Enrollment Data
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="start" spacing={3}>
                  <Checkbox label="Enrollment date" isChecked defaultChecked />
                  <Checkbox label="Status" />
                  <Checkbox label="Completion date" />
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>

        {/* Criteria Section */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>Criteria</Text>

          <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Filter field</Text>
              <Select placeholder="Name" />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Name</Text>
              <Input placeholder="Enter the name" bg="#F9FAFB" border="none" />
            </Box>
          </Grid>

          <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Filter field</Text>
              <Select placeholder="Course name" />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Value</Text>
              <Input placeholder="Enter course name" bg="#F9FAFB" border="none" />
            </Box>
          </Grid>

          <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Filter field</Text>
              <Select placeholder="Enrollment date" />
            </Box>
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">Value</Text>
              <Input placeholder="dd/mm/yy - dd/mm/yy" type="date" bg="#F9FAFB" border="none" />
            </Box>
          </Grid>

          <Button
            variant="ghost"
            leftIcon={<FiPlus />}
            color="primary.base"
            onClick={addNewFilter}
            justifyContent="flex-start"
            pl={0}
            mb={6}
          >
            Add new filter
          </Button>

          <Flex justify="flex-end" gap={4}>
            <Button variant="outline" borderColor="primary.base" color="primary.base">
              Save template
            </Button>
            <Button onClick={fetchRowItems}>
              Generate report
            </Button>
          </Flex>
        </Box>
      </Grid>

      {/* Results Table */}
      {loading && rows.length === 0 ? (
        <Flex
          h="400px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" />
          <Text mt={4}>Loading reports...</Text>
        </Flex>
      ) : error ? (
        <EmptyState
          heading="Failed to load reports"
          description={error}
          cta={<Button onClick={fetchRowItems}>Try Again</Button>}
        />
      ) : (
        <Table
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          isLoading={loading}
          placeholder="Search here..."
          totalCount={totalCount}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export default MultiSearchReport;
