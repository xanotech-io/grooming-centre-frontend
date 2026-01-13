import PropTypes from "prop-types";
import FormGroup, { FormGroupPropTypes } from "./FormGroup";
import { Select as SelectChakraui } from "@chakra-ui/select";
import { forwardRef } from "react";

export const Select = forwardRef(
  (
    {
      error,
      id,
      isRequired,
      isLoading,
      label,
      options = [],
      value,
      placeholder,
      onChange = () => {},
      group,
      noEmptyOption,
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
          <SelectChakraui
            value={value}
            onChange={onChange}
            ref={ref}
            {...props}
            {...rest}
          >
            {!noEmptyOption && (
              <option color="accent.3" value="">
                {placeholder}
              </option>
            )}

            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectChakraui>
        )}
        rest={group}
      />
    );
  }
);

Select.propTypes = {
  ...FormGroupPropTypes,
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
  ),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  noEmptyOption: PropTypes.bool,
};
