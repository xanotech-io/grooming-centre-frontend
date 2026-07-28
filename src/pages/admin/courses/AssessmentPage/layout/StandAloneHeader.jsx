/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { Box, Flex, Text, Heading } from "@chakra-ui/layout";
import { NavLink, useHistory, useParams, useLocation } from "react-router-dom";
import { Button } from "../../../../../components";
import { useQueryParams } from "../../../../../hooks";
import {
  adminEditStandaloneExamination,
  adminGetAllStandaloneExaminationDetails,
} from "../../../../../services";
import useAssessmentPreview from "../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import { utils, writeFile } from "xlsx";
import { FaArrowLeft } from "react-icons/fa";
import useAssessmentStore from "../../../../../store/assessmentStore";

const StandAloneHeader = () => {
  const { id } = useParams();

  const examinationId = useQueryParams().get('examination');
  const isQuestionListingPage = useQueryParams().get('question-listing');
  const hasRealExam = Boolean(examinationId) && examinationId !== "new";

  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    examinationId ? examinationId : "isStandaloneExamination && isNotEdit",
    true
  );

  const myId = useQueryParams().get("question");
  const [questionId, setQuestionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [gradeDetails, setGradeDetails] = useState([]);
  const [isPublished, setisPublished] = useState(assessment?.isPublished);
  const { push } = useHistory();
  const location = useLocation();
  const openBankPicker = useAssessmentStore((s) => s.openBankPicker);

  useEffect(() => {
    setisPublished(assessment?.isPublished);
  }, [assessment?.isPublished]);

  const fetcher = useCallback(async () => {
    try {
      const { data } = await adminGetAllStandaloneExaminationDetails(
        examinationId
      );
      setGradeDetails(data);
    } catch (error) {
      console.log(error);
    }
  }, [examinationId]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  const handleGetGrades = () => {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(
      gradeDetails?.map((order) => ({
        username: order.user.username,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        gender: order.user.gender,
        email: order.user.email,
        score: order.score,
      }))
    );

    utils.book_append_sheet(wb, ws, "Orders");
    writeFile(wb, "ExaminationResult.xlsx");
  };

  const handlePublishing = async () => {
    setLoading(true);
    try {
      const body = {
        isPublished: !isPublished,
      };
      const { examination } = await adminEditStandaloneExamination(
        examinationId,
        body
      );
      setisPublished(examination?.isPublished);
      setLoading(false);
      window.location.reload(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!myId === true) setQuestionId("new");
    else {
      setQuestionId(myId);
    }
  }, [myId]);

  // Preserve the pending-creation/edit flags across tab switches — dropping
  // them here made the Questions tab forget it was mid-creation after a
  // detour to Overview, wiping queued questions and breaking the Question
  // Bank button (both gated on submitForApproval/editSubmit staying set).
  const submitForApproval = useQueryParams().get("submitForApproval");
  const editSubmit = useQueryParams().get("editSubmit");
  const pendingParams = examinationId === "new"
    ? `${submitForApproval ? "&submitForApproval=1" : ""}${editSubmit ? "&editSubmit=1" : ""}`
    : "";

  const examIdCheck =
    !examinationId && !questionId
      ? "/admin/standalone-exams/questions"
      : examinationId && !questionId
        ? `/admin/standalone-exams/questions/?examination=${examinationId}${pendingParams}`
        : `/admin/standalone-exams/questions/?examination=${examinationId}&question=${questionId}${pendingParams}`;

  const isActive = (pathPart) => location.pathname.includes(pathPart);

  const activeStyle = {
    color: "#6b006b",
    borderBottom: "2px solid #6b006b",
    paddingBottom: "10px",
    fontWeight: "bold",
    marginBottom: "-2px"
  };

  const inactiveStyle = {
    color: "#4A5568",
    paddingBottom: "10px",
  };

  return (
    <Box marginX="22px" marginTop="20px" width={{ sm: "90%", md: "91%", lg: "96%" }}>
      {/* Top Section */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
        <Flex alignItems="center" gap="16px">
          <Button
            secondary
            onClick={() => push('/admin/standalone-exams')}
            height="36px"
            display="flex"
            padding="0 12px"
            border="1px solid #E2E8F0"
            background="white"
          >
            <Flex gap="8px" alignItems="center">
              <FaArrowLeft color="#1A202C" />
              <Text color="#1A202C" fontWeight="500">Go Back</Text>
            </Flex>
          </Button>
          <Heading as="h1" fontSize="28px" fontWeight="600" color="#1A202C">
            {hasRealExam ? "Edit Exam" : "New Exams"}
          </Heading>
        </Flex>

        <Flex gap="10px">
          <Button
            secondary
            onClick={() => {
              // No exam/shell to attach questions to yet at all (haven't even
              // submitted the Overview step once) — nothing to open a picker
              // for, fall back to browsing the bank standalone.
              if (!examinationId) {
                push("/admin/exam-question-bank");
                return;
              }
              // Otherwise (pending creation/edit OR an already-real exam)
              // always use the in-page picker, never the separate page. It
              // only mounts on the Questions tab — jump there first
              // (preserving the pending flags) if we're not already on it.
              // Zustand's isBankPickerOpen stays true across the navigation,
              // so it shows as soon as the tab mounts.
              if (!isActive("questions")) push(examIdCheck);
              openBankPicker();
            }}
          >
            Question Bank
          </Button>
          {examinationId && (
            <Button
              secondary
              isLoading={loading}
              disabled={loading}
              onClick={() => handleGetGrades()}
            >
              Get Grades
            </Button>
          )}
          {examinationId && (
            <Button
              isLoading={loading}
              disabled={loading}
              onClick={() => handlePublishing()}
            >
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          )}
          {!examinationId && (
            <Button>
              Use Saved Template
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Tabs Section */}
      <Flex
        gap="40px"
        borderBottom="1px solid #E2E8F0"
        width="100%"
        paddingLeft="10px"
      >
        <NavLink
          to={`/admin/standalone-exams/overview${examinationId ? `?examination=${examinationId}` : ""
            }`}
          style={isActive('overview') ? activeStyle : inactiveStyle}
        >
          Overview
        </NavLink>

        {!examinationId ? (
          <Text style={inactiveStyle} cursor="not-allowed" color="#A0AEC0">Template / Marking Scheme</Text>
        ) : (
          <NavLink
            to={`/admin/standalone-exams/template${examinationId ? `?examination=${examinationId}` : ""
              }`}
            style={isActive('template') ? activeStyle : inactiveStyle}
          >
            Template / Marking Scheme
          </NavLink>
        )}

        {!examinationId ? (
          <Text style={inactiveStyle} cursor="not-allowed" color="#A0AEC0">Questions</Text>
        ) : (
          <NavLink
            to={examIdCheck}
            style={isActive('questions') ? activeStyle : inactiveStyle}
          >
            Questions
          </NavLink>
        )}
      </Flex>
    </Box>
  );
};

export default StandAloneHeader;

