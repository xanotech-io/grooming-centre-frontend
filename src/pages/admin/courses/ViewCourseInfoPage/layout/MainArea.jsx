import { Box } from '@chakra-ui/layout';
import { Switch } from 'react-router-dom';
import InfoPageRoute from '../pages/InfoPage';
import LessonPageRoute from '../pages/LessonPage';
import AssessmentListingPageRoute from '../pages/AssessmentListingPage';
import ExamListingPageRoute from '../pages/ExamListingPage';
import ModulesListingPageRoute from '../pages/ModulesListingPage';
import EditHistoryPageRoute from '../pages/EditHistoryPage';

const MainArea = () => {
  return (
    <Box flex={1} overflowY="scroll">
      <Switch>
        <InfoPageRoute path="/admin/courses/details/:id/info" />
        <ModulesListingPageRoute path="/admin/courses/details/:id/modules" />
        <EditHistoryPageRoute path="/admin/courses/details/:id/edit-history" />
        <LessonPageRoute path="/admin/courses/details/:id/lessons" />
        <AssessmentListingPageRoute path="/admin/courses/details/:id/assessment" />
        <ExamListingPageRoute path="/admin/courses/details/:id/exam" />
      </Switch>
    </Box>
  );
};

export default MainArea;
