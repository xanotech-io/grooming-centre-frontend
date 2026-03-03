import PropTypes from "prop-types";
import { Checkbox as CheckboxChakraui } from "@chakra-ui/checkbox";
import { forwardRef } from "react";

export const Checkbox = forwardRef(({ id, label, isChecked, ...rest }, ref) => {
  return (
    <CheckboxChakraui
      colorScheme="blackAlpha"
      iconColor="primary.base"
      id={id}
      isChecked={isChecked}
      ref={ref}
      {...rest}
    >
      {label}
    </CheckboxChakraui>
  );
});

Checkbox.propTypes = {
  id: PropTypes.string,
  isChecked: PropTypes.bool,
};
