import { Flex } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import Header from './Header';
import MainArea from './MainArea';

const ViewCourseInfoPage = () => {
  return (
    <Flex flexDirection="column" height="100%">
      <Header />
      <MainArea />
    </Flex>
  );
};

export const ViewCourseInfoPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ViewCourseInfoPage {...props} />} />
  );
};
