/* eslint-disable no-unused-vars */

import { Route, Switch } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';
import { BreadcrumbItem } from '@chakra-ui/react';

import { useQueryParams } from '../../../hooks';
import { AdminMainAreaWrapper } from '../../../layouts';
import { Breadcrumb, Link } from '../../../components';

// Added a new header component
import StandAloneHeader from '../courses/AssessmentPage/layout/StandAloneHeader';
import OverViewStandalone from './OverViewStandalone';

import QuestionsStandaloneRoute from './QuestionsStandalone';
import TemplateStandalone from './TemplateStandalone';
import useAssessmentPreview from '../../user/Courses/TakeCourse/hooks/useAssessmentPreview';

import { ParticipantsListingPageRoute } from '../participants/ParticipantsListingPage';
import CreateParticipants from '../participants/CreateParticipants';

export const CreateStandaloneExamPage = () => {
  const isExamination = useQueryParams().get('examination');
  const hasRealExam = Boolean(isExamination) && isExamination !== 'new';

  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    isExamination ? isExamination : 'isStandaloneExamination && isNotEdit',
    true
  );

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/standalone-exams">Standalone Exams</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">{hasRealExam ? "Edit Exam" : "Create Exam"}</Link></BreadcrumbItem>}
        />
      </Flex>
      {/* commented out previous header and box components */}
      {/* <Header /> */}
      <StandAloneHeader assessment={assessment} />
      <Switch>
        <QuestionsStandaloneRoute path="/admin/standalone-exams/questions" />
        <Route path="/admin/standalone-exams/template" render={(props) => <TemplateStandalone {...props} />} />
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
