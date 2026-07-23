import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Checkbox,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Button } from "../../../components";
import { getExamQuestionBankItem, listExamQuestionBank } from "../../../services";

const TYPE_LABEL = {
  mcq: "MCQ",
  true_false: "True / False",
  essay: "Essay",
  fill_blank: "Fill in the Blank",
  short_answer: "Short Answer",
};

const SelectBankQuestionsModal = ({ isOpen, onClose, onAdd, initialCourseId = "" }) => {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [adding, setAdding] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (initialCourseId) params.courseId = initialCourseId;
      const res = await listExamQuestionBank(params);
      const payload = res?.data ?? res;
      const items = Array.isArray(payload?.questions) ? payload.questions : Array.isArray(payload) ? payload : [];
      setQuestions(items);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [search, initialCourseId]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds([]);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) fetchQuestions();
  }, [isOpen, fetchQuestions]);

  const allSelected = questions.length > 0 && questions.every((q) => selectedIds.includes(q.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !questions.some((q) => q.id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...questions.map((q) => q.id)])));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAdd = async () => {
    if (!selectedIds.length) return;
    setAdding(true);
    try {
      const bankQuestions = await Promise.all(
        selectedIds.map((id) => getExamQuestionBankItem(id).then((res) => res?.data ?? res)),
      );
      onAdd(bankQuestions);
      onClose();
    } catch {
      toast({ title: "Failed to load selected questions", status: "error", duration: 4000, isClosable: true });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={adding ? () => {} : onClose} size="3xl" closeOnOverlayClick={!adding}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Add Questions From The Bank
        </ModalHeader>
        {!adding && <ModalCloseButton />}
        <ModalBody>
          <Flex gap={3} mb={3} flexWrap="wrap">
            <Input
              size="sm"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="240px"
            />
          </Flex>

          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : (
            <Box maxH="360px" overflowY="auto" border="1px solid" borderColor="gray.100" borderRadius="md">
              <Table size="sm" variant="simple">
                <Thead bg="gray.50" position="sticky" top={0}>
                  <Tr>
                    <Th>
                      <Checkbox isChecked={allSelected} onChange={toggleSelectAll} colorScheme="purple" />
                    </Th>
                    <Th>Question</Th>
                    <Th>Type</Th>
                    <Th>Difficulty</Th>
                    <Th>Marks</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((q) => (
                    <Tr key={q.id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => toggleSelect(q.id)}>
                      <Td onClick={(e) => e.stopPropagation()}>
                        <Checkbox isChecked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} colorScheme="purple" />
                      </Td>
                      <Td maxW="360px">
                        <Text fontSize="sm" noOfLines={2}>
                          {q.question}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" variant="subtle">
                          {TYPE_LABEL[q.questionType] || q.questionType}
                        </Badge>
                      </Td>
                      <Td>{q.difficultyLevel}</Td>
                      <Td>{q.marks}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {questions.length === 0 && (
                <Text fontSize="13px" color="gray.400" textAlign="center" py={6}>
                  No questions found in the bank.
                </Text>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter gap="8px">
          <Text fontSize="13px" color="gray.500" mr="auto">
            {selectedIds.length} selected
          </Text>
          <Button secondary onClick={onClose} isDisabled={adding}>
            Cancel
          </Button>
          <Button onClick={handleAdd} isLoading={adding} isDisabled={!selectedIds.length}>
            Add {selectedIds.length || ""} Question{selectedIds.length === 1 ? "" : "s"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelectBankQuestionsModal;
