/**
 * Loops through the `data` and appends to the `formData`
 *
 * @param {object} data
 *
 * @returns { FormData }
 */
export const appendFormData = (data) => {
  const formData = new FormData();

  for (const fieldKey in data) {
    if (Object.hasOwnProperty.call(data, fieldKey)) {
      const fieldValue = data[fieldKey];

      if (fieldValue) {
        formData.append(fieldKey, fieldValue);
      }
    }
  }

  return formData;
};
