import { Flex, Box } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link, Text } from "../../../components";
import { useApp } from "../../../contexts";

const primaryLinks = [
  { href: "/dashboard", text: "Dashboard" },
  { href: "/courses", text: "Courses" },
  { href: "/forum", text: "Forum" },
];

const linkGroups = [
  {
    text: "Learning",
    items: [
      { href: "/library/books", text: "Library" },
      { href: "/events", text: "Events" },
      { href: "/polls", text: "Polls" },
    ],
  },
  {
    text: "Grades",
    items: [
      { href: "/courses/grade-overview", text: "Grade Overview" },
      { href: "/grade-books", text: "Grade Books" },
      { href: "/my-progress", text: "My Progress" },
      { href: "/assessment-results", text: "My Results" },
      { href: "/my-analytics", text: "My Analytics" },
    ],
  },
  {
    text: "Achievements",
    items: [
      { href: "/standalone-exams", text: "Exams" },
      { href: "/badges", text: "Badges" },
      { href: "/transcript", text: "Transcript" },
      { href: "/my-certificates", text: "My Certificates" },
    ],
  },
];

const trailingLinks = [{ href: "/profile", text: "Profile" }];

const NavLinkItem = ({ href, text }) => (
  <Box as="li" h="100%">
    <Link
      className="user-header-nav-link"
      activeClassName="user-header-nav-link--active"
      navLink
      href={href}
    >
      <Text as="level3" whiteSpace="nowrap">
        {text}
      </Text>
    </Link>
  </Box>
);

const NavGroupItem = ({ text, items, isActive }) => (
  <Box as="li" h="100%">
    <Menu>
      <MenuButton
        display="flex"
        alignItems="center"
        gap={1}
        height="100%"
        px={4}
        color={isActive ? "primary.base" : "inherit"}
        borderBottom="2px solid"
        borderColor={isActive ? "primary.base" : "transparent"}
        _hover={{ color: "primary.base" }}
      >
        <Text as="level3" whiteSpace="nowrap">
          {text}
        </Text>
        <MdKeyboardArrowDown />
      </MenuButton>
      <Portal>
        <MenuList zIndex={1000}>
          {items.map((item) => (
            <MenuItem
              key={item.href}
              as={RouterLink}
              to={item.href}
              fontWeight={isActive && item.isActive ? "bold" : "normal"}
            >
              {item.text}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
  </Box>
);

const NavBar = ({ ...rest }) => {
  const { handleLogout } = useApp();
  const { pathname } = useLocation();

  const isRouteActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Flex
      as="nav"
      alignSelf="stretch"
      justifyContent="center"
      minWidth={0}
      {...rest}
    >
      <Flex
        listStyleType="none"
        as="ul"
        alignItems="center"
        flexWrap="nowrap"
        overflowX="auto"
        overflowY="hidden"
        columnGap={{ tablet: 2, laptop: 4 }}
        h="100%"
        minWidth={0}
      >
        {primaryLinks.map((link) => (
          <NavLinkItem key={link.href} {...link} />
        ))}

        {linkGroups.map((group) => (
          <NavGroupItem
            key={group.text}
            text={group.text}
            items={group.items.map((item) => ({
              ...item,
              isActive: isRouteActive(item.href),
            }))}
            isActive={group.items.some((item) => isRouteActive(item.href))}
          />
        ))}

        {trailingLinks.map((link) => (
          <NavLinkItem key={link.href} {...link} />
        ))}

        <Text
          as="level3"
          color="red"
          cursor="pointer"
          ml={4}
          onClick={handleLogout}
          alignSelf="center"
          font="bold"
        >
          Logout
        </Text>
      </Flex>
    </Flex>
  );
};

export default NavBar;
