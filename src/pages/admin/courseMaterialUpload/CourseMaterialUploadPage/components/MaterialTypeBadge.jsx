import React from "react";
import { Badge } from "@chakra-ui/react";

const TYPE_CONFIG = {
  PDF:   { label: "PDF",   bg: "#FED7D7", color: "#C53030" },
  PPT:   { label: "PPT",   bg: "#FEEBC8", color: "#C05621" },
  VIDEO: { label: "VIDEO", bg: "#E9D8FD", color: "#6B46C1" },
  IMAGE: { label: "IMAGE", bg: "#BEE3F8", color: "#2B6CB0" },
  AUDIO: { label: "AUDIO", bg: "#C6F6D5", color: "#276749" },
  WORD:  { label: "WORD",  bg: "#B2F5EA", color: "#234E52" },
};

const FORMAT_TO_TYPE = {
  PDF: "PDF",
  PPT: "PPT", PPTX: "PPT",
  MP4: "VIDEO", AVI: "VIDEO", MOV: "VIDEO",
  JPG: "IMAGE", JPEG: "IMAGE", PNG: "IMAGE",
  MP3: "AUDIO", WAV: "AUDIO",
  DOC: "WORD", DOCX: "WORD",
};

const MaterialTypeBadge = ({ type, fileFormat }) => {
  const resolved = type || FORMAT_TO_TYPE[fileFormat?.toUpperCase()] || "PDF";
  const cfg = TYPE_CONFIG[resolved] || TYPE_CONFIG["PDF"];

  return (
    <Badge
      bg={cfg.bg}
      color={cfg.color}
      borderRadius="6px"
      px="8px"
      py="2px"
      fontSize="11px"
      fontWeight="600"
      letterSpacing="0.3px"
    >
      {cfg.label}
    </Badge>
  );
};

export default MaterialTypeBadge;
