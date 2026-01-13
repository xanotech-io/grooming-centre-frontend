import { Image as ImageChakraUi } from "@chakra-ui/image";
import { Flex } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import PropTypes from "prop-types";

export const Image = ({
  boxSize,
  filter,
  imageElementProps,
  isLoading,
  height,
  objectFit = "cover",
  rounded,
  src,
  width,
  ...rest
}) => {
  return (
    <Flex
      overflow="hidden"
      height={height}
      width={width}
      boxSize={boxSize}
      rounded={rounded}
      {...rest}
    >
      {isLoading ? (
        <Skeleton width="100%" />
      ) : (
        <ImageChakraUi
          src={src}
          objectFit={objectFit}
          filter={filter}
          width="100%"
          {...imageElementProps}
        />
      )}
    </Flex>
  );
};

Image.propTypes = {
  boxSize: PropTypes.string,
  filter: PropTypes.string,
  height: PropTypes.any,
  imageElementProps: PropTypes.object,
  isLoading: PropTypes.bool,
  objectFit: PropTypes.string,
  rounded: PropTypes.string,
  src: PropTypes.any,
  width: PropTypes.any,
};
