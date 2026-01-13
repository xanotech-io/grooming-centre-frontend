import { Route } from 'react-router-dom';
import { Flex, Box } from '@chakra-ui/layout';
import { Sidebar } from './Sidebars';
import Header from './Header/Header';
import MainArea from './MainArea';

const ForumLayout = () => {
  return (
    <Flex paddingTop={7}>
      <Sidebar width="265px" />

      <Box flex={1} padding={7} paddingTop={0}>
        <Header marginBottom={7} />

        <Flex overflowY="auto" height="calc(100vh - 90px)">
          <MainArea flex={1} maxWidth="100%" marginRight={7} />
        </Flex>
      </Box>
    </Flex>
  );
};

export const ForumLayoutRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ForumLayout {...props} />} />;
};
