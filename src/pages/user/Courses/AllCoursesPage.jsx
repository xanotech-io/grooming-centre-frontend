import { Route } from 'react-router-dom';
import { CardGridLayout } from '../../../layouts';
import useCourses from './hooks/useCourses';

const AllCoursesPage = () => {
  const { courses } = useCourses();

  // const handleTryAgain = async () => {
  //   await handleDelete(lessonId);
  //   fetchLessonDetails();
  // };

  return <CardGridLayout cardContents={courses} />;
};

const AllCoursesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AllCoursesPage {...props} />} />;
};

export default AllCoursesPageRoute;
