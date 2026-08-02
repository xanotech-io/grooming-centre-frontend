import React from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
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

const PageHeader = ({ stats, onUploadClick }) => {
  const cards = [
    {
      label: "Total Uploaded",
      value: stats.total,
      color: "#3182CE",
      bg: "#EBF8FF",
    },
    {
      label: "Verified",
      value: stats.verified,
      color: "#38A169",
      bg: "#E6F4EA",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "#DD6B20",
      bg: "#FFF5EA",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "#E53E3E",
      bg: "#FED7D7",
    },
  ];

  return (
    <Box mb="24px">
      <Flex justifyContent="space-between" alignItems="center" mb="20px">
        <Box>
          <Heading fontSize="22px" fontWeight="700" color="gray.800">
            Upload Certificates &amp; Documents
          </Heading>
          <Text fontSize="13px" color="gray.500" mt="4px">
            Upload, manage, and verify student certificates, registration sheets,
            and evaluation records.
          </Text>
        </Box>
        <Button leftIcon={<FiUpload />} colorScheme="blue" onClick={onUploadClick}>
          Upload Document
        </Button>
      </Flex>

      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        }}
        gap="14px"
      >
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </Grid>
    </Box>
  );
};

export default PageHeader;
