import React from "react";
import { Box, Grid, Text } from "@chakra-ui/react";

const StatCard = ({ label, value, color, bg }) => (
  <Box bg={bg} borderRadius="8px" p="16px" textAlign="center">
    <Text fontSize="26px" fontWeight="700" color={color}>
      {value ?? "—"}
    </Text>
    <Text fontSize="12px" color="gray.600" mt="4px">
      {label}
    </Text>
  </Box>
);

const RosterStats = ({ summary }) => {
  const cards = [
    { label: "Total Students",   value: summary.totalStudents,  color: "#3182CE", bg: "#EBF8FF" },
    { label: "Enrolled",         value: summary.enrolled,       color: "#38A169", bg: "#E6F4EA" },
    { label: "Pending",          value: summary.pending,        color: "#D69E2E", bg: "#FFFFF0" },
    { label: "Completed",        value: summary.completed,      color: "#6B46C1", bg: "#E9D8FD" },
    { label: "Avg. Progress",    value: summary.averageProgress != null ? `${Math.round(summary.averageProgress)}%` : "—", color: "#234E52", bg: "#B2F5EA" },
  ];

  return (
    <Grid
      templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
      gap="14px"
      mb="24px"
    >
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </Grid>
  );
};

export default RosterStats;
