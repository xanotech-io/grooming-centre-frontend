import React from "react";
import { Badge } from "@chakra-ui/react";

const STATUS_CONFIG = {
  VERIFIED: { bg: "#E6F4EA", color: "#38A169", label: "Verified" },
  PENDING: { bg: "#FFF5EA", color: "#DD6B20", label: "Pending" },
  REJECTED: { bg: "#FED7D7", color: "#E53E3E", label: "Rejected" },
};

const DocumentStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    bg: "gray.100",
    color: "gray.600",
    label: status,
  };

  return (
    <Badge
      bg={config.bg}
      color={config.color}
      px="12px"
      py="4px"
      borderRadius="12px"
      textTransform="none"
      fontWeight="500"
      fontSize="12px"
    >
      {config.label}
    </Badge>
  );
};

export default DocumentStatusBadge;
