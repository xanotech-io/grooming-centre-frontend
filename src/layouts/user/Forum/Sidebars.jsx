import { Box, Flex } from "@chakra-ui/react";
import {
  AiOutlineComment,
  AiOutlineQuestionCircle,
  AiOutlineUnorderedList,
} from "react-icons/ai";
import { BsTag } from "react-icons/bs";
import { useHistory } from "react-router";
import { Link, SearchBar, Text } from "../../../components";
import { AskAQuestionButton } from "./Header/Header";
import useDisplayHeader from "./Header/hooks/useDisplayHeader";
import { BiMenu, BiXCircle } from "react-icons/bi";
import { useState } from "react";

const menuLinks = [
  {
    href: "/forum/questions?tab=new",
    text: "Questions",
    icon: <AiOutlineUnorderedList />,
  },
  {
    href: "/forum/tags",
    text: "Tags",
    icon: <BsTag />,
  },
  // {
  //   href: "/forum/mentions",
  //   text: "Mentions",
  //   icon: <BsTag />,
  // },
];
const personalNavLinks = [
  {
    href: "/forum/your-questions",
    text: "Your questions",
    icon: <AiOutlineQuestionCircle />,
  },
  {
    href: "/forum/your-answers",
    text: "Your answers",
    icon: <AiOutlineComment />,
  },
];

export const Sidebar = ({ ...rest }) => {
  const { push } = useHistory();
  const [click, setClick] = useState(false);
  const handleSearch = (query) => {
    push(`/forum/questions?q=${query}`);
  };

  return (
    <Box pos={"relative"}>
      <Box
        display={{ base: "block", md: "block", lg: "none" }}
        cursor={"pointer"}
      >
        <BiMenu
          style={{
            width: "34px",
            height: "34px",
          }}
          onClick={() => {
            setClick(!click);
          }}
        />
      </Box>
      <Box
        {...rest}
        position={{ lg: "static", md: "absolute", sm: "absolute" }}
        left={click ? "0" : "-1000%"}
        top={"0px"}
        zIndex={100}
        bg={"#fff"}
        boxShadow={{ base: "xl", md: "xl", lg: "none" }}
        border={{ base: "1px solid gray", md: "1px solid gray", lg: "none" }}
        transition={"0.6s"}
      >
        <Box
          pos={"absolute"}
          right={"-29px"}
          top={"-7px"}
          color={"accent.3"}
          cursor={"pointer"}
          display={{ base: "block", md: "block", lg: "none" }}
          onClick={() => {
            setClick(!click);
          }}
        >
          <BiXCircle
            style={{
              width: "30px",
              height: "30px",
            }}
          />
        </Box>
        <SearchBar
          sm
          marginBottom={5}
          border="none"
          placeholder="Question by title, description or tag"
          fontSize="text.level5"
          onSearch={handleSearch}
        />

        <Box as="nav">
          <Flex as="ul" listStyleType="none" flexDirection="column">
            <Text
              textTransform="uppercase"
              marginLeft={6}
              paddingY={2}
              color="accent.3"
            >
              Menu
            </Text>
            {menuLinks.map((link) => (
              <li
                key={link.href}
                onClick={() => {
                  setClick(false);
                }}
              >
                <Link
                  className="user-forum-sidebar-link"
                  activeClassName="user-forum-sidebar-link--active"
                  navLink
                  exact={link.exact}
                  href={link.href}
                >
                  {link.icon}
                  <Text marginLeft={2} fontWeight="bold">
                    {link.text}
                  </Text>
                </Link>
              </li>
            ))}

            <Text
              textTransform="uppercase"
              marginLeft={6}
              marginTop={3}
              paddingY={2}
              color="accent.3"
            >
              Personal Navigator
            </Text>
            {personalNavLinks.map((link) => (
              <li
                key={link.href}
                onClick={() => {
                  setClick(false);
                }}
              >
                <Link
                  className="user-forum-sidebar-link"
                  activeClassName="user-forum-sidebar-link--active"
                  navLink
                  exact={link.exact}
                  href={link.href}
                >
                  {link.icon}
                  <Text marginLeft={2} fontWeight="bold">
                    {link.text}
                  </Text>
                </Link>
              </li>
            ))}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export const Aside = ({ ...rest }) => {
  const { pageDoNotRequireHeader, isAddQuestionPage } = useDisplayHeader();

  return (
    <Box as="aside" {...rest}>
      {pageDoNotRequireHeader() && !isAddQuestionPage && (
        <Box marginBottom={8} textAlign="right">
          <AskAQuestionButton />
        </Box>
      )}
    </Box>
  );
};
