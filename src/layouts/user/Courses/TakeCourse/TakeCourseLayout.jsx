import { Route } from 'react-router-dom';
import { Flex } from '@chakra-ui/layout';
import { TakeCourseProvider } from '../../../../contexts';
import breakpoints from '../../../../theme/breakpoints';
import Sidebar from './Sidebar';
import useSidebar from './hooks/useSidebar';
import { Switch, Redirect } from 'react-router-dom';
import {
  AssessmentPreviewPageRoute,
  LessonDetailsPageRoute,
} from '../../../../pages/user';
import {
  useRedirectNonAuthUserToSigninPage,
} from '../../../../hooks';

const TakeCourseLayout = () => {
  const sidebarManager = useSidebar();
  useRedirectNonAuthUserToSigninPage();

  return (
    <Flex maxWidth={breakpoints['4k']} marginX="auto" height="100vh">
      <Sidebar manager={sidebarManager} />

      <Switch>
        <LessonDetailsPageRoute
          path="/courses/take/:course_id/lessons/:lesson_id"
          sidebarLinks={sidebarManager.links}
          setCourseState={sidebarManager.setCourseState}
        />
        <AssessmentPreviewPageRoute
          exact
          path="/courses/take/:course_id/assessment/:assessment_id" // TODO: replace `/take` to `/preview`
          sidebarLinks={sidebarManager.links}
          sidebarLinkClickedState={sidebarManager.sidebarLinkClickedState}
        />

        <Redirect to="/not-found" />
      </Switch>
    </Flex>
  );
};

export const TakeCourseLayoutRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <TakeCourseProvider>
          <TakeCourseLayout {...props} />
        </TakeCourseProvider>
      )}
    />
  );
};
