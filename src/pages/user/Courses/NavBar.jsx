import { Flex } from "@chakra-ui/layout";
import { Heading, Link } from "../../../components";

const links = [
  {
    href: "/courses",
    text: "All courses",
  },
  {
    href: "/courses/new",
    text: "New Courses",
  },
  {
    href: "/courses/completed",
    text: "Completed",
  },
  {
    href: "/courses/in-progress",
    text: "In Progress",
  },
];

const NavBar = ({ ...rest }) => {
  return (
    <Flex as="nav" {...rest} className="">
      <Flex listStyleType="none" as="ul">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="user-courses-nav-link"
              activeClassName="user-courses-nav-link--active"
              navLink
              exact
              href={link.href}
            >
              <Heading as="h2" fontSize="text.level2">
                {link.text}
              </Heading>
            </Link>
          </li>
        ))}
      </Flex>
    </Flex>
  );
};

export default NavBar;
