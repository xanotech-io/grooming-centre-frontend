import { useLocation } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/layout";

const TABS = [
  { label: "Course Assessment", href: "/admin/report/course-assessment" },
  { label: "Assessment Overview", href: "/admin/report/assessment-overview" },
  { label: "Department Report", href: "/admin/report/assessment/department" },
  { label: "My Evaluations", href: "/admin/report/assessment/evaluations" },
];

const AssessmentTabBar = () => {
  const { pathname } = useLocation();

  return (
    <Flex
      borderBottom="2px"
      borderColor="gray.200"
      mb={6}
      overflowX="auto"
      flexShrink={0}
      gap={0}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Box
            key={tab.href}
            as="a"
            href={tab.href}
            px={5}
            py={3}
            fontSize="sm"
            fontWeight={isActive ? "700" : "500"}
            color={isActive ? "primary.base" : "gray.500"}
            borderBottom="2px"
            borderColor={isActive ? "primary.base" : "transparent"}
            mb="-2px"
            whiteSpace="nowrap"
            transition="color 0.15s, border-color 0.15s"
            _hover={{ color: "primary.base", textDecoration: "none" }}
          >
            {tab.label}
          </Box>
        );
      })}
    </Flex>
  );
};

export default AssessmentTabBar;
