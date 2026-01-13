import { Spinner as SpinnerChakraUi } from "@chakra-ui/spinner";
import PropTypes from "prop-types";

export const Spinner = ({ size = "xl", ...rest }) => {
  return <SpinnerChakraUi size={size} {...rest} />;
};

Spinner.propTypes = {
  size: PropTypes.string,
};
