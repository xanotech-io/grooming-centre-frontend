import { Box } from "@chakra-ui/layout";
import { Tag, TagLabel } from "@chakra-ui/tag";
import { useEffect } from "react";
import { Text } from "../../..";
import { getTagInput } from "./hooks/useTagsInput";

const TagsResult = ({ results, onTagSelect, label }) => {
  // ?When this component mount it cause the input to lose fucus
  // Make the input to gain fucus
  useEffect(() => {
    getTagInput().focus();
  }, []);

  const handleEnter = ({ key }, tag) => {
    if (key === "Enter") {
      console.log(tag);
      onTagSelect(tag);
    }
  };

  return (
    <Box
      position="absolute"
      top={label ? "70px" : "38px"}
      left={0}
      // height="100px"
      padding={2}
      width="100%"
      backgroundColor="others.1"
      shadow="lg"
      zIndex={2}
    >
      <Text marginBottom={2}>
        Found <b>{results.length}</b> tags
      </Text>

      {results.map((result) => (
        <Tag
          key={result.id}
          variant="solid"
          colorScheme="gray"
          marginRight={1}
          marginTop={1}
          cursor="pointer"
          tabIndex={0}
          onKeyUp={(e) => handleEnter(e, result)}
          onClick={onTagSelect.bind(null, result)}
        >
          <TagLabel>{result.label}</TagLabel>
        </Tag>
      ))}
    </Box>
  );
};

export default TagsResult;
