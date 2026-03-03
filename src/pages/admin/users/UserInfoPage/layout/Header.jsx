import { Flex } from "@chakra-ui/layout";
import { Link, Text } from "../../../../../components";
import colors from "../../../../../theme/colors";

const links = [
  {
    href: (userId) => `/admin/users/details/${userId}/profile`,
    text: "Profile",
  },
  // {
  //   href: (userId) => `/admin/users/details/${userId}/certificate`,
  //   text: "Certificate",
  // },
  {
    href: (userId) => `/admin/users/details/${userId}/courses`,
    text: "Courses",
  },
  // {
  //   href: (userId) => `/admin/users/details/${userId}/badges`,
  //   text: "Badges",
  // },
  {
    href: (userId) => `/admin/users/details/${userId}/grade-history`,
    text: "Grade History",
  },
];

const Header = () => {
  const id = window.location.pathname
    .match(/\/details\/.{1,}\//)[0]
    .replace("/details/", "")
    .replace("/", "");

  return (
    <Flex
      alignItems="center"
      as="header"
      backgroundColor="white"
      height="50px"
      paddingRight={5}
      paddingLeft={10}
      shadow="0 2px 2px rgba(0, 0, 0, .05)"
      position="relative"
    >
      <nav>
        <Flex as="ul" listStyleType="none">
          {links.map((link) => (
            <li key={link.text}>
              <Link
                navLink
                href={link.href(id)}
                style={{
                  color: colors.accent[2],
                  display: "block",
                }}
                activeStyle={{
                  color: colors.black,
                }}
              >
                <Text paddingX={3}>{link.text}</Text>
              </Link>
            </li>
          ))}
        </Flex>
      </nav>
    </Flex>
  );
};

export default Header;
