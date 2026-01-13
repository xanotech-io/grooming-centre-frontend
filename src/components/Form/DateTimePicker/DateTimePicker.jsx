import PropTypes from "prop-types";
import FormGroup, { FormGroupPropTypes } from "../FormGroup";
import { KeyboardDateTimePicker as DateTimePickerMUI } from "@material-ui/pickers";

export const DateTimePicker = ({
  error,
  id,
  isRequired,
  label,
  value,
  helperText,
  onChange,
  disabled,
  tooltip,
}) => {
  return (
    <FormGroup
      id={id}
      label={label}
      tooltip={tooltip}
      isRequired={isRequired}
      error={error}
      renderControl={() => (
        <DateTimePickerMUI
          className="date-time-picker"
          value={value}
          format="dd/MM/yyyy hh:mm a"
          onChange={onChange}
          helperText={helperText}
          disabled={disabled}
        />
      )}
    />
  );
};

DateTimePicker.propTypes = {
  ...FormGroupPropTypes,
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  onChange: PropTypes.func,
};
