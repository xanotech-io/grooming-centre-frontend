import PropTypes from "prop-types";
import FormGroup, { FormGroupPropTypes } from "../FormGroup";
import { TimePicker as TimePickerMUI } from "@material-ui/pickers";

export const TimePicker = ({
  error,
  id,
  isRequired,
  label,
  value,
  onChange = () => {},
}) => {
  return (
    <FormGroup
      id={id}
      label={label}
      isRequired={isRequired}
      error={error}
      renderControl={() => (
        <TimePickerMUI
          className="date-time-picker"
          value={value}
          onChange={onChange}
        />
      )}
    />
  );
};

TimePicker.propTypes = {
  ...FormGroupPropTypes,
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
};
