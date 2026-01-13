import { Route, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useCache } from "../../../../../contexts";
import useComponentIsMount from "../../../../../hooks/useComponentIsMount";
import { adminGetUserGrades } from "../../../../../services";
import { Grades } from "../../../../user";

const useGradeDetails = () => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const [myGrades, setMyGrades] = useState({});

  const { id: userId } = useParams();

  const [gradeDetails, setGradeDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const fetcher = useCallback(async () => {
    setGradeDetails({ loading: true });
    try {
      const { grades } = await adminGetUserGrades(userId);
      setMyGrades(grades);
    } catch (error) {
      setGradeDetails({ err: error.message });
      console.log(error.message);
    }
  }, [userId]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  const fetchGradeDetails = useCallback(async () => {
    setGradeDetails({ loading: true });
    try {
      const gradeDetails = await handleGetOrSetAndGet("gradeDetails", fetcher);
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
  const grade = gradeDetails.data;
  const isLoading = gradeDetails.loading;
  const error = gradeDetails.err;
  console.log(grade);
  return {
    grade,
    isLoading,
    error,
    myGrades,
  };
};

const GradeHistoryPage = () => {
  const manager = useGradeDetails();

  const { grade, isLoading, myGrades } = manager;

  return <Grades isLoading={isLoading} grades={grade} myGrades={myGrades} />;
};

const GradeHistoryPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <GradeHistoryPage {...props} />} />
  );
};

export default GradeHistoryPageRoute;
