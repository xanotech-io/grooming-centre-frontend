import Icon from "@chakra-ui/icon";
import { useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import colors from "../../../theme/colors";
import PropTypes from "prop-types";
import useAccordion from "./hooks/useAccordion";
import { Box, Flex } from "@chakra-ui/layout";
import { Link, Text } from "../../../components";

const SidebarLink = ({ link, onClick }) => {
  const accordionManager = useAccordion();

  const handleTopLevelLinkClick = () => {
    if (link.links) {
      accordionManager.handleToggle();
    }
  };

  useEffect(() => {
    if (window.location.pathname.includes(link.matcher)) {
      accordionManager.setIsActive(true);
    } else {
      accordionManager.setIsActive(false);
    }
  }, [link.matcher, accordionManager]);

  const renderTopLevelContent = (props) => (
    <Flex
      alignItems="center"
      paddingY={3}
      paddingX={3}
      onClick={handleTopLevelLinkClick}
      textTransform="capitalize"
      _hover={{ cursor: "pointer" }}
      {...props}
      {...(accordionManager.isActive
        ? {
            backgroundColor: colors.secondary.base,
            color: "white",
            borderRadius: "4px",
          }
        : {})}
    >
      <Icon fontSize="heading.h3" marginRight={3}>
        {link.icon}
      </Icon>
      <Text flex={1}>{link.text}</Text>

      {link.links && (
        <Icon
          fontSize="heading.h3"
          transition=".15s"
          transform={`rotate(${accordionManager.isOpen ? 0 : 180}deg)`}
        >
          <BiChevronDown />
        </Icon>
      )}
    </Flex>
  );

  return (
    <li>
      {link.href ? (
        <Link
          onClick={onClick}
          navLink
          href={link.href}
          exact={link.exact}
          style={{
            display: "block",
            borderRadius: "4px",
            color: colors.accent[3],
          }}
          activeStyle={{
            backgroundColor: colors.others[3],
            color: "white",
          }}
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
            accordionManager.isOpen ? `${37 * link.links.length}px` : 0
          }
        >
          {link.links.map((link) => (
            <li key={link.text}>
              <Link
                navLink
                href={link.href}
                activeStyle={{
                  color: colors.primary.base,
                  fontWeight: "bold",
                  backgroundColor: colors.secondary["05"],
                  borderRadius: "1rem",
                }}
                style={{
                  display: "block",
                  color: colors.accent[3],
                }}
              >
                <Text
                  padding={1}
                  marginY={2}
                  paddingX={5}
                  textTransform="capitalize"
                  _hover={{ color: "accent.2" }}
                >
                  {link.text}
                </Text>
              </Link>
            </li>
          ))}
        </Box>
      )}
    </li>
  );
};

SidebarLink.propTypes = {
  link: PropTypes.object,
};

export default SidebarLink;
