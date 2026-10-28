import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import { FiChevronDown, FiX } from "react-icons/fi";

// Search-as-you-type picker. `fetchFn(query)` resolves to
// [{ id, label, sublabel? }]; `onSelect` receives the option or null.
export default function EntityCombobox({ fetchFn, value, onSelect, placeholder }) {
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

  useEffect(() => {
    if (!value) setInputValue("");
  }, [value]);

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
        setOptions(await fetchFn(query));
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

  const displayValue = selectedOption
    ? `${selectedOption.label}${selectedOption.sublabel ? ` — ${selectedOption.sublabel}` : ""}`
    : value || inputValue;

  return (
    <Box ref={containerRef} position="relative">
      <Flex
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        alignItems="center"
        px={2}
        bg="white"
        h="32px"
        _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
      >
        <Input
          border="none"
          px={0}
          size="sm"
          h="auto"
          _focus={{ boxShadow: "none" }}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || "Search..."}
          readOnly={!!value}
        />
        {loading && <Spinner size="xs" color="gray.400" mr={1} />}
        {value ? (
          <Box
            as="button"
            type="button"
            onClick={() => {
              onSelect(null);
              setInputValue("");
              setOptions([]);
              setIsOpen(false);
            }}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            ml={1}
            flexShrink={0}
          >
            <FiX size={12} />
          </Box>
        ) : (
          <Box color="gray.400" ml={1} flexShrink={0}>
            <FiChevronDown size={12} />
          </Box>
        )}
      </Flex>

      {isOpen && (
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
              <Text fontSize="12px" color="gray.500">
                Loading...
              </Text>
            </Flex>
          )}
          {!loading && filtered.length === 0 && (
            <Text fontSize="12px" color="gray.500" px={3} py={2}>
              No results found
            </Text>
          )}
          {!loading &&
            filtered.map((opt) => (
              <Box
                key={opt.id}
                px={3}
                py="6px"
                cursor="pointer"
                _hover={{ bg: "blue.50" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(opt);
                  setInputValue("");
                  setIsOpen(false);
                }}
              >
                <Text fontSize="13px" fontWeight="500">
                  {opt.label}
                </Text>
                {opt.sublabel && (
                  <Text fontSize="11px" color="gray.500">
                    {opt.sublabel}
                  </Text>
                )}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
}
