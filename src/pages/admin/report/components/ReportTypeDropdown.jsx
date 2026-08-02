import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';

/**
 * Report categories with their routes.
 * `key` is used to match the current page so we can show the checkmark.
 */
export const REPORT_CATEGORIES = [
    { key: 'student', label: 'Learners/Student Report', path: '/admin/report/studentReport' },
    { key: 'instructor', label: 'Instructor / Teaching Reports', path: '/admin/report/instructor' },
    { key: 'management', label: 'Administrative / Management Reports', path: '/admin/report/managementReport' },
    { key: 'examination', label: 'Examination Reports (OES)', path: '/admin/report' },
    { key: 'compliance', label: 'Compliance & Security Reports', path: '/admin/report/compliance' },
    { key: 'custom', label: 'Custom/AD HOC Reports', path: '/admin/report/custom' },
    { key: 'registers', label: 'Electronic Registers', path: '/admin/report/electronic-registers' },
    { key: 'tracking', label: 'Tracking & Reporting', path: '/admin/report/tracking' },
    { key: 'mis', label: 'Management Information System Reports', path: '/admin/report/mis' },
];

/**
 * ReportTypeDropdown
 *
 * Props:
 *  - currentKey: string  — the `key` of the currently active report category
 *                          (used to show the checkmark and the title)
 */
const ReportTypeDropdown = ({ currentKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const history = useHistory();

    const current = REPORT_CATEGORIES.find((c) => c.key === currentKey) || REPORT_CATEGORIES[0];

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (item) => {
        setIsOpen(false);
        history.push(item.path);
    };

    return (
        <Box position="relative" ref={ref} display="inline-block">
            {/* Trigger */}
            <Flex
                alignItems="center"
                gap="8px"
                cursor="pointer"
                onClick={() => setIsOpen((v) => !v)}
                userSelect="none"
            >
                <Text fontSize="28px" color="#101928" fontWeight="700">
                    {current.label}
                </Text>
                <Icon
                    as={FiChevronDown}
                    boxSize="22px"
                    color="#101928"
                    transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                    transition="transform 0.2s"
                />
            </Flex>

            {/* Dropdown Panel */}
            {isOpen && (
                <Box
                    position="absolute"
                    top="calc(100% + 8px)"
                    left="0"
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="10px"
                    boxShadow="0 8px 24px rgba(0,0,0,0.10)"
                    zIndex={200}
                    minW="320px"
                    py={1}
                    overflow="hidden"
                >
                    {REPORT_CATEGORIES.map((item, idx) => {
                        const isActive = item.key === currentKey;
                        const isLast = idx === REPORT_CATEGORIES.length - 1;
                        return (
                            <Flex
                                key={item.key}
                                alignItems="center"
                                justifyContent="space-between"
                                px={4}
                                py="11px"
                                cursor="pointer"
                                borderBottom={!isLast ? '1px solid #F2F4F7' : 'none'}
                                bg={isActive ? '#FBF5FF' : 'white'}
                                _hover={{ bg: isActive ? '#FBF5FF' : '#F7FAFC' }}
                                transition="background 0.15s"
                                onClick={() => handleSelect(item)}
                            >
                                <Text
                                    fontSize="14px"
                                    fontWeight={isActive ? '600' : '400'}
                                    color={isActive ? '#6b006b' : '#344054'}
                                >
                                    {item.label}
                                </Text>
                                {isActive && (
                                    <Icon as={FiCheck} color="#6b006b" boxSize="16px" />
                                )}
                            </Flex>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default ReportTypeDropdown;
