import { ContentState, convertToRaw } from "draft-js";
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

  const handleInitData = (value) => {
    let draftJson = value;
    if (value) {
      try {
        JSON.parse(value);
      } catch {
        // plain text from DB — wrap in Draft.js format so MUIRichTextEditor doesn't crash
        draftJson = JSON.stringify(convertToRaw(ContentState.createFromText(value)));
      }
    }
    setData((prev) => ({ ...prev, default: draftJson }));
  };

  const handleGetValueAndValidate = (label) => {
    const hasValue = data.raw.blocks.reduce(
      (prev, block) => prev + block.text,
      ""
    );
    if (!hasValue) throw new Error(`${label} is required`);

    return data.stringified;
  };

  /** Returns the editor content as plain text (blocks joined by newline). */
  const getPlainText = () => {
    if (!data.raw) return "";
    return data.raw.blocks.map((b) => b.text).join("\n").trim();
  };

  return {
    data,
    handleChange,
    handleGetValueAndValidate,
    handleInitData,
    getPlainText,
  };
};
