import { Route } from "react-router-dom";
import { CardGridLayout } from "../../../layouts";
import useCourses from "./hooks/useCourses";

const NewCoursesPage = () => {
  const { courses } = useCourses();

  return <CardGridLayout cardContents={courses} />;
};

const NewCoursesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <NewCoursesPage {...props} />} />;
};

export default NewCoursesPageRoute;
