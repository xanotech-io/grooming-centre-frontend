import { useState } from 'react';

export const useDateTimePicker = (initDate = 'Invalid Date') => {
  const [value, setValue] = useState(new Date(initDate));

  const handleChange = (value) => setValue(value);

  const handleGetValueAndValidate = (label) => {
    if (!value || /invalid/i.test(value))
      throw new Error(`${label} is required`);

    return value;
  };

  return { value, handleChange, handleGetValueAndValidate };
};
