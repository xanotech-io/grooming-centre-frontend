import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, Input, Text } from "@chakra-ui/react";

// Generic search-as-you-type combobox: fetchOptions(query) resolves to
// [{ id, label, sub? }]; onSelect(id, label) fires on pick / onSelect("", "") on clear.
export const SearchableSelect = ({
  placeholder,
  fetchOptions,
  onSelect,
  selectedLabel,
  isInvalid,
  isDisabled,
  size = "sm",
}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doFetch = useCallback(
    async (q) => {
      setLoading(true);
      try {
        setOptions(await fetchOptions(q));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions],
  );

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => doFetch(query), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, open, doFetch]);

  const handleSelect = (opt) => {
    onSelect(opt.id, opt.label);
    setQuery("");
    setOptions([]);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect("", "");
    setQuery("");
    setOptions([]);
  };

  return (
    <Box ref={containerRef} position="relative">
      {selectedLabel ? (
        <Flex
          align="center"
          justify="space-between"
          border="1px solid"
          borderColor={isInvalid ? "red.500" : "#E2E8F0"}
          borderRadius="6px"
          px="10px"
          h={size === "sm" ? "32px" : "40px"}
          bg={isDisabled ? "gray.50" : "white"}
          fontSize="13px"
        >
          <Text fontSize="13px" color="gray.800" isTruncated>
            {selectedLabel}
          </Text>
          {!isDisabled && (
            <Text
              fontSize="12px"
              color="gray.400"
              cursor="pointer"
              ml="8px"
              _hover={{ color: "gray.700" }}
              onClick={handleClear}
              flexShrink={0}
            >
              ✕
            </Text>
          )}
        </Flex>
      ) : (
        <Input
          size={size}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          isDisabled={isDisabled}
          borderColor={isInvalid ? "red.500" : undefined}
          borderRadius="6px"
          autoComplete="off"
        />
      )}
      {open && !isDisabled && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={999}
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="6px"
          boxShadow="md"
          maxH="200px"
          overflowY="auto"
          mt="2px"
        >
          {loading ? (
            <Box px="12px" py="8px">
              <Text fontSize="13px" color="gray.400">Searching…</Text>
            </Box>
          ) : options.length === 0 ? (
            <Box px="12px" py="8px">
              <Text fontSize="13px" color="gray.400">No results found.</Text>
            </Box>
          ) : (
            options.map((opt) => (
              <Box
                key={opt.id}
                px="12px"
                py="8px"
                cursor="pointer"
                _hover={{ bg: "#F7FAFC" }}
                onMouseDown={() => handleSelect(opt)}
              >
                <Text fontSize="13px">{opt.label}</Text>
                {opt.sub && (
                  <Text fontSize="11px" color="gray.400">{opt.sub}</Text>
                )}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchableSelect;
