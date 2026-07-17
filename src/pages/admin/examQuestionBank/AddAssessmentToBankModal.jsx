import React, { useEffect, useState } from "react";
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Button } from "../../../components";
import { requestAssessmentDetails, createExamQuestionBankItem } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";

// Mirrors the type mapping used elsewhere for course exam questions —
// "Matching" has no bank equivalent and is skipped. requestAssessmentDetails
// already infers questionType (MCQ/TrueFalse/ShortAnswer) when the raw data omits it.
const FORM_TYPE_TO_BANK_TYPE = {
  MCQ: "mcq",
  TrueFalse: "true_false",
  Essay: "essay",
  FillBlank: "fill_blank",
  ShortAnswer: "short_answer",
};

const buildBankPayload = (q) => {
  const bankType = FORM_TYPE_TO_BANK_TYPE[q.questionType];
  if (!bankType) return null;

  const opts = (q.options || []).map((o) => ({
    text: o.name ?? o.text ?? o.option ?? "",
    isCorrect: !!(o.isAnswer ?? o.isCorrect),
  }));

  const payload = {
    question: q.question || "",
    questionType: bankType,
    marks: q.marks || 1,
    difficultyLevel: capitalizeFirstLetter(q.difficultyLevel || "medium"),
    status: "draft",
  };

  if (bankType === "mcq") {
    payload.options = opts.filter((o) => o.text);
    payload.correctAnswer = opts.find((o) => o.isCorrect)?.text ?? "";
  } else if (bankType === "true_false") {
    payload.correctAnswer = opts.find((o) => o.isCorrect)?.text ?? q.correctAnswer ?? "";
  } else {
    payload.correctAnswer = q.correctAnswer || q.modelAnswer || "";
  }
  if (bankType === "essay" && q.rubricDescription) payload.explanation = q.rubricDescription;

  return payload;
};

const AddAssessmentToBankModal = ({ isOpen, onClose, assessmentId, courseId, assessmentTitle }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (!isOpen || !assessmentId) return;
    setCategory("");
    setTags("");
    setProgress("");
    setLoading(true);
    requestAssessmentDetails(assessmentId, true)
      .then(({ assessment }) => {
        const raw = Array.isArray(assessment?.questions) ? assessment.questions : [];
        const mapped = raw.map(buildBankPayload).filter(Boolean);
        setQuestions(mapped);
        setSkippedCount(raw.length - mapped.length);
      })
      .catch((err) => {
        console.error("[AddAssessmentToBankModal] failed to load assessment questions", err);
        setQuestions([]);
        toast({ title: "Failed to load assessment questions", status: "error", duration: 3000, isClosable: true });
      })
      .finally(() => setLoading(false));
  }, [isOpen, assessmentId, toast]);

  const handleCopy = async () => {
    if (!questions.length) return;
    setSaving(true);
    const trimmedCategory = category.trim();
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    let successCount = 0;
    let failCount = 0;
    for (let i = 0; i < questions.length; i += 1) {
      setProgress(`Adding question ${i + 1} of ${questions.length}...`);
      const payload = {
        ...questions[i],
        ...(trimmedCategory ? { category: trimmedCategory } : {}),
        ...(tagList.length ? { tags: tagList } : {}),
        ...(courseId ? { courseId } : {}),
      };
      try {
        await createExamQuestionBankItem(payload);
        successCount += 1;
      } catch (err) {
        console.error("[AddAssessmentToBankModal] failed to add question to bank", payload, err?.response?.data ?? err);
        failCount += 1;
      }
    }
    toast({
      title: "Copy to Question Bank complete",
      description: `${successCount} of ${questions.length} question(s) added.${failCount ? ` ${failCount} failed.` : ""}${skippedCount ? ` ${skippedCount} skipped (unsupported type).` : ""}`,
      status: failCount ? "warning" : "success",
      duration: 6000,
      isClosable: true,
    });
    setSaving(false);
    setProgress("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} size="lg" closeOnOverlayClick={!saving}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Add "{assessmentTitle || "Assessment"}" to Question Bank
        </ModalHeader>
        {!saving && <ModalCloseButton />}
        <ModalBody>
          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : (
            <Flex direction="column" gap="14px">
              <Text fontSize="13px" color="gray.500">
                {questions.length} question{questions.length !== 1 ? "s" : ""} will be copied to the bank.
                {skippedCount > 0 && ` ${skippedCount} skipped (unsupported type).`}
              </Text>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Category (optional, applied to all)
                </FormLabel>
                <Input size="sm" borderRadius="6px" placeholder="e.g. Biology" value={category} onChange={(e) => setCategory(e.target.value)} isDisabled={saving} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Tags (comma-separated, optional, applied to all)
                </FormLabel>
                <Input size="sm" borderRadius="6px" placeholder="cells, biology" value={tags} onChange={(e) => setTags(e.target.value)} isDisabled={saving} />
              </FormControl>
              {progress && (
                <Text fontSize="12px" color="gray.500">
                  {progress}
                </Text>
              )}
            </Flex>
          )}
        </ModalBody>
        <ModalFooter gap="8px">
          <Button secondary onClick={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button isLoading={saving} isDisabled={loading || !questions.length} onClick={handleCopy}>
            Copy {questions.length || ""} Question{questions.length !== 1 ? "s" : ""} to Bank
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddAssessmentToBankModal;
