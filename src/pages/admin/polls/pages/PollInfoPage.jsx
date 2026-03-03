import { useEffect, useState } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/layout';
import { BreadcrumbItem } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import useCourseDetails from '../../../user/Courses/CourseDetails/hooks/useCourseDetails';
import {
	adminPublishCourse,
	adminUnpublishCourse,
	http,
} from '../../../../services';
import { capitalizeFirstLetter } from '../../../../utils';
import {
	Breadcrumb,
	Button,
	Heading,
	Image,
	Link,
	SkeletonText,
	Spinner,
	Text,
} from '../../../../components';
import { EmptyState } from '../../../../layouts';

const PollInfoPage = () => {
	const { courseDetails, fetchCourseDetails } = useCourseDetails();
	const { id } = useParams();
	const [question, setQuestion] = useState('');
	const [pollOptions, setPollOptions] = useState('');

	const fetchPollInfo = async pollId => {
		try {
			const data = await http.get(`/polls/${pollId}`);
			setPollOptions(data.data.data.poll.pollOptions);
			setQuestion(data.data.data.poll.question);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (id) {
			fetchPollInfo(id);
		}
	}, [id]);

	const isLoading = courseDetails.loading;
	const isError = courseDetails.err;

	return isLoading || isError ? (
		<Flex
			// Make the height 100% of the screen minus the `height` of the Header and Footer
			height='calc(100vh - 200px)'
			justifyContent='center'
			alignItems='center'
		>
			{isLoading ? (
				<Spinner />
			) : isError ? (
				<EmptyState
					cta={
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					}
					heading='Oops an error occurred'
					description='An unexpected error occurred, please try again later'
				/>
			) : null}
		</Flex>
	) : (
		<Box paddingX={4}>
			<Box paddingX={4}>
				<Breadcrumb
					item2={
						<BreadcrumbItem isCurrentPage>
							<Link href='/admin/polls'>Polls </Link>
						</BreadcrumbItem>
					}
					item3={
						<BreadcrumbItem isCurrentPage>
							<Link href='#'>Info</Link>
						</BreadcrumbItem>
					}
				/>
			</Box>

			<Box marginTop={2} padding={4}>
				<Flex
					paddingBottom={8}
					justifyContent='space-between'
					alignContent='center'
					flexDirection='row'
				>
					<Heading fontSize='heading.h3'>Polls Info</Heading>
				</Flex>

				<Box backgroundColor='white' paddingX={10} paddingY={12} shadow='md'>
					{isLoading ? (
						<SkeletonText width='600px' paddingBottom={8} numberOfLines={1} />
					) : (
						<Heading
							as='h3'
							fontSize='heading.h4'
							fontWeight='700'
							color='black'
							paddingBottom={8}
						>
							{question}
						</Heading>
					)}
				</Box>
				<Box padding={'1rem'}>
					<Flex
						paddingBottom={8}
						justifyContent='space-between'
						alignContent='center'
						flexDirection='row'
					>
						<Heading fontSize='heading.h3'>Votes Count</Heading>
					</Flex>
					<Box backgroundColor='white' paddingX={10} paddingY={12} shadow='md'>
						{pollOptions &&
							pollOptions.map((poll, index) => (
								<Text as='level3' bold mb={{ base: 1, tablet: 2 }} key={index}>
									{index + 1}) {poll.text} = {poll.pollVotes.length}{' '}
									{poll.pollVotes.length > 1 ? 'Votes' : 'Vote'}
								</Text>
							))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

const PollInfoPageRoute = ({ ...rest }) => {
	return <Route {...rest} render={props => <PollInfoPage {...props} />} />;
};

export default PollInfoPageRoute;
