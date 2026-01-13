import { Route, Switch } from 'react-router-dom';

import { useQueryParams } from '../../../hooks';
import { AdminMainAreaWrapper } from '../../../layouts';

// Added a new header component
import StandAloneHeader from '../courses/AssessmentPage/layout/StandAloneHeader';
import OverViewStandalone from './OverViewStandalone';

import QuestionsStandaloneRoute from './QuestionsStandalone';
import useAssessmentPreview from '../../user/Courses/TakeCourse/hooks/useAssessmentPreview';

import { ParticipantsListingPageRoute } from '../participants/ParticipantsListingPage';
import CreateParticipants from '../participants/CreateParticipants';

export const CreateStandaloneExamPage = () => {
  const isExamination = useQueryParams().get('examination');

  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    isExamination ? isExamination : 'isStandaloneExamination && isNotEdit',
    true
  );

  return (
    <AdminMainAreaWrapper>
      {/* commented out previous header and box components */}
      {/* <Header /> */}
      <StandAloneHeader assessment={assessment} />
      <Switch>
        <QuestionsStandaloneRoute path="/admin/standalone-exams/questions" />
        <OverViewStandalone path="/admin/standalone-exams/overview" />
        <ParticipantsListingPageRoute
          exact
          path="/admin/standalone-exams/participants"
        />
        <CreateParticipants path="/admin/standalone-exams/participants/create" />
      </Switch>
    </AdminMainAreaWrapper>
  );
};
export const CreateStandalonePageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <CreateStandaloneExamPage {...props} />}
    />
  );
};
