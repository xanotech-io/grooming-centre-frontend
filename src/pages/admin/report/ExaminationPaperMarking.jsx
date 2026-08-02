import React from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Checkbox,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { AdminMainAreaWrapper } from "../../../layouts";
import ScheduleReportModal from "./components/ScheduleReportModal";

// Mock Data
const stats = [
  {
    label: "Average Evaluation Time",
    value: "50mins",
    subtext: "Per paper",
    change: "",
    changeType: "",
  },
  {
    label: "Marking Accuracy Rate (%)",
    value: "82%",
    subtext: "",
    change: "+5% vs last month",
    changeType: "increase",
  },
  {
    label: "Automated Evaluations",
    value: "50",
    subtext: "",
    change: "",
    changeType: "",
  },
  {
    label: "Re-mark Requests (%)",
    value: "80%",
    subtext: "Per exam",
    change: "",
    changeType: "",
  },
  {
    label: "Instructor Evaluation Load",
    value: "45",
    subtext: "Per instructor",
    change: "",
    changeType: "",
  },
];

const markingData = [
  {
    id: "EX-1045",
    title: "Data Analytics Test",
    mode: "Automatic",
    evaluatedBy: "System",
    avgScore: 84,
    highScore: 84,
    lowScore: 84,
    status: "Completed",
    remark: "Auto-marking successful",
  },
  {
    id: "EX-1045",
    title: "Data Analytics Test",
    mode: "Hybrid",
    evaluatedBy: "System & Instructor",
    avgScore: 78,
    highScore: 78,
    lowScore: 78,
    status: "In-progress",
    remark: "-",
  },
  {
    id: "EX-1045",
    title: "Data Analytics Test",
    mode: "Manual",
    evaluatedBy: "Dr. Tunde Bello",
    avgScore: 74,
    highScore: 74,
    lowScore: 74,
    status: "Completed",
    remark: "Auto-marking successful",
  },
  {
    id: "EX-1045",
    title: "Data Analytics Test",
    mode: "Hybrid",
    evaluatedBy: "System & Instructor",
    avgScore: 82,
    highScore: 82,
    lowScore: 82,
    status: "In-progress",
    remark: "-",
  },
  {
    id: "EX-1045",
    title: "Data Analytics Test",
    mode: "Manual",
    evaluatedBy: "Dr. Tunde Bello",
    avgScore: 78,
    highScore: 78,
    lowScore: 78,
    status: "Completed",
    remark: "Auto-marking successful",
  },
  {
    id: "EX-1045",
    title: "Data Analytics Test",
    mode: "Automatic",
    evaluatedBy: "System",
    avgScore: 93,
    highScore: 93,
    lowScore: 93,
    status: "In-progress",
    remark: "-",
  },
];

const ExaminationPaperMarking = () => {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <AdminMainAreaWrapper>
      <Box
        mb={6}
        mt={6}
        as={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="center" mb={10}>
          <Text fontSize="24px" fontWeight="700" color="#101928">
            Examination Paper Marking
          </Text>
          <HStack spacing={3}>
            <Button
              variant="outline"
              borderColor="#660066"
              color="#660066"
              h="40px"
              fontSize="14px"
              fontWeight="500"
              onClick={onOpen}
            >
              Schedule report
            </Button>
            <Button
              bg="#660066"
              color="white"
              _hover={{ bg: "#550055" }}
              h="40px"
              fontSize="14px"
              fontWeight="500"
            >
              Export Report
            </Button>
          </HStack>
        </Flex>
        {/* Stats Cards */}
        <Grid templateColumns="repeat(5, 1fr)" gap={4} mb={8}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              p={4}
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="xs"
            >
              <Text fontSize="13px" fontWeight="500" color="#101928" mb={2}>
                {stat.label}
              </Text>
              <Text fontSize="24px" fontWeight="700" color="#101928" mb={1}>
                {stat.value}
              </Text>
              {stat.subtext && (
                <Text fontSize="12px" color="#667085" fontWeight="400">
                  {stat.subtext}
                </Text>
              )}
              {stat.change && (
                <Text
                  fontSize="12px"
                  fontWeight="500"
                  color={stat.changeType === "increase" ? "#00A143" : "#F04438"}
                >
                  {stat.change}
                </Text>
              )}
            </Box>
          ))}
        </Grid>

        {/* Table Section */}
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="xs"
        >
          {/* Toolbar */}
          <Flex mb={6} justify="space-between" align="center">
            <HStack spacing={2} flex={1} maxW="500px">
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search here..."
                  borderRadius="md"
                  bg="white"
                />
              </InputGroup>
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                size="sm"
                px={4}
                fontWeight="500"
                borderRadius="md"
              >
                Filter
              </Button>
            </HStack>

            <Button
              leftIcon={<FiCalendar />}
              rightIcon={
                <FiChevronRight style={{ transform: "rotate(90deg)" }} />
              }
              variant="outline"
              size="sm"
              px={4}
              fontWeight="500"
              borderRadius="md"
              color="#344054"
            >
              Select dates
            </Button>
          </Flex>

          {/* Table */}
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th px={4} py={3}>
                    <Checkbox size="sm" colorScheme="purple" />
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Exam ID
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Exam Title
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Marking Mode
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Evaluated By
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    isNumeric
                  >
                    Average Score
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    isNumeric
                  >
                    Highest Score
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                    isNumeric
                  >
                    Lowest Score
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Status
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Remark
                  </Th>
                  <Th
                    px={4}
                    py={3}
                    color="#344054"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="none"
                  >
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {markingData.map((row, idx) => (
                  <Tr key={idx}>
                    <Td px={4} py={4}>
                      <Checkbox size="sm" colorScheme="purple" />
                    </Td>
                    <Td px={2} py={4} color="#475367" fontSize="12px">
                      {row.id}
                    </Td>
                    <Td
                      px={2}
                      py={4}
                      color="#101928"
                      fontSize="12px"
                      fontWeight="500"
                    >
                      {row.title}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.mode}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.evaluatedBy}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px" isNumeric>
                      {row.avgScore}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px" isNumeric>
                      {row.highScore}
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px" isNumeric>
                      {row.lowScore}
                    </Td>
                    <Td px={4} py={4}>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="600"
                        textTransform="none"
                        bg={row.status === "Completed" ? "#ECFDF3" : "#FFFAEB"}
                        color={
                          row.status === "Completed" ? "#027A48" : "#B54708"
                        }
                      >
                        {row.status}
                      </Badge>
                    </Td>
                    <Td px={4} py={4} color="#475367" fontSize="12px">
                      {row.remark}
                    </Td>
                    <Td px={4} py={4}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          borderColor="#E4E7EC"
                          border="1px"
                          variant="ghost"
                          size="sm"
                          borderRadius="md"
                        />
                        <MenuList>
                          <MenuItem
                            fontSize="14px"
                            onClick={() => history.push("/admin/audit")}
                          >
                            Archive report
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination placeholder */}
          <Flex mt={6} align="center" justify="space-between">
            <HStack spacing={2}>
              <Text color="#475367" fontSize="14px">
                Rows per page
              </Text>
              <Select size="sm" w="70px" borderRadius="md" defaultValue="08">
                <option value="08">08</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </Select>
            </HStack>

            <HStack spacing={4}>
              <Text color="#475367" fontSize="14px">
                Showing 10 out of 100 items
              </Text>
              <HStack spacing={1}>
                <IconButton
                  icon={<FiChevronLeft />}
                  variant="ghost"
                  size="sm"
                  aria-label="Previous Page"
                />
                <Box px={2}>
                  <Text fontSize="14px" fontWeight="600" color="#101928">
                    1
                  </Text>
                </Box>
                <IconButton
                  icon={<FiChevronRight />}
                  variant="ghost"
                  size="sm"
                  aria-label="Next Page"
                />
              </HStack>
            </HStack>
          </Flex>
        </Box>
      </Box>
      <ScheduleReportModal isOpen={isOpen} onClose={onClose} />
    </AdminMainAreaWrapper>
  );
};

export default ExaminationPaperMarking;
