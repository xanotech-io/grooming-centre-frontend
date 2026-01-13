import { Box, Flex, HStack } from "@chakra-ui/react";
import { Button } from "../../../../components";
import { AiOutlineFire } from "react-icons/ai";
import { BsArrowUpLeft, BsClockHistory } from "react-icons/bs";
import { GoIssueClosed } from "react-icons/go";
import useDisplayHeader from "./hooks/useDisplayHeader";
import { useQueryParams, useTab } from "../../../../hooks";

const links = [
  {
    text: "New",
    tab: "new",
    icon: <BsClockHistory />,
  },
  {
    text: "Top",
    tab: "top",
    icon: <BsArrowUpLeft />,
  },
  {
    text: "Hot",
    tab: "hot",
    icon: <AiOutlineFire />,
  },
  {
    text: "Closed",
    tab: "closed",
    icon: <GoIssueClosed />,
  },
];

const Header = ({ ...rest }) => {
  const { pageDoNotRequireHeader } = useDisplayHeader();

  const { currentTab } = useTab();
  const getStyles = (tab) =>
    !(tab === currentTab) ? { ordinary: true } : { blue: true };
  const query = useQueryParams().get("q");

  return (
    <Flex
      {...rest}
      gap={6}
      flexDirection={{ base: "column", md: "column", lg: "row" }}
      justifyContent={!pageDoNotRequireHeader ? "space-between" : "flex-end"}
    >
      {!pageDoNotRequireHeader() && !query && (
        <HStack alignSelf="flex-start" spacing={1} flex={1}>
          {links.map((link) => (
            <Button
              key={link.tab}
              sm
              link={`?tab=${link.tab}`}
              {...getStyles(link.tab)}
              paddingX={3}
            >
              <Box display="flex" gap="5px">
                {link.icon} <p>{link.text}</p>
              </Box>
            </Button>
          ))}
        </HStack>
      )}

      <AskAQuestionButton />
    </Flex>
  );
};

export const AskAQuestionButton = ({ ...rest }) => (
  <Button link="/forum/your-questions/add" {...rest}>
    Ask a question
  </Button>
);

export default Header;
