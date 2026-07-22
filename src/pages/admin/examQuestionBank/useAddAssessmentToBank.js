import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { requestAssessmentDetails, createExamQuestionBankItem } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { normalizeQuestionType } from "../examQuestionImport/questionRowUtils";

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
  const bankType = FORM_TYPE_TO_BANK_TYPE[normalizeQuestionType(q.questionType)];
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

export const useAddAssessmentToBank = () => {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const addAssessmentToBank = async ({ assessmentId, courseId, assessmentTitle }) => {
    if (!assessmentId || isAdding) return;
    setIsAdding(true);
    try {
      const { assessment } = await requestAssessmentDetails(assessmentId, true);
      const raw = Array.isArray(assessment?.questions) ? assessment.questions : [];

      if (!raw.length) {
        console.warn("[useAddAssessmentToBank] assessment details returned no questions", assessment);
        toast({ title: "No questions found for this assessment", status: "warning", duration: 4000, isClosable: true });
        return;
      }

      const mapped = raw.map(buildBankPayload).filter(Boolean);
      const skippedCount = raw.length - mapped.length;

      if (!mapped.length) {
        const rawTypes = [...new Set(raw.map((q) => q?.questionType ?? "(none)"))];
        console.warn("[useAddAssessmentToBank] all questions skipped as unsupported type", rawTypes, raw);
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
        const payload = { ...mapped[i], ...(courseId ? { courseId } : {}) };
        try {
          await createExamQuestionBankItem(payload);
          successCount += 1;
        } catch (err) {
          console.error("[useAddAssessmentToBank] failed to add question to bank", payload, err?.response?.data ?? err);
          failCount += 1;
        }
      }

      toast({
        title: "Copy to Question Bank complete",
        description: `${successCount} of ${mapped.length} question(s) from "${assessmentTitle || "Assessment"}" added.${failCount ? ` ${failCount} failed.` : ""}${skippedCount ? ` ${skippedCount} skipped (unsupported type).` : ""}`,
        status: failCount ? "warning" : "success",
        duration: 6000,
        isClosable: true,
      });
    } catch (err) {
      console.error("[useAddAssessmentToBank] failed to load assessment questions", err);
      toast({ title: "Failed to load assessment questions", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAdding(false);
    }
  };

  return { addAssessmentToBank, isAdding };
};
