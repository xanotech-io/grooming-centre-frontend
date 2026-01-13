import React, { useCallback, useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/layout";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { Button } from "../../../../../components";
import { useQueryParams } from "../../../../../hooks";
import {
  adminEditStandaloneExamination,
  adminGetAllStandaloneExaminationDetails,
} from "../../../../../services";
import useAssessmentPreview from "../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview";
import { utils, writeFile } from "xlsx";

const StandAloneHeader = () => {
  const { id } = useParams();

  const examinationId = useQueryParams().get('examination');
  console.log(examinationId);
  const isQuestionListingPage = useQueryParams().get('question-listing');
  console.log(isQuestionListingPage);

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

  useEffect(() => {
    setisPublished(assessment?.isPublished);
  }, [assessment?.isPublished]);

  const fetcher = useCallback(async () => {
    console.log(examinationId);
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
  return (
    <>
      <Box
        backgroundColor="white"
        shadow="0 2px 2px rgba(0, 0, 0, .05)"
        marginTop="20px"
        marginLeft="22px"
        height="auto"
        alignItems="center"
        width={{ sm: "90%", md: "91%", lg: "96%" }}
        padding={6}
      >
        <Box
          display="flex"
          gap={{ sm: "10px", lg: "0px" }}
          flexDirection={{ sm: "column", lg: "row" }}
          justifyContent="space-between"
        >
          <Box display="flex" gap="20px" alignItems="center">
            <NavLink
              style={(state) => ({
                color: state ? "#000000" : "#6C6C6C",
              })}
              to={`/admin/standalone-exams/overview${
                examinationId ? `?examination=${examinationId}` : ""
              }`}
            >
              Overview
            </NavLink>
            {!examinationId ? (
              <p style={{ color: "#6c6c6c", cursor: "pointer" }}>Questions</p>
            ) : (
              <NavLink
                style={(state) => ({
                  color: state ? "#000000" : "#6C6C6C",
                })}
                to={examIdCheck}
                disabled={!examinationId}
              >
                Questions
              </NavLink>
            )}
            {!examinationId ? (
              <p style={{ color: "#6c6c6c", cursor: "pointer" }}>
                Participants
              </p>
            ) : (
              <NavLink
                style={(state) => ({
                  color: state ? "#000000" : "#6C6C6C",
                })}
                to={`/admin/standalone-exams/participants/${
                  examinationId ? `?examination=${examinationId}` : ""
                }`}
                disabled={!examinationId}
              >
                Participants
              </NavLink>
            )}
          </Box>

          <Box display="flex" gap="10px">
            <Button
              secondary
              isLoading={loading}
              disabled={loading}
              onClick={() => handleGetGrades()}
              width="100%"
            >
              Get Grades
            </Button>
            {examinationId ? (
              <Flex width="180px">
                <Button
                  isLoading={loading}
                  disabled={loading}
                  onClick={() => handlePublishing()}
                  width="100%"
                >
                  {isPublished ? "Unpublish" : "Publish"}
                </Button>
              </Flex>
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default StandAloneHeader;
