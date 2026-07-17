import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
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
  Radio,
  RadioGroup,
  Select,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Button } from "../../../components";
import {
  adminCreateAssessment,
  adminCreateAssessmentQuestion,
  adminCreateExamination,
  adminCreateExaminationQuestion,
  adminCreateStandaloneExamination,
  adminCreateStandaloneExaminationQuestion,
  adminGetCourseListing,
  adminListModules,
  getExamQuestionBankItem,
} from "../../../services";
import { appendFormData, formatDateToISO } from "../../../utils";

const TYPE_TO_EXAM_TYPE = {
  mcq: "MCQ",
  true_false: "TrueFalse",
  essay: "Essay",
  fill_blank: "FillBlank",
  short_answer: "ShortAnswer",
};

const isObjectiveExamType = (examType) => examType === "MCQ" || examType === "TrueFalse";

const buildExamOptions = (bankQuestion, examType, optionKey) => {
  if (examType === "MCQ") {
    return (bankQuestion.options || []).map((o, idx) => ({
      [optionKey]: o.text,
      isAnswer: !!o.isCorrect,
      optionIndex: idx + 1,
    }));
  }
  if (examType === "TrueFalse") {
    return ["True", "False"].map((label, idx) => ({
      [optionKey]: label,
      isAnswer: bankQuestion.correctAnswer === label,
      optionIndex: idx + 1,
    }));
  }
  return [];
};

const buildTypeSpecificFields = (bankQuestion, examType) => {
  if (examType === "FillBlank") return { correctAnswer: bankQuestion.correctAnswer || "" };
  if (examType === "ShortAnswer") return { modelAnswer: bankQuestion.correctAnswer || "" };
  if (examType === "Essay") return { rubricDescription: bankQuestion.explanation || "" };
  return {};
};

const createQuestionForExamination = (bankQuestion, examinationId) => {
  const examType = TYPE_TO_EXAM_TYPE[bankQuestion.questionType] || "Essay";
  const data = {
    examinationId,
    question: bankQuestion.question,
    marks: bankQuestion.marks || 1,
    markingType: "automatic",
    difficultyLevel: (bankQuestion.difficultyLevel || "Medium").toLowerCase(),
    questionType: examType,
    ...(isObjectiveExamType(examType)
      ? { options: JSON.stringify(buildExamOptions(bankQuestion, examType, "name")) }
      : buildTypeSpecificFields(bankQuestion, examType)),
  };
  return adminCreateExaminationQuestion(appendFormData(data));
};

const createQuestionForAssessment = (bankQuestion, assessmentId) => {
  const examType = TYPE_TO_EXAM_TYPE[bankQuestion.questionType] || "Essay";
  const data = {
    assessmentId,
    question: bankQuestion.question,
    markingType: "automatic",
    questionType: examType,
    ...(isObjectiveExamType(examType)
      ? { options: JSON.stringify(buildExamOptions(bankQuestion, examType, "name")) }
      : buildTypeSpecificFields(bankQuestion, examType)),
  };
  return adminCreateAssessmentQuestion(appendFormData(data));
};

const createQuestionForStandalone = (bankQuestion, standAloneExaminationId) => {
  const examType = TYPE_TO_EXAM_TYPE[bankQuestion.questionType] || "Essay";
  const body = {
    standAloneExaminationId,
    question: bankQuestion.question,
    markingType: "automatic",
    questionType: examType,
    marks: bankQuestion.marks || 1,
    ...(isObjectiveExamType(examType)
      ? { options: buildExamOptions(bankQuestion, examType, "option") }
      : buildTypeSpecificFields(bankQuestion, examType)),
  };
  return adminCreateStandaloneExaminationQuestion(body);
};

const CreateExamFromBankModal = ({ isOpen, onClose, selectedIds, onDone }) => {
  const toast = useToast();
  const history = useHistory();

  const [targetType, setTargetType] = useState("examination");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("60");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDuration("60");
    setCourseId("");
    setModuleId("");
    setTargetType("examination");
    setProgress("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    adminGetCourseListing({ limit: 200 })
      .then((res) => setCourses(res?.courses || []))
      .catch(() => setCourses([]));
  }, [isOpen]);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      return;
    }
    adminListModules(courseId)
      .then((res) => setModules(res?.modules || []))
      .catch(() => setModules([]));
  }, [courseId]);

  const needsCourse = targetType === "examination" || targetType === "assessment";

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Exam title is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (needsCourse && !courseId) {
      toast({ title: "Please select a course", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!selectedIds.length) {
      toast({ title: "No questions selected", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setCreating(true);
    try {
      setProgress("Loading selected questions...");
      const bankQuestions = await Promise.all(selectedIds.map((id) => getExamQuestionBankItem(id).then((res) => res?.data ?? res)));

      const startTime = formatDateToISO(new Date(Date.now() + 24 * 60 * 60 * 1000));
      const totalMarks = bankQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

      let newId;
      let navigateTo;

      setProgress("Creating exam...");
      if (targetType === "examination") {
        const { examination } = await adminCreateExamination({
          title: title.trim(),
          duration: Number(duration) || 60,
          amountOfQuestions: selectedIds.length,
          startTime,
          courseId,
          ...(moduleId ? { moduleId } : {}),
          navigationMode: "free",
          randomizationConfig: { question_order: false, option_order: false },
          uiSettings: { theme: "light", font_size: 16, font_family: "default", progress_indicator: true },
        });
        newId = examination.id;
        navigateTo = `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${newId}`;
      } else if (targetType === "assessment") {
        const { assessment } = await adminCreateAssessment({
          title: title.trim(),
          duration: Number(duration) || 60,
          amountOfQuestions: selectedIds.length,
          courseId,
          startTime,
        });
        newId = assessment.id;
        navigateTo = `/admin/courses/${courseId}/assessment/${newId}/questions/new`;
      } else {
        const { examination } = await adminCreateStandaloneExamination({
          title: title.trim(),
          duration: Number(duration) || 60,
          amountOfQuestions: selectedIds.length,
          totalMarks,
          markingMode: "automatic",
          startTime,
        });
        newId = examination.id;
        navigateTo = `/admin/standalone-exams/questions/?examination=${newId}`;
      }

      let successCount = 0;
      let failCount = 0;
      for (let i = 0; i < bankQuestions.length; i += 1) {
        setProgress(`Adding question ${i + 1} of ${bankQuestions.length}...`);
        try {
          if (targetType === "examination") {
            await createQuestionForExamination(bankQuestions[i], newId);
          } else if (targetType === "assessment") {
            await createQuestionForAssessment(bankQuestions[i], newId);
          } else {
            await createQuestionForStandalone(bankQuestions[i], newId);
          }
          successCount += 1;
        } catch {
          failCount += 1;
        }
      }

      toast({
        title: "Exam created",
        description: `${successCount} of ${bankQuestions.length} question(s) added. ${failCount ? `${failCount} failed — you can add them manually.` : "You can now edit before publishing."}`,
        status: failCount ? "warning" : "success",
        duration: 6000,
        isClosable: true,
      });

      onDone?.();
      onClose();
      history.push(navigateTo);
    } catch (err) {
      toast({
        title: err?.response?.data?.message || "Failed to create exam",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
      setProgress("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={creating ? () => {} : onClose} size="lg" closeOnOverlayClick={!creating}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Create New Exam from {selectedIds.length} Question{selectedIds.length !== 1 ? "s" : ""}
        </ModalHeader>
        {!creating && <ModalCloseButton />}
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Exam Type
              </FormLabel>
              <RadioGroup value={targetType} onChange={setTargetType} isDisabled={creating}>
                <Flex gap="16px" wrap="wrap">
                  <Radio value="examination" colorScheme="purple">
                    Course Exam
                  </Radio>
                  <Radio value="assessment" colorScheme="purple">
                    Course Assessment
                  </Radio>
                  <Radio value="standalone" colorScheme="purple">
                    Standalone Exam
                  </Radio>
                </Flex>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Title
              </FormLabel>
              <Input size="sm" borderRadius="6px" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Exam" isDisabled={creating} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Duration (minutes)
              </FormLabel>
              <Input size="sm" borderRadius="6px" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} isDisabled={creating} />
            </FormControl>

            {needsCourse && (
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Course
                </FormLabel>
                <Select
                  size="sm"
                  borderRadius="6px"
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setModuleId("");
                  }}
                  isDisabled={creating}
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {targetType === "examination" && (
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Module (optional)
                </FormLabel>
                <Select size="sm" borderRadius="6px" value={moduleId} onChange={(e) => setModuleId(e.target.value)} isDisabled={creating || !courseId}>
                  <option value="">No module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box bg="#EBF4FF" borderRadius="6px" p="10px">
              <Text fontSize="12px" color="#2B6CB0">
                This copies each selected question's content into the new exam as independent questions. The exam
                is created as a draft — review and finish configuring it in the normal editor before publishing.
              </Text>
            </Box>

            {progress && (
              <Text fontSize="12px" color="gray.500">
                {progress}
              </Text>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button secondary onClick={onClose} isDisabled={creating}>
            Cancel
          </Button>
          <Button isLoading={creating} onClick={handleCreate}>
            Create Exam
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateExamFromBankModal;
