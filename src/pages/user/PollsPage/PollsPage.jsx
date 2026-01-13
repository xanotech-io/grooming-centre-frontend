import { Box, Stack } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
import { Heading, Image, Link, Text } from "../../../components";
import coverImagePlaceholder from "../../../assets/images/events-banner.svg";
import { pageWrapperSpacing_userPages } from "../../../theme/breakpoints";
import { adminGetPollListing } from "../../../services/http/endpoints/poll";
import { useEffect } from "react";
import { useState } from "react";

const PollsPage = () => {
  const [allPolls, setAllPolls] = useState();
  const fetcher = async () => {
    const { polls } = await adminGetPollListing();
    setAllPolls(polls);
  };

  useEffect(() => {
    fetcher();
  }, []);

  return (
    <Box>
      <Box
        as="section"
        padding={10}
        marginBottom={10}
        color="white"
        position="relative"
      >
        <Image
          src={coverImagePlaceholder}
          width="100%"
          height="100%"
          top={0}
          left={0}
          position="absolute"
          alt="Course Header"
        />

        <Stack
          spacing={7}
          position="relative"
          // zIndex={1}
          {...pageWrapperSpacing_userPages}
        >
          <Heading>Polls</Heading>
          <Text as="level2">Participate in the following polls</Text>
        </Stack>
      </Box>
      <Box padding={"1rem"}>
        {allPolls &&
          allPolls.map((poll, index) => (
            <Link href={`/polls/${poll.id}/vote`} key={poll.id}>
              <Text
                _hover={{
                  textDecoration: "underline",
                }}
                as="level3"
                bold
                mb={{ base: 1, tablet: 2 }}
              >
                {index + 1}) {poll.question}
              </Text>
            </Link>
          ))}
      </Box>
    </Box>
  );
};

export const PollsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <PollsPage {...props} />} />;
};
