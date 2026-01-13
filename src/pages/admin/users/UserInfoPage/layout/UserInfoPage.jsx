import { Flex } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import Header from './Header';
import MainArea from './MainArea';

const UserInfoPage = () => {
  return (
    <Flex flexDirection="column" height="100%">
      <Header />
      <MainArea />
    </Flex>
  );
};

export const UserInfoPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <UserInfoPage {...props} />} />;
};
