import { Input } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import { forwardRef } from "react";
import { Button } from "../..";

const MiniUploadContent = forwardRef(
  (
    { getRootProps, getInputProps, hideImage, wrapperProps, mute, props, rest },
    ref
  ) => {
    const renderContent = () => (
      <Button width="fit-content" secondary sm>
        Re-upload
      </Button>
    );

    return (
      <Flex alignItems="center" {...wrapperProps}>
        {!hideImage && (
          <Skeleton boxSize="60px" rounded="full" marginRight={5} />
        )}

        {mute ? (
          renderContent()
        ) : (
          <Box {...props} {...getRootProps()}>
            <Input ref={ref} {...getInputProps()} {...rest} />

            {renderContent()}
          </Box>
        )}
      </Flex>
    );
  }
);

export default MiniUploadContent;
