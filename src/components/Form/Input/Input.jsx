import PropTypes from "prop-types";
import FormGroup, { FormGroupPropTypes } from "../FormGroup";
import { Input as InputChakraui } from "@chakra-ui/input";
import { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      error,
      id,
      isRequired,
      isLoading,
      label,
      value,
      onChange = () => {},
      ...rest
    },
    ref
  ) => {
    return (
      <FormGroup
        id={id}
        label={label}
        isRequired={isRequired}
        isLoading={isLoading}
        error={error}
        renderControl={(props) => (
          <InputChakraui
            _focus={{
              borderColor: "secondary.1",
            }}
            display="block"
            width={{lg:"100%", base:"100%", md:"100%"}}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
            {...rest}
          />
        )}
      />
    );
  }
);

export const InputPropTypes = {
  ...FormGroupPropTypes,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

Input.propTypes = InputPropTypes;
