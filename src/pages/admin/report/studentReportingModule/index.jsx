import { useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";
import {
  BreadcrumbItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { Breadcrumb, Heading, Link, Text } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import { tc0804GetModuleKPIs } from "../../../../services";
import KPICards from "./KPICards";
import StudentReportsTab from "./StudentReportsTab";
import ParticipationTab from "./ParticipationTab";
import AdminSummaryTab from "./AdminSummaryTab";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";

const StudentReportingModulePage = () => {
  const toast = useToast();
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    const loadKpis = async () => {
      try {
        const res = await tc0804GetModuleKPIs();
        setKpis(res?.data ?? null);
      } catch (err) {
        toast({ status: "error", description: "Failed to load KPIs", duration: 3000, isClosable: true });
      }
    };
    loadKpis();
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
            Unified view of student reports, participation records, and engagement analytics
          </Text>
        </Box>
      </Flex>

      <KPICards kpis={kpis} />

      <Tabs variant="enclosed" colorScheme="purple">
        <TabList mb={4}>
          <Tab>Student Reports</Tab>
          <Tab>Participation Monitor</Tab>
          <Tab>Admin Summary</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <StudentReportsTab onKpisChange={setKpis} />
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
