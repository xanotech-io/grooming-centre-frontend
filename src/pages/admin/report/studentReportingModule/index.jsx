import { useState, useEffect } from "react";
import { Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Heading, Link, Text } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { pm2GetModuleKPIs } from "../../../../services";
import KPICards from "./KPICards";
import StudentReportsTab from "./StudentReportsTab";
import ParticipationTab from "./ParticipationTab";
import AdminSummaryTab from "./AdminSummaryTab";

const StudentReportingModulePage = () => {
  const toast = useToast();
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    pm2GetModuleKPIs()
      .then((res) => setKpis(res?.kpis ?? null))
      .catch(() => toast({ status: "error", description: "Failed to load KPIs", duration: 3000, isClosable: true }));
  }, [toast]);

  return (
    <AdminMainAreaWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="/admin/report/student-reporting">
                Student Reporting & Participation
              </Link>
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
        marginBottom={6}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3">
            Student Reporting & Participation Module
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Unified view of student reports (TC08), participation monitoring (TC04), and engagement analytics
          </Text>
        </Box>
      </Flex>

      <KPICards kpis={kpis} />

      <Tabs variant="enclosed" colorScheme="purple">
        <TabList mb={4}>
          <Tab>Student Reports (TC08)</Tab>
          <Tab>Participation Monitor (TC04)</Tab>
          <Tab>Admin Summary</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <StudentReportsTab />
          </TabPanel>
          <TabPanel px={0}>
            <ParticipationTab />
          </TabPanel>
          <TabPanel px={0}>
            <AdminSummaryTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AdminMainAreaWrapper>
  );
};

export const StudentReportingModulePageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <StudentReportingModulePage {...props} />}
    />
  );
};

export default StudentReportingModulePage;
