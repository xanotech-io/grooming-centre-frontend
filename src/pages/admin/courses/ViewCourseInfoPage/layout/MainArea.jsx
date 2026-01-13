import { Box } from '@chakra-ui/layout';
import { Switch } from 'react-router-dom';
import InfoPageRoute from '../pages/InfoPage';
import LessonPageRoute from '../pages/LessonPage';
import AssessmentListingPageRoute from '../pages/AssessmentListingPage';
import ExamListingPageRoute from '../pages/ExamListingPage';
import ProgressReportRoute from '../pages/ProgressReport';

const MainArea = () => {
  return (
    <Box flex={1} overflowY="scroll">
      <Switch>
        <InfoPageRoute path="/admin/courses/details/:id/info" />
        <LessonPageRoute path="/admin/courses/details/:id/lessons" />
        <AssessmentListingPageRoute path="/admin/courses/details/:id/assessment" />
        <ExamListingPageRoute path="/admin/courses/details/:id/exam" />
        <ProgressReportRoute path="/admin/courses/details/:id/progress-report" />
      </Switch>
    </Box>
  );
};

export default MainArea;
