import { useEffect, useState } from "react";
import { Input } from "./Input/Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { Checkbox } from "./Checkbox";
import { getActiveCustomFieldSlots } from "../../services";

// Renders the up-to-2 admin-defined custom fields for `entity` ("course" or
// "user_profile"). Each field is bound to a fixed generic slot
// (customFieldOne/customFieldTwo) — `values`/`onChange` key off that slot
// name, not the admin-chosen fieldName, so relabeling a field never moves
// its stored value.
export const CustomFieldSlots = ({ entity, values, onChange, role = "Admin", isDisabled }) => {
  const [slots, setSlots] = useState([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getActiveCustomFieldSlots(entity)
      .then((res) => {
        if (active) setSlots(res);
      })
      .catch(() => {
        if (active) setSlots([null, null]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [entity]);

  if (loading) return null;

  const editableFields = slots.filter(
    (field) => field && (field.visibility?.edit || []).includes(role)
  );

  return editableFields.map((field) => {
    const value = values?.[field.slot] ?? "";
    const handleChange = (nextValue) => onChange(field.slot, nextValue);
    const common = {
      key: field.slot,
      id: field.slot,
      label: field.fieldName,
      isRequired: field.required,
      isDisabled,
    };

    if (field.fieldType === "textarea") {
      return (
        <Textarea
          {...common}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.helpText}
        />
      );
    }

    if (field.fieldType === "dropdown") {
      return (
        <Select
          {...common}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          options={(field.options || []).map((option) => ({ label: option, value: option }))}
          placeholder="Select..."
        />
      );
    }

    if (field.fieldType === "checkbox") {
      return (
        <Checkbox
          {...common}
          isChecked={!!value}
          onChange={(e) => handleChange(e.target.checked)}
        />
      );
    }

    return (
      <Input
        {...common}
        type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={field.helpText}
      />
    );
  });
};
