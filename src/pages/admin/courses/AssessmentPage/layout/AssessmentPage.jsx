import { Flex } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import Header from './Header';
import MainArea from './MainArea';

const AssessmentPage = () => {
  return (
    <Flex flexDirection="column" height="100%">
      <Header />
      <MainArea />
    </Flex>
  );
};

// testing

export const AssessmentPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AssessmentPage {...props} />} />;
};
