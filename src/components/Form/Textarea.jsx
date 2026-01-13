import PropTypes from "prop-types";
import FormGroup, { FormGroupPropTypes } from "./FormGroup";
import { Textarea as TextareaChakraui } from "@chakra-ui/textarea";
import { forwardRef } from "react";

export const Textarea = forwardRef(
  (
    { error, id, isRequired, label, value, onChange = () => {}, ...rest },
    ref
  ) => {
    return (
      <FormGroup
        id={id}
        label={label}
        isRequired={isRequired}
        error={error}
        renderControl={(props) => (
          <TextareaChakraui
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

Textarea.propTypes = {
  ...FormGroupPropTypes,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
