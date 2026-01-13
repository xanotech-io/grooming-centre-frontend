import { ButtonGroup } from "@chakra-ui/button";
import { Box, Flex, HStack, Stack } from "@chakra-ui/layout";
import { Tag, TagCloseButton, TagLabel } from "@chakra-ui/tag";
import { useEffect } from "react";
import { useState } from "react";
import { AiOutlineClose, AiOutlineDown } from "react-icons/ai";
import { Button, Checkbox, SearchBar, Text } from "../..";

const Header = ({
  filterControls,
  SearchBarVisibility,
  placeholder,
  setParams,
  setCanFilter,
}) => {
  const [tags, setTags] = useState({});

  const [searchQuery, setSearchQuery] = useState(null);

  useEffect(() => {
    const tagsKeys = Reflect.ownKeys(tags);

    if (tagsKeys.length || searchQuery !== null) {
      let params = {
        ...(searchQuery ? { search: searchQuery } : {}),
      };

      tagsKeys.forEach((key) => {
        if (tags[key].length) {
          const p = tags[key].reduce(
            (acc, tag, index) => ({
              [key]: `${acc[key]}${index ? "," : ""}${tag.queryValue}`,
            }),
            { [key]: "" }
          );

          const additionalParams = tags[key].reduce(
            (acc, tag) => ({
              ...acc,
              ...(tag.additionalParams ? tag.additionalParams : {}),
            }),
            {}
          );

          params = {
            ...params,
            ...p,
            ...additionalParams,
          };
        }
      });

      setParams((prevParams) => {
        // Clean up deleted params
        for (let key in prevParams) {
          if (!params[key] && key !== "length" && key !== "page")
            Reflect.deleteProperty(prevParams, key);
        }

        return { ...prevParams, ...params };
      });
      setCanFilter(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags, searchQuery]);

  // Manually clear Search from QueryParams sent to the server
  useEffect(() => {
    if (searchQuery === "") {
      setParams((params) => {
        Reflect.deleteProperty(params, "search");
        return params;
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Flex
      as="header"
      flexWrap="wrap"
      rowGap={4}
      alignItems={{ lg: "center", sm: "flex-start", md: "flex-start" }}
      flexDirection={{ lg: "row", md: "column", sm: "column", base: "column" }}
      justifyContent={{
        lg: "space-between",
        sm: "flex-start",
        md: "flex-start",
      }}
      display={SearchBarVisibility}
    >
      <SearchBar
        placeholder={placeholder}
        width="375px"
        sm
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />
      {filterControls && (
        <FilterButtonsGroup
          data={filterControls}
          tags={tags}
          setTags={setTags}
        />
      )}
    </Flex>
  );
};

const FilterButtonsGroup = ({ data, tags, setTags }) => {
  const handleApplyFilter = (filterKey, filters) => {
    setTags((prev) => ({
      ...prev,
      [filterKey]: filters,
    }));
  };

  const handleTagDelete = (tagSection, tagText) => {
    const newTags = {
      ...tags,
      [tagSection]: tags[tagSection].filter((tag) => tag.text !== tagText),
    };
    setTags(newTags);
  };

  const renderTags = () => {
    const tagSections = data
      .filter((item) => !item.noFilterTags)
      .reduce((prev, curr) => {
        const tagSection = { name: curr.queryKey };
        prev.push(tagSection);

        return prev;
      }, []);

    return tagSections.map((tagSection, index) =>
      tags[tagSection.name]?.length ? (
        <Box
          key={tagSection.name}
          // data-testid={`${tagSection.name}-tag-section`}
          borderLeft={index && "1px"}
          borderColor="accent.2"
          marginLeft={1}
          paddingLeft={1}
        >
          {tags[tagSection.name]?.map((tag) => (
            <Tag
              marginX={1}
              data-testid="filter-tag"
              size="md"
              key={tag.text}
              borderRadius="full"
              variant="solid"
            >
              <TagLabel>{tag.text}</TagLabel>
              <TagCloseButton
                onClick={handleTagDelete.bind(null, tagSection.name, tag.text)}
              />
            </Tag>
          ))}
        </Box>
      ) : null
    );
  };

  const renderButtons = () =>
    data.map((filterControl) => (
      <FilterButton
        key={filterControl.queryKey}
        data={filterControl}
        onApplyFilter={handleApplyFilter}
        tags={tags}
      />
    ));

  return (
    <>
      <ButtonGroup data-testid="filter-button-group">
        {renderButtons()}
      </ButtonGroup>

      <Flex minWidth="100%" justifyContent="flex-end" marginTop={2}>
        {renderTags()}
      </Flex>
    </>
  );
};

const FilterButton = ({ children, data, tags, onApplyFilter, ...rest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const renderContent = () => (
    <Box data-testid="filter-body">
      {children || (
        <FilterBody
          data={data}
          onClose={handleClose}
          onApplyFilter={onApplyFilter}
          tags={tags[data.queryKey]}
        />
      )}
    </Box>
  );

  const getButtonText = () => {
    if (!data.noFilterTags) {
      return data.triggerText;
    }

    const text = tags[data.queryKey]?.[0]?.text;

    console.log(text);

    return text ? `${data.triggerText}: ${text}` : data.triggerText;
  };

  return (
    <Box position="relative">
      <Button
        data-testid={`filter-control, ${data.queryKey}`}
        onClick={handleOpen}
        secondary
        sm
        backgroundColor="white"
        color="accent.3"
        rightIcon={data.triggerIcon || <AiOutlineDown />}
        {...rest}
      >
        {getButtonText()}
      </Button>

      {isOpen && renderContent()}
    </Box>
  );
};

export const FilterBody = ({ data, tags = [], onClose, onApplyFilter }) => {
  const [selectedChecks, setSelectedChecks] = useState(tags);

  const handleCheckboxChange = ({ target: { name, id, checked } }) => {
    let allSelected = [...selectedChecks];

    if (checked) {
      allSelected.push({ text: name, queryValue: id });
    } else {
      const index = allSelected.findIndex((selected) => selected.text === name);

      if (index !== -1) {
        allSelected.splice(index, 1);
      }
    }

    setSelectedChecks(allSelected);
  };

  const handleApply = () => {
    onClose();
    onApplyFilter(data.queryKey, selectedChecks);
  };

  const handleRadioApply = (text, queryValue, additionalParams) => {
    onClose();
    onApplyFilter(data.queryKey, [{ text, queryValue, additionalParams }]);
  };

  const handleClearAll = () => {
    const selectedChecks = [];
    setSelectedChecks(selectedChecks);

    onApplyFilter(data.queryKey, selectedChecks);
    onClose();
  };

  return (
    <>
      <Box
        data-testid="filter-overlay"
        backgroundColor="black"
        opacity={0.2}
        position="fixed"
        width="100%"
        height="100%"
        top={0}
        left={0}
        zIndex={1}
        onClick={onClose}
      ></Box>
      <Box
        backgroundColor="white"
        position="absolute"
        zIndex={1}
        width={data.width}
        top="calc(100% + 5px)"
        right={data.position === "right-bottom" ? 0 : undefined}
        rounded="4px"
        border="1px"
        borderColor="accent.3"
        shadow="md"
      >
        <form>
          {data.body.checks && (
            <Stack padding={2}>
              {data.body.checks.map((check, index) => (
                <Checkbox
                  key={index}
                  label={check.label}
                  name={check.label}
                  id={check.queryValue}
                  defaultChecked={selectedChecks.find(
                    (selected) => check.label === selected.text
                  )}
                  onChange={handleCheckboxChange}
                />
              ))}
            </Stack>
          )}

          {data.body.radios && (
            <>
              <Flex justifyContent="flex-end">
                <Button
                  ghost
                  xs
                  fontSize="heading.h4"
                  onClick={onClose}
                  data-testid="close"
                >
                  <AiOutlineClose />
                </Button>
              </Flex>

              <Stack paddingBottom={3}>
                {data.body.radios.map((radio, index) => (
                  <Box
                    key={index}
                    tabIndex={0}
                    role="button"
                    data-testid="radio"
                    cursor="pointer"
                    _hover={{ backgroundColor: "accent.1" }}
                    paddingY={1}
                    paddingX={2}
                    onClick={handleRadioApply.bind(
                      null,
                      radio.label,
                      radio.queryValue,
                      radio.additionalParams
                    )}
                  >
                    <Text>{radio.label}</Text>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          {!data.body.radios && data.body.checks && (
            <HStack
              as="footer"
              justifyContent="space-between"
              borderTop="1px"
              borderColor="accent.2"
              padding={2}
            >
              <Button ghost xs onClick={handleClearAll}>
                Clear all
              </Button>

              <Button xs onClick={handleApply}>
                Apply
              </Button>
            </HStack>
          )}
        </form>
      </Box>
    </>
  );
};

export default Header;
