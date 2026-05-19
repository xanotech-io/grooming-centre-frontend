import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Spinner,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import { adminGetBadgeReport } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FiArrowLeft, FiChevronDown, FiChevronRight, FiDownload } from "react-icons/fi";

const statusBadge = (status) => {
  const active = (status || "").toLowerCase() === "active";
  return (
    <Badge
      bg={active ? "#E6F4EA" : "#FED7D7"}
      color={active ? "#38A169" : "#E53E3E"}
      px="8px"
      py="2px"
      borderRadius="8px"
      textTransform="none"
      fontSize="11px"
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
};

const exportCSV = (data) => {
  const rows = [];
  rows.push([
    "Badge ID",
    "Title",
    "Type",
    "Required Courses",
    "Validation",
    "Status",
    "Total Awarded",
    "Pending",
  ]);
  (data || []).forEach((b) => {
    rows.push([
      b.id,
      b.title,
      b.badgeType,
      b.requiredCoursesCount ?? 0,
      b.validationMethod,
      b.status,
      b.totalAwarded ?? 0,
      b.pendingCount ?? 0,
    ]);
    (b.awardRecords || []).forEach((r) => {
      rows.push([
        "",
        `  → ${r.studentName || ""}`,
        r.email || "",
        "",
        "",
        r.awardStatus || "",
        r.awardDate ? new Date(r.awardDate).toLocaleDateString() : "",
        "",
      ]);
    });
  });
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "badge-report.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const BadgeReportPage = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    adminGetBadgeReport()
      .then((res) => setReport(res?.data || res?.badges || []))
      .catch((err) =>
        setError(
          capitalizeFirstLetter(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load report",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const toggleRow = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box marginX="22px" marginY="20px">
      <Flex alignItems="center" gap="16px" mb="28px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.push("/admin/badge-support")}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">
            Badges
          </Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Box flex={1}>
          <Heading fontSize="22px" fontWeight="600">
            Badge Issuance Report
          </Heading>
          <Text fontSize="13px" color="gray.500" mt="2px">
            Full record of badge issuances per badge
          </Text>
        </Box>
        {report.length > 0 && (
          <Button secondary leftIcon={<FiDownload />} onClick={() => exportCSV(report)}>
            Export CSV
          </Button>
        )}
      </Flex>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {error && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="8px"
          p="16px"
        >
          <Text color="red.600" fontSize="14px">
            {error}
          </Text>
        </Box>
      )}

      {!loading && !error && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden">
          {report.length === 0 ? (
            <Flex justifyContent="center" alignItems="center" py="60px">
              <Text fontSize="14px" color="gray.400">
                No report data available.
              </Text>
            </Flex>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="#F7FAFC">
                  <Tr>
                    <Th w="40px" />
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                      Title
                    </Th>
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                      Type
                    </Th>
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568" isNumeric>
                      Req. Courses
                    </Th>
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                      Validation
                    </Th>
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                      Status
                    </Th>
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568" isNumeric>
                      Awarded
                    </Th>
                    <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568" isNumeric>
                      Pending
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {report.map((badge) => (
                    <React.Fragment key={badge.id}>
                      <Tr
                        _hover={{ bg: "#FAFAFA" }}
                        cursor={(badge.awardRecords || []).length > 0 ? "pointer" : "default"}
                        onClick={() =>
                          (badge.awardRecords || []).length > 0 &&
                          toggleRow(badge.id)
                        }
                      >
                        <Td>
                          {(badge.awardRecords || []).length > 0 ? (
                            expanded[badge.id] ? (
                              <FiChevronDown color="#6b006b" />
                            ) : (
                              <FiChevronRight color="#6b006b" />
                            )
                          ) : null}
                        </Td>
                        <Td>
                          <Text fontSize="13px" fontWeight="600" color="#1A202C">
                            {badge.title}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            bg="#F0E6FF"
                            color="#6b006b"
                            px="8px"
                            py="2px"
                            borderRadius="8px"
                            textTransform="none"
                            fontSize="11px"
                          >
                            {badge.badgeType}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="13px" fontWeight="700" color="#6b006b">
                            {badge.requiredCoursesCount ?? 0}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="12px" color="gray.600" textTransform="capitalize">
                            {badge.validationMethod}
                          </Text>
                        </Td>
                        <Td>{statusBadge(badge.status)}</Td>
                        <Td isNumeric>
                          <Text fontSize="13px" fontWeight="600" color="#38A169">
                            {badge.totalAwarded ?? 0}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="13px" fontWeight="600" color="#DD6B20">
                            {badge.pendingCount ?? 0}
                          </Text>
                        </Td>
                      </Tr>

                      {/* Expandable award records */}
                      {expanded[badge.id] &&
                        (badge.awardRecords || []).map((rec) => (
                          <Tr key={rec.id} bg="#FAFAFA">
                            <Td />
                            <Td colSpan={2}>
                              <Text fontSize="12px" color="#1A202C" fontWeight="500">
                                {rec.studentName || "—"}
                              </Text>
                              <Text fontSize="11px" color="gray.400">
                                {rec.email}
                              </Text>
                            </Td>
                            <Td />
                            <Td />
                            <Td>
                              <Badge
                                bg={
                                  (rec.awardStatus || "").toLowerCase() === "earned"
                                    ? "#E6F4EA"
                                    : "#FFF5EA"
                                }
                                color={
                                  (rec.awardStatus || "").toLowerCase() === "earned"
                                    ? "#38A169"
                                    : "#DD6B20"
                                }
                                px="8px"
                                py="2px"
                                borderRadius="8px"
                                textTransform="none"
                                fontSize="11px"
                              >
                                {rec.awardStatus || "—"}
                              </Badge>
                            </Td>
                            <Td colSpan={2}>
                              <Text fontSize="11px" color="gray.500">
                                {rec.awardDate
                                  ? new Date(rec.awardDate).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )
                                  : "—"}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                    </React.Fragment>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export const BadgeReportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeReportPage {...props} />} />
);

export default BadgeReportPageRoute;
