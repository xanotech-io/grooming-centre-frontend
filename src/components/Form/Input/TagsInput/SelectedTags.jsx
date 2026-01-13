import { Flex } from "@chakra-ui/layout";
import { Tag, TagCloseButton, TagLabel } from "@chakra-ui/tag";

export const SelectedTags = ({ tags, onTagDeselect }) => {
  return tags.length ? (
    <Flex flexWrap="wrap">
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          variant="solid"
          colorScheme="gray"
          marginRight={2}
          marginTop={2}
        >
          <TagLabel>{tag.label}</TagLabel>

          {onTagDeselect && (
            <TagCloseButton onClick={onTagDeselect.bind(null, tag)} />
          )}
        </Tag>
      ))}
    </Flex>
  ) : null;
};
