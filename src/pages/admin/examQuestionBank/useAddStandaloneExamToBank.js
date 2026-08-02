import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { getStandaloneExaminationDetails, createExamQuestionBankItem } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { normalizeQuestionType } from "../examQuestionImport/questionRowUtils";

// This simplified exam form has no Essay/ShortAnswer types, and the bank
// has no "Matching" equivalent, so those are intentionally excluded.
const FORM_TYPE_TO_BANK_TYPE = {
  MCQ: "mcq",
  TrueFalse: "true_false",
  FillBlank: "fill_blank",
};

const DEFAULT_MARKS = 1;

const buildBankPayload = (q) => {
  const bankType = FORM_TYPE_TO_BANK_TYPE[normalizeQuestionType(q.questionType)];
  if (!bankType) return null;

  const opts = (q.options || []).map((o) => ({
    text: o.name ?? o.text ?? o.option ?? "",
    isCorrect: !!o.isAnswer,
  }));

  const payload = {
    question: q.question || "",
    questionType: bankType,
    marks: DEFAULT_MARKS,
    difficultyLevel: capitalizeFirstLetter(q.difficultyLevel ?? q.difficulty_level ?? "medium"),
    status: "draft",
  };

  if (bankType === "mcq") {
    payload.options = opts.filter((o) => o.text);
    payload.correctAnswer = opts.find((o) => o.isCorrect)?.text ?? "";
  } else if (bankType === "true_false") {
    payload.correctAnswer = opts.find((o) => o.isCorrect)?.text ?? q.correctAnswer ?? "";
  } else {
    payload.correctAnswer = q.correctAnswer || "";
  }

  const rawTags = Array.isArray(q.tags)
    ? q.tags
    : q.tags
      ? String(q.tags).split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  if (rawTags.length) payload.tags = rawTags;

  return payload;
};

export const useAddStandaloneExamToBank = () => {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const addStandaloneExamToBank = async ({ examinationId, examinationTitle }) => {
    if (!examinationId || isAdding) return;
    setIsAdding(true);
    try {
      const { examination } = await getStandaloneExaminationDetails(examinationId, true);
      const raw = Array.isArray(examination?.questions) ? examination.questions : [];

      if (!raw.length) {
        console.warn("[useAddStandaloneExamToBank] examination details returned no questions", examination);
        toast({ title: "No questions found for this exam", status: "warning", duration: 4000, isClosable: true });
        return;
      }

      const mapped = raw.map(buildBankPayload).filter(Boolean);
      const skippedCount = raw.length - mapped.length;

      if (!mapped.length) {
        const rawTypes = [...new Set(raw.map((q) => q?.questionType ?? "(none)"))];
        console.warn("[useAddStandaloneExamToBank] all questions skipped as unsupported type", rawTypes, raw);
        toast({
          title: "No supported questions to add to the bank",
          description: `Found ${raw.length} question(s) with type(s): ${rawTypes.join(", ")}.`,
          status: "warning",
          duration: 7000,
          isClosable: true,
        });
        return;
      }

      let successCount = 0;
      let failCount = 0;
      for (let i = 0; i < mapped.length; i += 1) {
        try {
          await createExamQuestionBankItem(mapped[i]);
          successCount += 1;
        } catch (err) {
          console.error("[useAddStandaloneExamToBank] failed to add question to bank", mapped[i], err?.response?.data ?? err);
          failCount += 1;
        }
      }

      toast({
        title: "Copy to Question Bank complete",
        description: `${successCount} of ${mapped.length} question(s) from "${examinationTitle || "Exam"}" added.${failCount ? ` ${failCount} failed.` : ""}${skippedCount ? ` ${skippedCount} skipped (unsupported type).` : ""}`,
        status: failCount ? "warning" : "success",
        duration: 6000,
        isClosable: true,
      });
    } catch (err) {
      console.error("[useAddStandaloneExamToBank] failed to load exam questions", err);
      toast({ title: "Failed to load exam questions", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAdding(false);
    }
  };

  return { addStandaloneExamToBank, isAdding };
};
