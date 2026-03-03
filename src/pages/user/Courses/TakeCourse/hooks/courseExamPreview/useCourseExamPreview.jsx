import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCache } from "../../../../../../contexts";
import { useComponentIsMount, useQueryParams } from "../../../../../../hooks";
import {
  requestAssessmentDetails,
  requestExaminationDetails,
} from "../../../../../../services";

const useCourseExamPreview = (
  sidebarLinks,
  assessmentId,
  isForAdmin,
  sidebarLinkClickedState
) => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const { id: courseId, assessment_id } = useParams();
  const queryParams = useQueryParams();
  const isExamination = queryParams.get("examination");

  const [assessmentDetails, setAssessmentDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const index = sidebarLinks?.findIndex((link) => link.id === assessmentId);
  const currentAssessmentLink = { text: sidebarLinks?.[index]?.text };

  assessmentId = assessmentId || assessment_id;
  const assessmentIsNew = assessmentId === "new";

  const fetcher = useCallback(async () => {
    const data = await (!isExamination
      ? requestAssessmentDetails(assessment_id, isForAdmin)
      : requestExaminationDetails(assessmentId, isForAdmin)); // `assessmentId` is `courseId` in this case

    return isExamination ? data?.examination : data?.assessment;
  }, [assessmentId, isExamination, isForAdmin]);

  const fetchAssessmentDetails = useCallback(
    async (bypassCache) => {
      setAssessmentDetails({ loading: true });

      try {
        const assessmentDetails = await handleGetOrSetAndGet(
          isExamination || assessmentId,
          fetcher,
          bypassCache
        );

        if (componentIsMount) setAssessmentDetails({ data: assessmentDetails });
      } catch (err) {
        console.error(err);
        if (componentIsMount) setAssessmentDetails({ err: err.message });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assessmentId, componentIsMount]
  );

  const handleFetch = (bypassCache) => {
    if (!assessmentIsNew) fetchAssessmentDetails(bypassCache);
  };

  const handleTryAgain = () => {
    fetchAssessmentDetails(true);
  };

  useEffect(() => {
    sidebarLinkClickedState?.[1]?.(false);
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarLinkClickedState?.[0]]);

  const assessment = { ...currentAssessmentLink, ...assessmentDetails?.data };
  const isLoading = assessmentDetails?.loading;
  const error = assessmentDetails.err;

  const setError = (msg) => setAssessmentDetails({ err: msg });

  const assessmentIsDisabled =
    !isLoading &&
    !error &&
    sidebarLinks?.find((link) => link?.id === assessment?.id)?.disabled;

  return {
    assessment,
    isLoading,
    error,
    setError,
    isExamination,
    handleFetch,
    handleTryAgain,
    assessmentIsDisabled,
  };
};

export default useCourseExamPreview;
