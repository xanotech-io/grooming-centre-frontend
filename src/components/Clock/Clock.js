import React, { useEffect } from "react";
import { Box, Flex } from "@chakra-ui/layout";
import useCountdown from "../../hooks/useCountdown";
import { Text } from "../";
import parseMs from "../../utils/parseMs";

export const Clock = ({ duration, startAt }) => {
  const initialTime = duration * 1000; // initial time in milliseconds, defaults to 60000
  const interval = 1000; // interval to change remaining time amount, defaults to 1000

  const [timeLeft, { start }] = useCountdown(initialTime, interval);

  useEffect(() => {
    if (duration) {
      start(startAt);
    }
  }, [duration, start, startAt]);

  const elapsed = parseMs(timeLeft);

  return (
    <Flex justifyContent="space-between" marginBottom={6}>
      <Box textAlign="center">
        <Text bold as="level1">
          {elapsed.hours || "0"}
        </Text>
        <Text color="accent.2">hours</Text>
      </Box>

      <Box textAlign="center">
        <Text bold as="level1">
          {elapsed.minutes || "0"}
        </Text>
        <Text color="accent.2">minutes</Text>
      </Box>

      <Box textAlign="center">
        <Text bold as="level1">
          {elapsed.seconds || "0"}
        </Text>
        <Text color="accent.2">seconds</Text>
      </Box>
    </Flex>
  );
};

Clock.defaultProps = {};
