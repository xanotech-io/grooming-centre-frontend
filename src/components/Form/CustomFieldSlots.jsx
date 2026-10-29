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
      .catch((error) => {
        console.warn(`[CustomFieldSlots] failed to load ${entity} custom fields`, error);
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

  // Admins define these fields, so admin forms always show them; other roles
  // follow the field's "who can edit" setting.
  const editableFields = slots.filter(
    (field) => field && (role === "Admin" || (field.visibility?.edit || []).includes(role))
  );

  return editableFields.map((field) => (
    <CustomFieldInput
      key={field.slot}
      id={field.slot}
      field={field}
      value={values?.[field.slot]}
      onChange={(nextValue) => onChange(field.slot, nextValue)}
      isDisabled={isDisabled}
    />
  ));
};

// One input for a custom field definition, picked by its fieldType.
export const CustomFieldInput = ({ id, field, value = "", onChange, isDisabled }) => {
  const common = {
    id,
    label: field.fieldName,
    isRequired: field.required,
    isDisabled,
  };

  if (field.fieldType === "textarea") {
    return (
      <Textarea
        {...common}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.helpText}
      />
    );
  }

  if (field.fieldType === "dropdown") {
    return (
      <Select
        {...common}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={(field.options || []).map((option) => ({ label: option, value: option }))}
        placeholder="Select..."
      />
    );
  }

  if (field.fieldType === "checkbox") {
    return (
      <Checkbox
        {...common}
        isChecked={value === true || value === "true"}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }

  return (
    <Input
      {...common}
      type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.helpText}
    />
  );
};
