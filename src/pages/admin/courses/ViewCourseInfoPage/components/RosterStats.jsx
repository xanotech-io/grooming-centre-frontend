import React from "react";
import { Box, Grid, Text } from "@chakra-ui/react";

const StatCard = ({ label, value, color, bg }) => (
  <Box bg={bg} borderRadius="8px" p="16px" textAlign="center">
    <Text fontSize="26px" fontWeight="700" color="black">
      {value ?? "—"}
    </Text>
    <Text fontSize="12px" color="black" mt="4px">
      {label}
    </Text>
  </Box>
);

const RosterStats = ({ summary }) => {
  const cards = [
    { label: "Total Students",              value: summary.totalStudents,  color: "#3182CE", bg: "#FFFFFF" },
    { label: "Active Enrollment Count",     value: summary.activeEnrollmentCount ?? summary.enrolled, color: "#38A169", bg: "#FFFFFF" },
    { label: "Pending",                     value: summary.pending,        color: "#D69E2E", bg: "#FFFFFF" },
    { label: "Completed",                   value: summary.completed,      color: "#6B46C1", bg: "#FFFFFF" },
    { label: "Avg. Progress",               value: summary.averageProgress != null ? `${Math.round(summary.averageProgress)}%` : "—", color: "#234E52", bg: "#FFFFFF" },
    { label: "Enrollment-to-Completion",    value: summary.enrollmentToCompletionRatio != null ? `${Math.round(summary.enrollmentToCompletionRatio * 100)}%` : "—", color: "#B83280", bg: "#FFFFFF" },
    { label: "Avg. Attendance Rate",        value: summary.averageAttendanceRate != null ? `${Math.round(summary.averageAttendanceRate)}%` : "—", color: "#2C5282", bg: "#FFFFFF" },
  ];

  return (
    <Grid
      templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
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
