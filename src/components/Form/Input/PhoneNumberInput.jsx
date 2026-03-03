import { forwardRef } from "react";
import { Input } from "./Input";
import { Flex, Box } from "@chakra-ui/react";
import { Text } from "../..";

export const PhoneNumberInput = forwardRef((props, ref) => {
  return (
    <Box position="relative" height="fit-content">
      <Flex
        justifyContent="center"
        alignItems="center"
        position="absolute"
        left={0}
        bottom={0}
        w="18%"
        h="40px"
        borderRight="1px"
        borderColor="accent.1"
        color="accent.3"
      >
        <Text>+234</Text>
      </Flex>
      <Input
        pl={20}
        placeholder="8124567891"
        ref={ref}
        {...props}
        type="number"
      />
    </Box>
  );
});
