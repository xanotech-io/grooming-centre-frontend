import { Box, Flex, Stack } from "@chakra-ui/layout";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Heading,
  Image,
  Link,
  RichTextToView,
  Text,
} from "../../../components";
import coverImagePlaceholder from "../../../assets/images/events-banner.svg";
import breakpoints, {
  pageWrapperSpacing_userPages,
} from "../../../theme/breakpoints";
import {
  adminGetPollListing,
  adminGetSinglePoll,
} from "../../../services/http/endpoints/poll";
import { useEffect } from "react";
import { useState } from "react";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import { http } from "../../../services";
import { useToast } from "@chakra-ui/react";
import { capitalizeFirstLetter } from "../../../utils";

const PollsVotePage = () => {
  const { id: pollId } = useParams();
  const [singlePoll, setSinglePoll] = useState([]);
  const [answer, setAnswer] = useState();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const toast = useToast();

  const fetcher = async (id) => {
    const { poll } = await adminGetSinglePoll(id);
    console.log(poll);
    setSinglePoll(poll);
  };

  useEffect(() => {
    if (pollId) {
      fetcher(pollId);
    }
    //eslint-disable-next-line
  }, [pollId]);

  const renderSubHeading = (heading) => (
    <Box
      as="header"
      paddingBottom={5}
      marginBottom={5}
      borderBottom="1px"
      borderColor="accent.2"
    >
      <Heading fontSize="text.level2">{heading}</Heading>
    </Box>
  );

  const chooseAnswer = async () => {
    if (!answer) {
      return toast({
        description: capitalizeFirstLetter("Please select an option"),
        position: "top",
        status: "error",
      });
    }
    try {
      const path = `/polls/vote`;
      const body = {
        pollId,
        pollOptionId: answer,
      };
      await http.post(path, body);
      toast({
        description: "Vote successful",
        position: "top",
        status: "success",
      });
      history.push("/polls");
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

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
          <Heading>Vote</Heading>
          <Text as="level2">Participate in the following polls</Text>
        </Stack>
      </Box>
      <Box
        width="100%"
        maxWidth={breakpoints.laptop}
        backgroundColor="white"
        marginTop={20}
        shadow="0px 2px 7px rgba(0, 0, 0, 0.1)"
        padding={10}
      >
        <Box as="header">
          <Heading
            as="h1"
            fontSize="heading.h4"
            backgroundColor="#660060"
            padding={5}
            color="white"
          >
            Poll Question
          </Heading>
          <Flex paddingY={5} height="100%">
            <Flex
              flexDirection="column"
              as="main"
              flex={1}
              borderRight="1px"
              borderColor="accent.2"
              padding={5}
            >
              {renderSubHeading(`Question 1 of 1`)}
              <Flex
                flexDirection="column"
                justifyContent="space-between"
                as="form"
                flex={1}
                // minHeight="500px"
                // onSubmit={
                // 	shouldSubmit ? handleSubmitConfirmation : handleNextQuestion
                // }
              >
                <Box bg="accent.2" padding="1rem" marginBottom={6}>
                  <Text as="level2">{singlePoll?.poll?.question}</Text>
                </Box>
                <RadioGroup
                  defaultValue="1"
                  marginBottom={8}
                  flex={1}
                  onChange={setAnswer}
                  value={answer}
                >
                  <Stack spacing={4}>
                    {singlePoll?.poll?.pollOptions?.map((option) => (
                      <Radio key={option.id} value={option.id}>
                        <Text>{option.text}</Text>
                      </Radio>
                    ))}
                    {singlePoll?.poll?.pollOptions.length === 0 && (
                      <>No option for this question</>
                    )}

                    <Radio value={"default"} display="none">
                      <Text>default</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>

                {singlePoll?.poll?.pollOptions.length > 0 && (
                  <Flex justifyContent="space-between">
                    <Button
                      isLoading={loading}
                      onClick={chooseAnswer}
                      disabled={loading || singlePoll?.voted}
                    >
                      {"Vote"}
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export const PollsVotePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <PollsVotePage {...props} />} />;
};
