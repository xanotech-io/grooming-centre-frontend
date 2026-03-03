import { Heading as HeadingChakraui } from "@chakra-ui/layout";
import PropTypes from "prop-types";

export const Heading = ({
  as = "h2",
  children,
  fontSize,
  italic,
  medium,
  regular,
  size,
  ...rest
}) => {
  const definedFontSize = `heading.${as}`;

  return (
    <HeadingChakraui
      as={as}
      fontWeight={regular ? "light" : medium ? "regular" : "bold"}
      fontStyle={italic && "italic"}
      // If there's a custom `size` use it
      size={size}
      // If there's NO custom `size` use the defined `fontSize` instead
      fontSize={!size ? fontSize || definedFontSize : undefined}
      {...rest}
    >
      {children}
    </HeadingChakraui>
  );
};

Heading.propTypes = {
  as: PropTypes.oneOf(["h1", "h2", "h3", "h4"]),
  children: PropTypes.any,
  fontSize: PropTypes.string,
  italic: PropTypes.bool,
  regular: PropTypes.bool,
  medium: PropTypes.bool,
  size: PropTypes.string,
};
