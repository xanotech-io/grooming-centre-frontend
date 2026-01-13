import { convertToRaw } from "draft-js";
import { useState } from "react";

export const useRichText = () => {
  const [data, setData] = useState({
    stringified: null,
    raw: null,
    default: null,
  });

  const handleChange = (value) => {
    const raw = convertToRaw(value.getCurrentContent());
    const stringified = JSON.stringify(raw);

    console.log(stringified);

    setData((prev) => ({ ...prev, stringified, raw }));
  };

  const handleInitData = (stringified) => {
    setData((prev) => ({ ...prev, default: stringified }));
  };

  const handleGetValueAndValidate = (label) => {
    const hasValue = data.raw.blocks.reduce(
      (prev, block) => prev + block.text,
      ""
    );
    if (!hasValue) throw new Error(`${label} is required`);

    return data.stringified;
  };

  return {
    data,
    handleChange,
    handleGetValueAndValidate,
    handleInitData,
  };
};
