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
import { useToast, Box, Text } from '@chakra-ui/react';
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
      const contentUrl = payload.data?.contentUrl || payload.data?.content_url;

      addNotification({
        id: payload.messageId || `${Date.now()}-${Math.random()}`,
        title: payload.notification?.title,
        body: payload.notification?.body,
        contentUrl,
        senderName: payload.data?.senderName || payload.data?.sender_name,
        senderAvatar:
          payload.data?.senderAvatar ||
          payload.data?.sender_avatar ||
          payload.notification?.icon,
        receivedAt: Date.now(),
      });

      if (contentUrl) {
        const toastId = `push-${Date.now()}-${Math.random()}`;
        toast({
          id: toastId,
          duration: 6000,
          isClosable: true,
          render: () => (
            <Box
              bg="primary.base"
              color="white"
              borderRadius="md"
              px={4}
              py={3}
              cursor="pointer"
              onClick={() => {
                toast.close(toastId);
                window.location.href = contentUrl;
              }}
            >
              <Text fontWeight={700}>{payload.notification?.title}</Text>
              <Text fontSize="sm">{payload.notification?.body}</Text>
            </Box>
          ),
        });
      } else {
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
          status: 'info',
          isClosable: true,
          duration: 6000,
        });
      }
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
