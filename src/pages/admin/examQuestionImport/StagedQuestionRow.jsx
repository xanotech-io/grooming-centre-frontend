import React, { useState } from "react";
import {
  Badge,
  Box,
  ButtonGroup,
  Flex,
  Select as ChakraSelect,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { BsCheckCircle } from "react-icons/bs";
import { Button, Input } from "../../../components";
import { denormalizeQuestionType } from "./questionRowUtils";

const QUESTION_TYPES = ["MCQ", "TrueFalse", "FillBlank", "Matching", "ShortAnswer", "Essay"];

const TYPE_LABEL = {
  MCQ: "MCQ",
  TrueFalse: "True / False",
  FillBlank: "Fill in the Blank",
  Matching: "Matching",
  ShortAnswer: "Short Answer",
  Essay: "Essay",
};

const buildOptionsFromEditState = (editState) => {
  const options = [1, 2, 3, 4]
    .filter((num) => editState[`option-${num}`])
    .map((num) => ({
      optionIndex: num,
      name: editState[`option-${num}`],
      isAnswer: `${num}` === editState.answer,
    }));
  return options;
};

// Renders a single staged (pending_review) row using the same field layout as
// the manual "add questions" pages, with inline edit/remove backed by the
// PATCH/DELETE row endpoints.
const StagedQuestionRow = ({ row, index, onSave, onRemove, saving, removing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(() => toEditState(row));

  const startEdit = () => {
    setEditState(toEditState(row));
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    const isObjective = editState.questionType === "MCQ" || editState.questionType === "TrueFalse";
    const patch = {
      questionText: editState.questionText,
      questionType: denormalizeQuestionType(editState.questionType),
      marks: Number(editState.marks) || 1,
      difficultyLevel: editState.difficultyLevel || undefined,
      tags: editState.tagsInput
        ? editState.tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      ...(isObjective && { options: buildOptionsFromEditState(editState) }),
      ...(editState.questionType === "FillBlank" && { correctAnswer: editState.correctAnswer }),
      ...(editState.questionType === "Matching" && { pairs: editState.pairs }),
      ...(editState.questionType === "ShortAnswer" && { modelAnswer: editState.modelAnswer }),
      ...(editState.questionType === "Essay" && { rubric: editState.rubric }),
    };
    await onSave(row.rowId, patch);
    setIsEditing(false);
  };

  const handlePairChange = (idx, side, value) =>
    setEditState((prev) => ({
      ...prev,
      pairs: prev.pairs.map((p, i) => (i === idx ? { ...p, [side]: value } : p)),
    }));
  const addPair = () =>
    setEditState((prev) => ({ ...prev, pairs: [...prev.pairs, { left: "", right: "" }] }));
  const removePair = (idx) =>
    setEditState((prev) => ({ ...prev, pairs: prev.pairs.filter((_, i) => i !== idx) }));

  if (isEditing) {
    return (
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p={5} mb={4}>
        <Text fontSize="12px" fontWeight="700" color="gray.500" mb={3}>
          Row {index + 1}
        </Text>

        <ButtonGroup size="xs" flexWrap="wrap" gap={2} mb={4}>
          {QUESTION_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              onClick={() => setEditState((prev) => ({ ...prev, questionType: type }))}
              leftIcon={editState.questionType === type && <BsCheckCircle />}
              ghost={editState.questionType !== type}
            >
              {TYPE_LABEL[type]}
            </Button>
          ))}
        </ButtonGroup>

        <Textarea
          value={editState.questionText}
          onChange={(e) => setEditState((prev) => ({ ...prev, questionText: e.target.value }))}
          placeholder="Enter your question here"
          mb={4}
          bg="#F7FAFC"
        />

        <Flex gap={4} mb={4} flexWrap="wrap">
          <Box minW="140px">
            <Text fontSize="sm" mb={1} color="gray.600">Marks</Text>
            <Input
              type="number"
              value={editState.marks}
              onChange={(e) => setEditState((prev) => ({ ...prev, marks: e.target.value }))}
            />
          </Box>
          <Box minW="160px">
            <Text fontSize="sm" mb={1} color="gray.600">Difficulty</Text>
            <ChakraSelect
              size="sm"
              value={editState.difficultyLevel}
              onChange={(e) => setEditState((prev) => ({ ...prev, difficultyLevel: e.target.value }))}
              placeholder="Not set"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </ChakraSelect>
          </Box>
          <Box minW="220px" flex={1}>
            <Input
              label="Tags (comma-separated)"
              value={editState.tagsInput}
              onChange={(e) => setEditState((prev) => ({ ...prev, tagsInput: e.target.value }))}
              placeholder="e.g. algorithms, searching"
            />
          </Box>
        </Flex>

        {/* MCQ */}
        {editState.questionType === "MCQ" && (
          <Box mb={4}>
            <Text pb={2} color="gray.500" fontSize="sm">Select the correct answer</Text>
            {[1, 2, 3, 4].map((num) => (
              <Flex key={num} mb={3} alignItems="center" gap={3}>
                <input
                  type="radio"
                  name={`answer-${row.rowId}`}
                  value={`${num}`}
                  checked={editState.answer === `${num}`}
                  onChange={(e) => setEditState((prev) => ({ ...prev, answer: e.target.value }))}
                />
                <Box flex={1}>
                  <Input
                    label={`Option 0${num}`}
                    value={editState[`option-${num}`] || ""}
                    onChange={(e) =>
                      setEditState((prev) => ({ ...prev, [`option-${num}`]: e.target.value }))
                    }
                    placeholder={`Enter option ${num}`}
                  />
                </Box>
              </Flex>
            ))}
          </Box>
        )}

        {/* True/False */}
        {editState.questionType === "TrueFalse" && (
          <Box mb={4}>
            <Text pb={2} color="gray.500" fontSize="sm">Select the correct answer</Text>
            {["True", "False"].map((label, i) => (
              <Flex key={label} mb={3} alignItems="center" gap={3}>
                <input
                  type="radio"
                  name={`answer-${row.rowId}`}
                  value={`${i + 1}`}
                  checked={editState.answer === `${i + 1}`}
                  onChange={(e) => setEditState((prev) => ({ ...prev, answer: e.target.value }))}
                />
                <Text>{label}</Text>
              </Flex>
            ))}
          </Box>
        )}

        {/* FillBlank */}
        {editState.questionType === "FillBlank" && (
          <Box mb={4}>
            <Input
              label="Correct Answer"
              value={editState.correctAnswer}
              onChange={(e) => setEditState((prev) => ({ ...prev, correctAnswer: e.target.value }))}
              placeholder="e.g. Paris"
            />
          </Box>
        )}

        {/* Matching */}
        {editState.questionType === "Matching" && (
          <Box mb={4}>
            {editState.pairs.map((pair, idx) => (
              <Flex key={idx} gap={4} mb={3} alignItems="flex-end">
                <Box flex={1}>
                  <Input
                    label={`Left ${idx + 1}`}
                    value={pair.left}
                    onChange={(e) => handlePairChange(idx, "left", e.target.value)}
                  />
                </Box>
                <Box flex={1}>
                  <Input
                    label={`Right ${idx + 1}`}
                    value={pair.right}
                    onChange={(e) => handlePairChange(idx, "right", e.target.value)}
                  />
                </Box>
                {editState.pairs.length > 1 && (
                  <Button ghost type="button" mb={2} onClick={() => removePair(idx)}>
                    Remove
                  </Button>
                )}
              </Flex>
            ))}
            <Button ghost type="button" onClick={addPair}>
              + Add Pair
            </Button>
          </Box>
        )}

        {/* ShortAnswer */}
        {editState.questionType === "ShortAnswer" && (
          <Box mb={4}>
            <Input
              label="Model Answer"
              value={editState.modelAnswer}
              onChange={(e) => setEditState((prev) => ({ ...prev, modelAnswer: e.target.value }))}
            />
          </Box>
        )}

        {/* Essay */}
        {editState.questionType === "Essay" && (
          <Box mb={4}>
            <Input
              label="Rubric Description"
              value={editState.rubric}
              onChange={(e) => setEditState((prev) => ({ ...prev, rubric: e.target.value }))}
            />
          </Box>
        )}

        <Flex justifyContent="flex-end" gap={3} mt={4}>
          <Button ghost type="button" onClick={cancelEdit} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} isLoading={saving}>
            Save Row
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex
      bg="white"
      border="1px solid #E2E8F0"
      borderRadius="10px"
      p={5}
      mb={4}
      justifyContent="space-between"
      alignItems="flex-start"
      gap={4}
    >
      <Box flex={1}>
        <Flex alignItems="center" gap={2} mb={2}>
          <Text fontSize="12px" fontWeight="700" color="gray.500">Row {index + 1}</Text>
          <Badge bg="#F0E6FF" color="#6b006b" borderRadius="4px" fontSize="10px" textTransform="none">
            {TYPE_LABEL[row.questionType] ?? row.questionType}
          </Badge>
          {row.difficultyLevel && (
            <Badge bg="#F7FAFC" color="gray.500" borderRadius="4px" fontSize="10px" textTransform="none">
              {row.difficultyLevel}
            </Badge>
          )}
          {row.section && (
            <Badge bg="#F0E6FF" color="#6b006b" borderRadius="4px" fontSize="10px" textTransform="none">
              Section: {row.section}
            </Badge>
          )}
          <Badge bg="#F7FAFC" color="gray.500" borderRadius="4px" fontSize="10px" textTransform="none">
            {row.marks} mark{row.marks === 1 ? "" : "s"}
          </Badge>
          {row.mediaReference && (
            <Badge bg="#EBF4FF" color="#3182CE" borderRadius="4px" fontSize="10px" textTransform="none">
              📎 {row.mediaReference}
            </Badge>
          )}
        </Flex>

        <Text color="#1A202C">{row.questionText}</Text>

        {(row.questionType === "MCQ" || row.questionType === "TrueFalse") && (
          <Box mt={3}>
            {row.options.map((opt) => (
              <Flex key={opt.optionIndex} alignItems="center" gap={2} mb={1}>
                <Box
                  boxSize="16px"
                  borderRadius="full"
                  border="2px solid"
                  borderColor={opt.isAnswer ? "#38A169" : "#CBD5E0"}
                  bg={opt.isAnswer ? "#38A169" : "transparent"}
                />
                <Text fontSize="14px" color={opt.isAnswer ? "#276749" : "#4A5568"} fontWeight={opt.isAnswer ? "600" : "400"}>
                  {opt.name}
                </Text>
              </Flex>
            ))}
          </Box>
        )}

        {row.questionType === "FillBlank" && (
          <Text mt={2} fontSize="14px" color="#276749">
            Correct answer: <Text as="span" fontWeight="600">{row.correctAnswer}</Text>
          </Text>
        )}

        {row.questionType === "Matching" && (
          <Box mt={2}>
            {row.pairs.map((pair, i) => (
              <Text key={i} fontSize="14px" color="#4A5568">
                {pair.left} → {pair.right}
              </Text>
            ))}
          </Box>
        )}

        {row.questionType === "ShortAnswer" && row.modelAnswer && (
          <Text mt={2} fontSize="14px" color="gray.500">Model answer: {row.modelAnswer}</Text>
        )}

        {row.questionType === "Essay" && row.rubric && (
          <Text mt={2} fontSize="14px" color="gray.500">Rubric: {row.rubric}</Text>
        )}

        {row.tags.length > 0 && (
          <Flex gap={2} mt={3} flexWrap="wrap">
            {row.tags.map((tag) => (
              <Badge key={tag} bg="#EBF4FF" color="#3182CE" borderRadius="4px" fontSize="10px" textTransform="none">
                {tag}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>

      <Flex gap={2} flexShrink={0}>
        <Button ghost size="sm" type="button" onClick={startEdit}>
          Edit
        </Button>
        <Button
          ghost
          size="sm"
          type="button"
          color="red.500"
          isLoading={removing}
          onClick={() => onRemove(row.rowId)}
        >
          Remove
        </Button>
      </Flex>
    </Flex>
  );
};

const toEditState = (row) => ({
  questionText: row.questionText,
  questionType: row.questionType,
  marks: row.marks,
  difficultyLevel: row.difficultyLevel,
  tagsInput: row.tags.join(", "),
  answer: `${row.options.find((o) => o.isAnswer)?.optionIndex ?? ""}`,
  "option-1": row.options.find((o) => o.optionIndex === 1)?.name ?? "",
  "option-2": row.options.find((o) => o.optionIndex === 2)?.name ?? "",
  "option-3": row.options.find((o) => o.optionIndex === 3)?.name ?? "",
  "option-4": row.options.find((o) => o.optionIndex === 4)?.name ?? "",
  correctAnswer: row.correctAnswer,
  pairs: row.pairs.length ? row.pairs : [{ left: "", right: "" }],
  modelAnswer: row.modelAnswer,
  rubric: row.rubric,
});

export default StagedQuestionRow;
