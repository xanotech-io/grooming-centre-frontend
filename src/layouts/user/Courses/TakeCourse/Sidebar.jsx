import Icon from "@chakra-ui/icon";
import { Box, Flex, HStack } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { AiOutlineLeft } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { GoIssueClosed } from "react-icons/go";
import { IoVideocam } from "react-icons/io5";
import { VscFiles } from "react-icons/vsc";
import {
  Button,
  Heading,
  Link,
  SkeletonText,
  Text,
} from "../../../../components";
import colors from "../../../../theme/colors";

const Sidebar = ({ manager }) => {
  const { course, links, isLoading, sidebarLinkClickedState } = manager;

  const [, setSidebarLinkClicked] = sidebarLinkClickedState;
  const handleSidebarLinkClicked = () => setSidebarLinkClicked(true);

  const getStatusText = (link) => {
    if (link.hasCompleted) return "Completed";
    if (link.hasElapsed) return "Time Elapsed";
    if (link.isUpcoming) return "Upcoming";

    return "Ongoing";
  };

  const renderContent = (link, props) => (
    <Tooltip
      label={`${link.text} (${getStatusText(link)})`}
      aria-label={link.text}
    >
      <HStack spacing={2} padding={2} {...props}>
        <Icon opacity={link.disabled ? 0.5 : 1} fontSize="text.level1">
          {link.type !== "video" ? <VscFiles /> : <IoVideocam />}
        </Icon>

        <Text opacity={link.disabled ? 0.5 : 1} isTruncated flex={1}>
          {link.text}
        </Text>

        {link.hasCompleted && (
          <Icon fontSize="text.level2" color="accent.5">
            <FaCheck />
          </Icon>
        )}

        {link.hasElapsed && (
          <Icon fontSize="text.level1" color="secondary.6">
            <GoIssueClosed />
          </Icon>
        )}

        {/* {link.isUpcoming && (
          <Icon fontSize="heading.h3" color="secondary.6">
            <MdOutlinePending />
          </Icon>
        )} */}
      </HStack>
    </Tooltip>
  );

  return (
    <Flex
      flexDirection="column"
      as="aside"
      height="100vh"
      flexShrink={0}
      width="250px"
      borderRight="1px"
      borderColor="accent.1"
    >
      <Box as="header">
        <Flex
          justifyContent="space-between"
          borderBottom="1px"
          borderColor="accent.1"
        >
          <Button
            ghost
            leftIcon={<AiOutlineLeft />}
            flex={1}
            link={course?.id && `/courses/details/${course.id}`}
          >
            Back
          </Button>
          <Button ghost flex={1} link="/">
            Home
          </Button>
        </Flex>

        <Box paddingY={7} paddingX={2}>
          {isLoading ? (
            <SkeletonText />
          ) : (
            <Heading fontSize="h4">{course?.title}</Heading>
          )}
        </Box>
      </Box>

      <Box as="nav" paddingBottom={16} flex={1} overflowY="auto">
        <Box as="ul" listStyleType="none" paddingRight={1}>
          {isLoading ? (
            <SkeletonText numberOfLines={10} height="37px" spacing={1} />
          ) : (
            links?.map((link) => {
              return (
                <li key={link.id}>
                  {link.disabled ? (
                    renderContent(link, { cursor: "not-allowed" })
                  ) : (
                    <Link
                      navLink
                      href={link.to}
                      onClick={handleSidebarLinkClicked}
                      exact={true}
                      style={{
                        display: "block",
                      }}
                      activeStyle={{
                        background: colors.primary.base,
                        color: colors.white,
                      }}
                    >
                      {renderContent(link)}
                    </Link>
                  )}
                </li>
              );
            })
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default Sidebar;
