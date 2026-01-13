import { Image } from "@chakra-ui/image";
import { Box, Flex } from "@chakra-ui/layout";
import onBoardingImage from "../../../assets/images/GC Login 1.jpg";
import bgImagePlaceholder from "../../../assets/images/Auth.svg";
import { Heading, Text } from "../../../components";

const Hero = () => {
  return (
    <Flex
      flexDirection="column"
      flex={1}
      display={{ lg: "flex", md: "none", sm: "none", base: "none" }}
    >
      <Box flex={1.5} backgroundColor="primary.hover" position="relative">
        <Image
          position="absolute"
          height="100%"
          width="100%"
          objectFit="cover"
          src={onBoardingImage}
          opacity={0.65}
        />
      </Box>

      <Flex
        flex={1}
        backgroundColor="secondary.8"
        color="white"
        flexDirection="column"
        justifyContent="center"
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        <Image
          src={bgImagePlaceholder}
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={0.5}
          top={0}
          left={0}
          position="absolute"
          alt="Course Header"
        />

        <Flex
          position="relative"
          flexDirection="column"
          alignItems="center"
          marginTop="-10"
          padding={10}
        >
          <Box paddingTop={10} marginBottom={16}>
            <Heading as="h1" size="md" marginBottom={6}>
              GROOMING CENTRE E-LEARNING SUITE
            </Heading>

            <Text maxWidth="500px">Training beyond Borders</Text>
          </Box>

          {/* <HStack spacing={5}>
            <Box boxSize="10px" rounded="full" backgroundColor="white" />
            <Box boxSize="10px" rounded="full" backgroundColor="white" />
            <Box boxSize="10px" rounded="full" backgroundColor="white" />
          </HStack> */}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Hero;
