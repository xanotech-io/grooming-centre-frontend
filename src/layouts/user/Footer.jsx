import { Box, Flex } from "@chakra-ui/layout";
import { Text } from "../../components";
import { maxWidthStyles_userPages } from "../../theme/breakpoints";

const date = new Date();
const year = date.getFullYear();
const Footer = () => {
  return (
    <Box
      as="footer"
      color="white"
      backgroundColor="others.3"
      height="60px"
      padding={5}
      // marginLeft={{ base: '0', lg: '250px', md: '250px' }}
    >
      <Flex
        alignItems="center"
        {...maxWidthStyles_userPages}
        justifyContent="center"
      >
        <Box textAlign="center">
          GROOMING CENTRE E-LEARNING SUITE © {year} All rights reversed
        </Box>
      </Flex>
    </Box>
  );
};

export default Footer;
