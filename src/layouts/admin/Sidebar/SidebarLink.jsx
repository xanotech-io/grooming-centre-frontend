import Icon from "@chakra-ui/icon";
import { useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { matchPath, useLocation } from "react-router-dom";
import colors from "../../../theme/colors";
import PropTypes from "prop-types";
import useAccordion from "./hooks/useAccordion";
import { Box, Flex } from "@chakra-ui/layout";
import { Link, Text } from "../../../components";

const isPathActive = (pathname, href, exact) => {
  if (!href) return false;
  return !!matchPath(pathname, { path: href.split("?")[0], exact });
};

const SidebarLink = ({ link, onClick, roleName }) => {
  const { pathname } = useLocation();

  const visibleChildLinks = link.links?.filter(
    (child) => !child.roles || child.roles.some((r) => new RegExp(r, "i").test(roleName))
  );

  const isSelfActive = isPathActive(pathname, link.href, link.exact);
  const isChildActive =
    visibleChildLinks?.some((child) => isPathActive(pathname, child.href, child.exact)) ??
    false;
  const isHighlighted = isSelfActive || isChildActive;
  const isParent = !!link.links;

  const accordionManager = useAccordion(isChildActive);

  useEffect(() => {
    if (isChildActive) accordionManager.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChildActive]);

  const handleTopLevelLinkClick = () => {
    if (link.links) {
      accordionManager.handleToggle();
    }
  };

  const renderTopLevelContent = () => (
    <Flex
      align="center"
      gap={3}
      paddingY={2.5}
      paddingX={3}
      borderRadius="lg"
      onClick={handleTopLevelLinkClick}
      textTransform="capitalize"
      cursor="pointer"
      fontSize="sm"
      fontWeight={isHighlighted ? "semibold" : "medium"}
      transition="background-color .15s, color .15s"
      color={!isParent && isHighlighted ? "white" : isHighlighted ? colors.primary.base : "gray.600"}
      bg={!isParent && isHighlighted ? colors.primary.base : isHighlighted ? "gray.50" : "transparent"}
      _hover={
        !isParent && isHighlighted
          ? undefined
          : { bg: "gray.50", color: isHighlighted ? colors.primary.base : "gray.900" }
      }
    >
      <Icon fontSize="18px" opacity={isHighlighted ? 1 : 0.85}>
        {link.icon}
      </Icon>
      <Text flex={1} noOfLines={1}>
        {link.text}
      </Text>

      {link.links && (
        <Icon
          fontSize="16px"
          color={isHighlighted ? colors.primary.base : "gray.400"}
          transition="transform .15s"
          transform={`rotate(${accordionManager.isOpen ? 0 : 180}deg)`}
        >
          <BiChevronDown />
        </Icon>
      )}
    </Flex>
  );

  return (
    <li>
      {link.href && !isParent ? (
        <Link
          onClick={onClick}
          href={link.href}
          style={{ display: "block", textDecoration: "none" }}
        >
          {renderTopLevelContent()}
        </Link>
      ) : (
        renderTopLevelContent()
      )}

      {link.links && (
        <Box
          as="ul"
          listStyleType="none"
          overflow="hidden"
          transition="max-height .5s linear"
          maxHeight={
            accordionManager.isOpen ? `${44 * visibleChildLinks.length}px` : 0
          }
        >
          {visibleChildLinks.map((child) => {
            const childActive = isPathActive(pathname, child.href, child.exact);
            return (
              <li key={child.text}>
                <Link
                  href={child.href}
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <Flex
                    align="center"
                    marginY={1}
                    marginLeft={4}
                    paddingY={1.5}
                    paddingX={3}
                    borderRadius="md"
                    borderLeft="2px solid"
                    borderLeftColor={childActive ? colors.primary.base : "transparent"}
                    textTransform="capitalize"
                    fontSize="sm"
                    fontWeight={childActive ? "semibold" : "normal"}
                    color={childActive ? colors.primary.base : "gray.600"}
                    bg={childActive ? "rgba(102, 0, 102, 0.08)" : "transparent"}
                    _hover={{ bg: "gray.50", color: colors.primary.base }}
                  >
                    <Text>{child.text}</Text>
                  </Flex>
                </Link>
              </li>
            );
          })}
        </Box>
      )}
    </li>
  );
};

SidebarLink.propTypes = {
  link: PropTypes.object,
  onClick: PropTypes.func,
  roleName: PropTypes.string,
};

export default SidebarLink;
