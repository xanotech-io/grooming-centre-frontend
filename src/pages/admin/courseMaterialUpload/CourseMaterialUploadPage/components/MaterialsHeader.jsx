import React from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { FiUploadCloud } from "react-icons/fi";
import { Heading, Button } from "../../../../../components";

const KpiCard = ({ label, value, color, bg }) => (
  <Box bg={bg} borderRadius="8px" p="16px" textAlign="center">
    <Text fontSize="26px" fontWeight="700" color={color}>
      {value ?? "—"}
    </Text>
    <Text fontSize="12px" color="gray.600" mt="4px">
      {label}
    </Text>
  </Box>
);

const MaterialsHeader = ({ stats, onUploadClick }) => {
  const storageMb = stats.totalStorageMb;
  const storageLabel =
    storageMb >= 1024
      ? `${(storageMb / 1024).toFixed(1)} GB`
      : `${(storageMb ?? 0).toFixed(1)} MB`;

  const cards = [
    { label: "Total Uploads",  value: stats.total,                                      color: "#3182CE", bg: "#EBF8FF" },
    { label: "Successful",     value: stats.successful,                                  color: "#38A169", bg: "#E6F4EA" },
    { label: "Failed",         value: stats.failed,                                      color: "#E53E3E", bg: "#FED7D7" },
    { label: "Success Rate",   value: stats.successRate != null ? `${stats.successRate}%` : "—", color: "#6B46C1", bg: "#E9D8FD" },
    { label: "Total Storage",  value: storageMb != null ? storageLabel : "—",            color: "#234E52", bg: "#B2F5EA" },
  ];

  return (
    <Box mb="24px">
      <Flex justifyContent="space-between" alignItems="flex-start" mb="20px">
        <Box>
          <Heading fontSize="22px" fontWeight="700" color="gray.800">
            Course Material Upload
          </Heading>
          <Text fontSize="13px" color="gray.500" mt="4px">
            Upload and manage course materials — PDF, PPT, Video, Image, Audio, and Word documents — across modules and lessons.
          </Text>
        </Box>
        <Button leftIcon={<FiUploadCloud />} colorScheme="blue" onClick={onUploadClick} flexShrink={0}>
          Upload Material
        </Button>
      </Flex>

      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
        gap="14px"
      >
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </Grid>
    </Box>
  );
};

export default MaterialsHeader;
