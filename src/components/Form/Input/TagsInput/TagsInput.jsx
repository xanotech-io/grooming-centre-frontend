import { forwardRef } from "react";
import { Input } from "../Input";
import { Box } from "@chakra-ui/react";
import { useDebounceTyping } from "../../../../hooks";
import { useEffect } from "react";
import useTagsInput from "./hooks/useTagsInput";
import { SelectedTags } from "./SelectedTags";
import TagsResult from "./TagsResult";

const getTagInput = () => {
  const tagsInput = document.querySelector("#tags");
  return tagsInput;
};

export const TagsInput = forwardRef(
  (
    {
      onChange,
      onTagSelect,
      onTagDeselect,
      isCreatingTag,
      selectedTags: propSelectedTags,
      wrapperProps,
      label,
      ...rest
    },
    ref
  ) => {
    const props = {
      onChange,
      onTagSelect,
      onTagDeselect,
      isCreatingTag,
      propSelectedTags,
    };

    const debounce = useDebounceTyping();
    const { selectedTags, handleTagSearch, tagsResult, handleClearResource } =
      useTagsInput(props);

    const handleTagType = (e) => {
      handleClearResource();
      debounce.handleType(e, handleTagSearch);
      onChange?.(e);
    };

    const handleTagSelect = (tag) => {
      onTagSelect(tag);
      handleClearResource();
      getTagInput().value = "";
      getTagInput().focus();
    };

    const inputTagInput = getTagInput();

    useEffect(() => {
      if (!inputTagInput?.value) {
        handleClearResource();
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputTagInput?.value]);

    const handleTagDeselect = (tag) => {
      onTagDeselect(tag);
    };

    return (
      <Box position="relative" {...wrapperProps}>
        <Input
          ref={ref}
          label={label}
          {...rest}
          onChange={handleTagType}
          isLoading={tagsResult.loading || isCreatingTag}
          disabled={isCreatingTag}
        />

        {tagsResult.data && (
          <TagsResult
            results={tagsResult.data}
            onTagSelect={handleTagSelect}
            label={label}
          />
        )}

        <SelectedTags tags={selectedTags} onTagDeselect={handleTagDeselect} />
      </Box>
    );
  }
);
