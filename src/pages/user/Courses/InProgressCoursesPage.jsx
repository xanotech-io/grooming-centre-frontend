import { Route } from "react-router-dom";
import { CardGridLayout } from "../../../layouts";
import useCourses from "./hooks/useCourses";

const InProgressCoursesPage = () => {
  const { courses } = useCourses();

  return <CardGridLayout cardContents={courses} />;
};

const InProgressCoursesPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <InProgressCoursesPage {...props} />} />
  );
};

export default InProgressCoursesPageRoute;
