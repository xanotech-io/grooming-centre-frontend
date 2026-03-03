import { useCallback, useEffect, useState } from "react";
import { useCache } from "../../../../../contexts";
import useComponentIsMount from "../../../../../hooks/useComponentIsMount";
import { userGetGrades } from "../../../../../services";

const useGradeDetails = () => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();

  const [gradeDetails, setGradeDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const fetcher = useCallback(async () => {
    const { grades } = await userGetGrades();
    return grades;
  }, []);

  const fetchGradeDetails = useCallback(async () => {
    setGradeDetails({ loading: true });

    try {
      const gradeDetails = await handleGetOrSetAndGet("gradeDetails", fetcher);
      // console.log(gradeDetails);
      if (componentIsMount) setGradeDetails({ data: gradeDetails });
    } catch (err) {
      console.log(err.message);
      if (componentIsMount) setGradeDetails({ err: err.message });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentIsMount]);

  useEffect(() => {
    fetchGradeDetails();
  }, [fetchGradeDetails]);

  const grades = gradeDetails.data;
  const isLoading = gradeDetails.loading;
  const error = gradeDetails.err;

  return {
    grades,
    isLoading,
    error,
  };
};

export default useGradeDetails;
