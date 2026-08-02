import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
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
import { adminGetCourseListing, adminListModules } from "../../../services";
import useAssessmentStore from "../../../store/assessmentStore";

const UseBankQuestionModal = ({ isOpen, onClose, questionIds = [], initialCourseId = "", onContinue }) => {
  const toast = useToast();
  const history = useHistory();
  const setFromBankQuestionIds = useAssessmentStore((s) => s.setFromBankQuestionIds);

  const [targetType, setTargetType] = useState("assessment");
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTargetType("assessment");
    setCourseId(initialCourseId || "");
    setModuleId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    adminGetCourseListing({ limit: 200 })
      .then((res) => setCourses(res?.courses || []))
      .catch(() => setCourses([]));
  }, [isOpen]);

  // Course Exam always lives under a module — its create/edit page requires
  // one in its route.
  useEffect(() => {
    if (!courseId || targetType !== "examination") {
      setModules([]);
      return;
    }
    adminListModules(courseId)
      .then((res) => setModules(res?.modules || []))
      .catch(() => setModules([]));
  }, [courseId, targetType]);

  const needsCourse = targetType !== "standalone";
  const needsModule = targetType === "examination";

  const handleContinue = () => {
    if (needsCourse && !courseId) {
      toast({ title: "Please select a course", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (needsModule && !moduleId) {
      toast({ title: "Please select a module", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setFromBankQuestionIds(questionIds);
    onContinue?.();

    if (targetType === "standalone") {
      history.push("/admin/standalone-exams/overview");
    } else if (targetType === "examination") {
      history.push(`/admin/courses/${courseId}/module/${moduleId}/examinations/edit/new`);
    } else {
      history.push(`/admin/courses/${courseId}/assessment/new/overview`);
    }
    onClose();
  };

  const count = questionIds.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Use {count > 1 ? `These ${count} Questions` : "This Question"} In A New Exam
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Exam Type
              </FormLabel>
              <RadioGroup value={targetType} onChange={setTargetType}>
                <Flex gap="16px" wrap="wrap">
                  <Radio value="assessment" colorScheme="purple">
                    Course Assessment
                  </Radio>
                  <Radio value="examination" colorScheme="purple">
                    Course Exam
                  </Radio>
                  <Radio value="standalone" colorScheme="purple">
                    Standalone Exam
                  </Radio>
                </Flex>
              </RadioGroup>
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

            {needsModule && (
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                  Module
                </FormLabel>
                <Select
                  size="sm"
                  borderRadius="6px"
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  isDisabled={!courseId}
                >
                  <option value="">Select a module</option>
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
                You'll fill in the exam's details next, then {count > 1 ? "these questions will" : "this question will"}{" "}
                already be loaded into the question step — review and edit before submitting for approval.
              </Text>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button secondary onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UseBankQuestionModal;
