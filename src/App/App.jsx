import { BrowserRouter as Router, Switch } from 'react-router-dom';
import GlobalProviders from './GlobalProviders';
import '../styles/course-box-card.scss';
import '../styles/courses-row-layout.scss';
import '../styles/globalStyles.scss';
import '../styles/user-header-nav-link.scss';
import '../styles/user-forum-sidebar-link.scss';
import '../styles/month-schedule.scss';
import '../styles/take-lesson-video.scss';
import '../styles/responsiveness.css';
import {
  AdminLayoutRoute,
  AssessmentLayoutRoute,
  AssessmentTakingLayoutRoute,
  ExaminationLayoutRoute,
  TakeCourseLayoutRoute,
  UserLayoutRoute,
} from '../layouts';
import { useApp } from '../contexts';
import { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  registerPushToken,
  listenForForegroundMessages,
} from '../services/pushNotifications';
import useNotificationStore from '../store/notificationStore';

function App() {
  return (
    <GlobalProviders>
      <Router>
        <AppConfig />
      </Router>
    </GlobalProviders>
  );
}

export const useAppConfig = () => {
  const appManager = useApp();
  const toast = useToast();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const {
    fetchMetadata,
    fetchCurrentUser,
    handleSetToken,
    handleGetTokenFromClientStorage,
  } = appManager;

  useEffect(() => {
    fetchMetadata();
    const token = handleGetTokenFromClientStorage();
    handleSetToken(token);

    if (token) {
      fetchCurrentUser();
    }
  }, [
    fetchMetadata,
    fetchCurrentUser,
    handleGetTokenFromClientStorage,
    handleSetToken,
  ]);

  useEffect(() => {
    if (appManager.state.user) {
      let DateNow = localStorage.getItem('DateNow');
      if (DateNow)
        setInterval(() => {
          DateNow = +localStorage.getItem('DateNow') + 1000;
          localStorage.setItem('DateNow', DateNow);
        }, 1000);
    }
  }, [appManager.state.user]);

  useEffect(() => {
    if (!appManager.state.user) return;

    registerPushToken().catch((err) => console.error(err));

    const unsubscribe = listenForForegroundMessages((payload) => {
      addNotification({
        id: payload.messageId || `${Date.now()}-${Math.random()}`,
        title: payload.notification?.title,
        body: payload.notification?.body,
        contentUrl: payload.data?.contentUrl,
        senderName: payload.data?.senderName,
        senderAvatar: payload.data?.senderAvatar || payload.notification?.icon,
        receivedAt: Date.now(),
      });

      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
        status: 'info',
        isClosable: true,
        duration: 6000,
      });
    });

    return unsubscribe;
  }, [appManager.state.user, toast, addNotification]);
};

function AppConfig() {
  useAppConfig();

  return (
    <Switch>
      <AdminLayoutRoute path="/admin" />
      <AssessmentLayoutRoute
        exact
        path="/courses/take/:course_id/assessment/start/:assessment_id"
      />
      <AssessmentTakingLayoutRoute
        exact
        path="/courses/take/:course_id/assessment-take/:assessment_id"
      />
      <ExaminationLayoutRoute
        exact
        path="/courses/take/:course_id/exam/:exam_id"
      />
      <TakeCourseLayoutRoute path="/courses/take" />
      <UserLayoutRoute path="/" />
    </Switch>
  );
}

export default App;
