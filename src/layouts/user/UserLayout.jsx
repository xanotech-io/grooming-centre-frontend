import { Route, Switch } from 'react-router-dom';
import { OnBoardingLayoutRoute } from '..';
import Header from './Header/Header';
import MainArea from './MainArea';
import Footer from './Footer';
import { Box } from '@chakra-ui/layout';
import breakpoints from '../../theme/breakpoints';
import { PageLoaderLayout } from '../global';
import {
  useRedirectNonAuthUserToSigninPage,
  usePageRefreshAfterLogin,
  useBlockSuperAdminFromUserScreens,
} from '../../hooks';

const UserLayout = () => {
  const hasInitRefreshed = usePageRefreshAfterLogin();
  useRedirectNonAuthUserToSigninPage();
  useBlockSuperAdminFromUserScreens();

  return (
    <Box maxWidth={breakpoints['4k']} marginX="auto">
      <Header />
      {!hasInitRefreshed ? <PageLoaderLayout /> : <MainArea />}
      <Footer />
    </Box>
  );
};

const UserLayoutRouter = () => {
  return (
    <Switch>
      <OnBoardingLayoutRoute path="/auth" />
      <Route path="/" render={(props) => <UserLayout {...props} />} />
    </Switch>
  );
};

export const UserLayoutRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={(props) => <UserLayoutRouter {...props} />} />
  );
};
