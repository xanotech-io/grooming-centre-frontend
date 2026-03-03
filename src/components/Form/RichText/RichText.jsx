import PropTypes from "prop-types";
import FormGroup, { FormGroupPropTypes } from "../FormGroup";
import MUIRichTextEditor from "mui-rte";
import { Box } from "@chakra-ui/layout";

export const RichText = ({
  error,
  id,
  isRequired,
  label,
  placeholder = "Start typing from here...",
  defaultValue,
  onChange,
}) => {
  const save = (data) => {
    console.log(data);
  };

  const emojis = [
    {
      keys: ["face", "grin"],
      value: "😀",
      content: "😀",
    },
    {
      keys: ["face", "joy"],
      value: "😂",
      content: "😂",
    },
    {
      keys: ["face", "sweat"],
      value: "😅",
      content: "😅",
    },
  ];

  // enforce custom style to the RichText component
  const input = document.querySelector(".rich-text #mui-rte-container")
    ?.children[1];
  const imp = document.querySelector(".rich-text #mui-rte-container")
    ?.children[2];
  if (input)
    input.style = `
        position: unset;
        padding: 0 5px !important;
        min-height: 200px !important;
        border: 1px solid var(--accent-1) !important;
        border-radius: 2px !important;
      `;
  if (imp) imp.style = "";
  // END-OF enforce custom style to the RichText component

  // Remove some toolbar options
  const toolbar = document.querySelector(".rich-text #mui-rte-toolbar");
  if (toolbar) {
    toolbar.children[0].style.display = "none";
    toolbar.children[9].style.display = "none";
    toolbar.children[toolbar.children.length - 1].style.display = "none";
    toolbar.children[toolbar.children.length - 2].style.display = "none";
  }

  return (
    <FormGroup
      id={id}
      label={label}
      isRequired={isRequired}
      error={error}
      renderControl={(props) => (
        <Box
          border="1px"
          {...props}
          minHeight="280px"
          paddingX={2}
          paddingBottom={2}
          className="rich-text"
        >
          <MUIRichTextEditor
            onSave={save}
            maxLength={"auto"}
            label={placeholder}
            autocomplete={{
              strategies: [
                {
                  items: emojis,
                  triggerChar: ":",
                },
              ],
            }}
            draftEditorProps={{ spellCheck: true }}
            onChange={onChange}
            defaultValue={defaultValue}
          />
        </Box>
      )}
    />
  );
};

RichText.propTypes = {
  ...FormGroupPropTypes,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
};
