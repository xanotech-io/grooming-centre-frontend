import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { FiDownload, FiChevronDown } from "react-icons/fi";
import { FaFileCsv, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { exportRowsToCsv, exportRowsToExcel, exportRowsToPdf } from "../../utils";

export const ExportMenu = ({
  rows,
  filename,
  title,
  isDisabled,
  label = "Export",
  size = "sm",
}) => {
  const disabled = isDisabled ?? (!rows || rows.length <= 1);
  const base = (filename || "export").replace(/\.(csv|pdf|xlsx?)$/i, "");

  return (
    <Menu>
      <MenuButton
        as={Button}
        size={size}
        variant="outline"
        borderColor="#6b006b"
        color="#6b006b"
        leftIcon={<FiDownload />}
        rightIcon={<FiChevronDown />}
        isDisabled={disabled}
      >
        {label}
      </MenuButton>
      <MenuList>
        <MenuItem
          icon={<FaFileCsv color="#D69E2E" />}
          onClick={() => exportRowsToCsv(rows, `${base}.csv`)}
        >
          Export as CSV
        </MenuItem>
        <MenuItem
          icon={<FaFilePdf color="#E53E3E" />}
          onClick={() => exportRowsToPdf(rows, `${base}.pdf`, title)}
        >
          Export as PDF
        </MenuItem>
        <MenuItem
          icon={<FaFileExcel color="#38A169" />}
          onClick={() => exportRowsToExcel(rows, `${base}.xlsx`)}
        >
          Export as Excel
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ExportMenu;
