import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";
import { Heading, Button } from "../../../../../components";

const RosterHeader = ({ courseName, semester, instructorName, onExportClick }) => (
  <Box mb="24px">
    <Flex justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Heading fontSize="22px" fontWeight="700" color="gray.800">
          Roster
        </Heading>
        <Text fontSize="13px" color="gray.500" mt="4px">
          {courseName
            ? `${courseName}${semester ? ` · ${semester}` : ""}${instructorName ? ` · ${instructorName}` : ""}`
            : "View enrolled students and export the roster in PDF, Excel, or CSV format."}
        </Text>
      </Box>
      <Button
        leftIcon={<FiDownload />}
        colorScheme="blue"
        onClick={onExportClick}
        flexShrink={0}
        isDisabled={!courseName}
      >
        Export Roster
      </Button>
    </Flex>
  </Box>
);

export default RosterHeader;
