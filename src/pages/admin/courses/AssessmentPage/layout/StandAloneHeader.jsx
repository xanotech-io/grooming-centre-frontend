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

const StandAloneHeader = () => {
  const { id } = useParams();

  const examinationId = useQueryParams().get('examination');
  const isQuestionListingPage = useQueryParams().get('question-listing');

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

  const examIdCheck =
    !examinationId && !questionId
      ? "/admin/standalone-exams/questions"
      : examinationId && !questionId
        ? `/admin/standalone-exams/questions/?examination=${examinationId}`
        : `/admin/standalone-exams/questions/?examination=${examinationId}&question=${questionId}`;

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
            New Exams
          </Heading>
        </Flex>

        <Flex gap="10px">
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

        {!examinationId ? (
          <Text style={inactiveStyle} cursor="not-allowed" color="#A0AEC0">Participants</Text>
        ) : (
          <NavLink
            to={`/admin/standalone-exams/participants/${examinationId ? `?examination=${examinationId}` : ""
              }`}
            style={isActive('participants') ? activeStyle : inactiveStyle}
          >
            Participants
          </NavLink>
        )}
      </Flex>
    </Box>
  );
};

export default StandAloneHeader;

