import React from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router";
import { useCache } from "../../../../contexts";
import { useComponentIsMount, useQueryParams } from "../../../../hooks";
import { usersGetStandaloneExaminationListing } from "../../../../services";

const useStandalonePreview = (
  sidebarLinks,
  assessmentId,
  isForAdmin,
  sidebarLinkClickedState
) => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const isExamination = useQueryParams().get("exam");

  const [assessmentDetails, setAssessmentDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });
  const [examination, setExamination] = useState([]);
  const [examDetails, setExamDetails] = useState([]);

  const fetcher = useCallback(async () => {
    try {
      const { examinations } = await usersGetStandaloneExaminationListing();
      setExamination(examinations);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetcher();
  }, [fetcher]);

  useEffect(() => {
    const currentExamDetails = examination?.find(
      (item) => item?.id === isExamination
    );
    setExamDetails(currentExamDetails);
  }, [examination, isExamination]);

  const fetchAssessmentDetails = useCallback(
    async () => {
      setAssessmentDetails({ loading: true });
      try {
        setAssessmentDetails({ data: examDetails });
      } catch (err) {
        console.error(err);
        if (componentIsMount) setAssessmentDetails({ err: err.message });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assessmentId, componentIsMount]
  );
  const handleFetch = (bypassCache) => {
    fetchAssessmentDetails(bypassCache);
  };

  const handleTryAgain = () => {
    fetchAssessmentDetails(true);
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assessment = { ...examDetails };
  const isLoading = assessmentDetails.loading;
  const error = assessmentDetails.err;

  const setError = (msg) => setAssessmentDetails({ err: msg });

  return {
    assessment,
    isLoading,
    error,
    setError,
    isExamination,
    handleFetch,
    handleTryAgain,
  };
};

export default useStandalonePreview;
