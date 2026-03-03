import { Flex } from "@chakra-ui/layout";
import { Spinner, Image, Text, Heading } from "../../../components";
import emptyImage from "../../../assets/images/empty-events.svg";

export const PageLoaderLayout = ({ children = <Spinner />, ...rest }) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      flexDirection="column"
      height="100vh"
      width="100vw"
      {...rest}
    >
      {children}
    </Flex>
  );
};

export const EmptyState = ({
  children,
  illustration = (
    <Image
      src={emptyImage}
      height="200px"
      alt="Course Header"
      mb={5}
      transform="translateX(-10px)"
    />
  ),
  heading,
  description,
  cta,
  ...rest
}) => (
  <PageLoaderLayout height="60vh" width="100%" {...rest}>
    {children || (
      <>
        {illustration}

        <Heading type="h3">{heading}</Heading>
        <Text as="level3" bold mt={3} mb={cta && 6}>
          {description}
        </Text>

        {cta}
      </>
    )}
  </PageLoaderLayout>
);
