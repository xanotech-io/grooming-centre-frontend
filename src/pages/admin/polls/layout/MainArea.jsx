import { Box } from '@chakra-ui/layout';
import { Switch } from 'react-router-dom';
import OptionListingPageRoute from '../pages/OptionListingPage';
import PollInfoPageRoute from '../pages/PollInfoPage';

const MainArea = () => {
	return (
		<Box flex={1} overflowY='scroll'>
			<Switch>
				<PollInfoPageRoute path='/admin/polls/details/:id/info' />
				<OptionListingPageRoute path='/admin/polls/details/:id/options' />
			</Switch>
		</Box>
	);
};

export default MainArea;
