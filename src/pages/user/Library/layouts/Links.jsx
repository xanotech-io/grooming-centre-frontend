import { Flex } from "@chakra-ui/layout";
import { Link, Text } from "../../../../components";
import colors from "../../../../theme/colors";

const links = [
  {
    href: `/library/books`,
    text: "Books",
  },
  {
    href: `/library/audio`,
    text: "Audio",
  },
  {
    href: `/library/videos`,
    text: "Videos",
  },
];

const Links = () => {
  return (
    <Flex
      alignItems="center"
      as="header"
      paddingX={10}
      paddingBottom={6}
      position="relative"
      zIndex={1}
    >
      <nav>
        <Flex as="ul" listStyleType="none">
          {links.map((link) => (
            <li key={link.text}>
              <Link
                navLink
                href={link.href}
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

export default Links;
