import { Route } from "react-router-dom";
import { CardGridLayout } from "../../../layouts";
import useCourses from "./hooks/useCourses";

const CompletedCoursesPage = () => {
  const { courses } = useCourses();

  return <CardGridLayout cardContents={courses} />;
};

const CompletedCoursesPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CompletedCoursesPage {...props} />} />
  );
};

export default CompletedCoursesPageRoute;
