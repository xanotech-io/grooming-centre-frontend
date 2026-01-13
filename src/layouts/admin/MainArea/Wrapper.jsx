import { Box } from "@chakra-ui/layout";
import PropTypes from "prop-types";

export const AdminMainAreaWrapper = ({ children}) => {
  return (
    <Box>
      {children}
    </Box>
  );
};

AdminMainAreaWrapper.propTypes = {
  children: PropTypes.any,
};
