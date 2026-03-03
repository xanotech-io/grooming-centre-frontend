import React, { useEffect, useState } from "react";
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
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useHistory } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Mock Data ---

const randomizationStats = [
  {
    label: "Randomization Effectiveness (%)",
    value: "90%",
    change: "+5% vs last period",
    changeType: "increase",
    color: "#000000",
  },
  {
    label: "Duplicate Question Rate",
    value: "1.5%",
    change: "-5% vs last period",
    changeType: "decrease",
    color: "#000000",
  },
  {
    label: "Exam Overlap Ratio",
    value: "3.5%",
    change: "Easy",
    changeType: "positive",
    changeColor: "#00A143",
    color: "#000000",
  }, // "Easy" seems like a label here based on design
  {
    label: "Irregular Attempts",
    value: "12",
    change: "-5% vs last period",
    changeType: "decrease",
    color: "#000000",
  },
];

const distributionData = {
  labels: ["MF101", "MF102", "MF103", "MF104", "MF105", "MF106"],
  datasets: [
    {
      label: "Full randomization",
      data: [58, 30, 68, 45, 58, 48],
      backgroundColor: "#D94111",
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    },
    {
      label: "Partial randomization",
      data: [75, 45, 25, 30, 42, 28],
      backgroundColor: "#F97316",
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    },
  ],
};

const mapLocations = [
  { lat: 38.9072, lng: -77.0369, radius: 20 }, // Washington DC
  { lat: 39.2904, lng: -76.6122, radius: 15 }, // Baltimore
  { lat: 38.8048, lng: -77.0469, radius: 10 }, // Alexandria/Nearby
  { lat: 38.9847, lng: -77.0947, radius: 12 }, // Bethesda
  { lat: 38.83, lng: -76.85, radius: 8 },
];

const irregularitiesData = [
  {
    id: "MF101 Final Exam",
    student: "John Doe",
    type: "Full Randomization",
    issue: "Multiple IPs",
    count: 7,
    ip: "198.02.01.32",
    time: "26/11/2025 6:00PM",
  },
  {
    id: "MF101 Final Exam",
    student: "John Doe",
    type: "Partial Randomization",
    issue: "High Overlap",
    count: 15,
    ip: "198.02.01.32",
    time: "26/11/2025 6:00:00",
  },
  {
    id: "MF101 Final Exam",
    student: "John Doe",
    type: "Full Randomization",
    issue: "Duplicate Attempt",
    count: 13,
    ip: "198.02.01.32",
    time: "26/11/2025 6:00:00",
  },
  {
    id: "MF101 Final Exam",
    student: "John Doe",
    type: "Partial Randomization",
    issue: "Multiple IPs",
    count: 4,
    ip: "198.02.01.32",
    time: "26/11/2025 6:00:00",
  },
  {
    id: "MF101 Final Exam",
    student: "John Doe",
    type: "Full Randomization",
    issue: "Unusual Timing",
    count: 5,
    ip: "198.02.01.32",
    time: "26/11/2025 6:00:00",
  },
  {
    id: "MF101 Final Exam",
    student: "John Doe",
    type: "Partial Randomization",
    issue: "Duplicate Attempt",
    count: 13,
    ip: "198.02.01.32",
    time: "26/11/2025 6:00:00",
  },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "end",
      labels: { boxWidth: 8, usePointStyle: true, pointStyle: "circle" },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { borderDash: [5, 5] },
      ticks: { callback: (val) => (val === 0 ? "0%" : val + "%") },
    },
  },
};

const RandomizationIntegrityReport = () => {
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        {randomizationStats.map((stat, index) => (
          <Box
            key={index}
            p={6}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="sm"
          >
            <Text fontSize="sm" fontWeight="500" color="#000000" mb={1}>
              {stat.label}
            </Text>
            <Text fontSize="26px" fontWeight="700" color="#000000" mb={1}>
              {stat.value}
            </Text>
            <Text
              fontSize="sm"
              color={
                stat.changeColor ||
                (stat.changeType === "increase" ||
                stat.changeType === "positive"
                  ? "#00A143"
                  : "#00A143")
              }
              fontWeight="500"
            >
              {stat.change}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Charts and Map Section */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
        {/* Randomization Distribution */}
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontWeight="500" fontSize="18px" color="#000000">
              Randomization Distribution
            </Text>
            <Select
              size="sm"
              w="120px"
              borderRadius="md"
              defaultValue="Department"
            >
              <option value="Department">Department</option>
            </Select>
          </Flex>
          <Box height="250px">
            <Bar data={distributionData} options={chartOptions} />
          </Box>
        </Box>

        {/* Duplicate Attempt Map */}
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="sm"
        >
          <Text fontWeight="500" fontSize="18px" color="#000000" mb={6}>
            Duplicate Attempt by Location
          </Text>
          <Box height="250px" borderRadius="md" overflow="hidden">
            {/* {isMounted && (
              <MapContainer
                center={[38.9072, -77.0369]}
                zoom={9}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapLocations.map((loc, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[loc.lat, loc.lng]}
                    radius={loc.radius}
                    pathOptions={{
                      color: "#E53E3E",
                      fillColor: "#E53E3E",
                      fillOpacity: 0.5,
                      stroke: false,
                    }}
                  ></CircleMarker>
                ))}
              </MapContainer>
            )} */}
          </Box>
        </Box>
      </Grid>

      {/* Data Table Section */}
      <Box bg="white" p={3} borderRadius="lg" border="1.5px solid #E4E7EC">
        <Flex mb={6} justifyContent="" alignItems="center" gap={2}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none" size="lg">
              <FiSearch color="gray.300" mb={-2} />
            </InputLeftElement>
            <Input placeholder="Search here..." borderRadius="md" size="sm" />
          </InputGroup>
          <Button
            leftIcon={<FiFilter />}
            variant="outline"
            size="sm"
            borderRadius="md"
            fontWeight="500"
          >
            Filter
          </Button>
        </Flex>

        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>
                <Input type="checkbox" />
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Exam ID
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Student
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Randomization Type
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Irregularity Type
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Irregular Attempt
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                IP Address
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Timestamp
              </Th>
              <Th color="#344054" fontSize="xs" textTransform="none">
                Action
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {irregularitiesData.map((row, index) => (
              <Tr key={index}>
                <Td>
                  <Input type="checkbox" height="40px" />
                </Td>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="500" color="#101928" fontSize="xs">
                      {row.id}
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      Exam
                    </Text>
                  </VStack>
                </Td>
                <Td color="#101928" fontWeight="500" fontSize="xs">
                  {row.student}
                </Td>
                <Td fontSize="xs">{row.type}</Td>
                <Td>
                  <Badge
                    px={2}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                    fontSize="2xs"
                    bg={
                      row.issue.includes("Duplicate") ||
                      row.issue.includes("Timing")
                        ? "red.50"
                        : "orange.50"
                    }
                    color={
                      row.issue.includes("Duplicate") ||
                      row.issue.includes("Timing")
                        ? "red.600"
                        : "orange.600"
                    }
                  >
                    {row.issue}
                  </Badge>
                </Td>
                <Td fontSize="xs">{row.count}</Td>
                <Td fontSize="xs">{row.ip}</Td>
                <Td fontSize="xs">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs">{row.time.split(" ")[0]}</Text>
                    <Text fontSize="2xs" color="gray.500">
                      {row.time.split(" ")[1]}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      borderColor="#E4E7EC"
                      border="1px"
                      variant="ghost"
                      size="xs"
                    />
                    <MenuList>
                      <MenuItem onClick={() => history.push("/admin/audit")}>
                        Archive report
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Flex mt={6} alignItems="center" justifyContent="space-between" px={2}>
          <HStack spacing={2} fontSize="sm">
            <Text color="gray.500">Rows per page</Text>
            <Select size="xs" w="70px" borderRadius="md" defaultValue="08">
              <option value="08">08</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </Select>
          </HStack>

          <HStack spacing={4}>
            <Text fontSize="sm" color="gray.500">
              Showing 10 out of 100 items
            </Text>
            <HStack spacing={1}>
              <IconButton
                icon={<FiChevronLeft />}
                variant="ghost"
                size="xs"
                aria-label="Previous Page"
              />
              <Text fontSize="sm">1</Text>
              <IconButton
                icon={<FiChevronRight />}
                variant="ghost"
                size="xs"
                aria-label="Next Page"
              />
            </HStack>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default RandomizationIntegrityReport;
