import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { FiDownload, FiChevronDown } from "react-icons/fi";
import { FaFileCsv, FaFilePdf, FaFileExcel } from "react-icons/fa";

export const ServerExportMenu = ({
    onExport,
    isDisabled,
    isLoading,
    label = "Export",
    size = "sm",
}) => {
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
                isDisabled={isDisabled}
                isLoading={isLoading}
            >
                {label}
            </MenuButton>
            <MenuList>
                <MenuItem
                    icon={<FaFileCsv color="#D69E2E" />}
                    onClick={() => onExport("csv")}
                >
                    Export as CSV
                </MenuItem>
                <MenuItem
                    icon={<FaFilePdf color="#E53E3E" />}
                    onClick={() => onExport("pdf")}
                >
                    Export as PDF
                </MenuItem>
                <MenuItem
                    icon={<FaFileExcel color="#38A169" />}
                    onClick={() => onExport("excel")}
                >
                    Export as Excel
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default ServerExportMenu;
