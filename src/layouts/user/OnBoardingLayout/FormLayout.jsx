import { Box, Flex, Stack } from "@chakra-ui/react";
import PropTypes from "prop-types";

export const OnBoardingFormLayout = ({
  renderBody,
  renderFooter,
  renderHeader,
  renderInputs,
  renderSubmit,
  onSubmit,
}) => {
  return (
    <Flex flexDirection="column" alignItems="center" as="section">
      {renderHeader && (
        <Box as="header" textAlign="center" height="120px">
          {renderHeader()}
        </Box>
      )}

      <Box marginBottom={5}>
        {renderBody && (
          <Box textAlign="center" marginBottom={10}>
            {renderBody()}
          </Box>
        )}

        {!renderBody && renderInputs && renderSubmit && (
          <Flex
            flexDirection="column"
            as="form"
            width="356px"
            marginX="auto"
            onSubmit={onSubmit}
          >
            {
              <Stack spacing={5} marginBottom={10}>
                {renderInputs()}
              </Stack>
            }

            {renderSubmit({ type: "submit" })}
          </Flex>
        )}
      </Box>
      {renderFooter && (
        <Box as="footer" width="356px" fontWeight="bold">
          {renderFooter()}
        </Box>
      )}
    </Flex>
  );
};

OnBoardingFormLayout.propTypes = {
  renderBody: PropTypes.func,
  renderFooter: PropTypes.func,
  renderHeader: PropTypes.func,
  renderInputs: PropTypes.func,
  renderSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
};
