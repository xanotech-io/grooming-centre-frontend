import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Input, Spinner } from "@chakra-ui/react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { Text } from "..";

// Generic searchable dropdown backed by a debounced remote fetch.
// fetchFn: (query: string) => Promise<[{ id, label, sublabel? }]>
// value: selected id or ""
// onSelect: (opt | null) => void
export const EntityCombobox = ({ fetchFn, value, onSelect, placeholder, isDisabled }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!inputValue || selectedOption) return options;
    const q = inputValue.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel ?? "").toLowerCase().includes(q),
    );
  }, [options, inputValue, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doFetch = useCallback(
    async (query) => {
      setLoading(true);
      try {
        const results = await fetchFn(query);
        setOptions(results);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn],
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (value) onSelect(null);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(val), 350);
  };

  const handleFocus = () => {
    if (!value) {
      setIsOpen(true);
      if (options.length === 0) doFetch("");
    }
  };

  const handleSelect = (opt) => {
    onSelect(opt);
    setInputValue("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const displayValue = selectedOption
    ? `${selectedOption.label}${selectedOption.sublabel ? ` — ${selectedOption.sublabel}` : ""}`
    : value || inputValue;

  return (
    <Box ref={containerRef} position="relative">
      <Flex
        border="1px solid"
        borderColor={isDisabled ? "gray.200" : "inherit"}
        borderRadius="md"
        alignItems="center"
        px={3}
        bg={isDisabled ? "gray.100" : "white"}
        _focusWithin={
          isDisabled
            ? {}
            : { borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }
        }
      >
        <Input
          border="none"
          px={0}
          _focus={{ boxShadow: "none" }}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || "Search..."}
          readOnly={!!value || isDisabled}
          disabled={isDisabled}
          cursor={isDisabled ? "not-allowed" : "text"}
          fontSize="14px"
          size="sm"
        />
        {loading && <Spinner size="xs" color="gray.400" mr={1} />}
        {!isDisabled && value ? (
          <Box
            as="button"
            type="button"
            onClick={handleClear}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={14} />
          </Box>
        ) : (
          !isDisabled && (
            <Box color="gray.400" ml={1} flexShrink={0}>
              <FiChevronDown size={14} />
            </Box>
          )
        )}
      </Flex>

      {isOpen && !isDisabled && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="md"
          boxShadow="md"
          zIndex={1500}
          maxH="220px"
          overflowY="auto"
        >
          {loading && (
            <Flex alignItems="center" gap={2} px={3} py={2}>
              <Spinner size="xs" />
              <Text fontSize="13px" color="gray.500">Loading...</Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="13px" color="gray.500" px={3} py={2}>
              No results found
            </Text>
          )}
          {!loading &&
            filtered.map((opt) => (
              <Box
                key={opt.id}
                px={3}
                py="8px"
                cursor="pointer"
                _hover={{ bg: "#EBF8FF" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
              >
                <Text fontSize="14px" fontWeight="500">{opt.label}</Text>
                {opt.sublabel && (
                  <Text fontSize="12px" color="gray.500">{opt.sublabel}</Text>
                )}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default EntityCombobox;
