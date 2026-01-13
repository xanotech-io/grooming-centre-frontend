import { Box, Flex } from "@chakra-ui/layout";
import PropTypes from "prop-types";
import { AdminMainAreaWrapper } from "..";
import { Button, Heading, Text } from "../../components";
import { useGoBack } from "../../hooks";

export const EditPageLayout = ({
  children,
  submitButtonText,
  subTitle = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  submitButtonIsLoading,
  title,
  onSubmit,
}) => {
  const handleCancel = useGoBack();

  return (
    <AdminMainAreaWrapper>
      <Box as="section" paddingBottom={10}>
        <Flex
          shadow="md"
          rounded="sm"
          as="header"
          justifyContent="space-between"
          height="150px"
          backgroundColor="white"
          paddingX={5}
          paddingTop={5}
          marginBottom={5}
        >
          <Box>
            <Heading as="h1" fontSize="heading.h2" marginBottom={4}>
              {title}
            </Heading>

            {/* <Text as="level2">{subTitle}</Text> */}
          </Box>
        </Flex>

        <Flex>
          <Box as="form" flex={1} onSubmit={onSubmit}>
            <Box
              paddingX={5}
              paddingTop={10}
              paddingBottom={20}
              shadow="md"
              rounded="sm"
              backgroundColor="white"
            >
              {children}
            </Box>

            <Flex paddingY={10} justifyContent="space-between">
              <Button secondary onClick={handleCancel}>Cancel</Button>
              <Button
                type="submit"
                isLoading={submitButtonIsLoading}
                disabled={submitButtonIsLoading}
                loadingText={submitButtonText}
              >
                {submitButtonText}
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </AdminMainAreaWrapper>
  );
};

EditPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  submitButtonIsLoading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
};
