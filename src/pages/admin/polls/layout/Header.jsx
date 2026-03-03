import { Flex } from "@chakra-ui/layout";
import { Link, Text } from "../../../../components";
import colors from "../../../../theme/colors";


const links = [
  {
    href: (pollId) => `/admin/polls/details/${pollId}/info`,
    text: "Info",
  },
  {
    href: (pollId) => `/admin/polls/details/${pollId}/options`,
    text: "Options",
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
      paddingLeft={20}
      shadow="0 2px 2px rgba(0, 0, 0, .05)"
      position="relative"
      zIndex={1}
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
