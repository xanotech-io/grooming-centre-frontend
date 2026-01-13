import { Flex, Grid, GridItem } from '@chakra-ui/layout';
import { Box, BreadcrumbItem } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { Route } from 'react-router-dom';
import {
	Breadcrumb,
	Checkbox,
	Heading,
	Input,
	Link,
	Select,
	Spinner,
	Textarea,
	Upload,
} from '../../../components';
import { useApp, useCache } from '../../../contexts';
import { useUpload } from '../../../hooks';
import { CreatePageLayout } from '../../../layouts';
import {
	adminCreateCourse,
	adminCreateOption,
	adminEditCourse,
} from '../../../services';
import {
	appendFormData,
	capitalizeFirstLetter,
	capitalizeWords,
} from '../../../utils';
import useCourseDetails from '../../user/Courses/CourseDetails/hooks/useCourseDetails';

const CreateOptionsPage = ({ metadata: propMetadata }) => {
	const toast = useToast();
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm();

	const { push } = useHistory();
	const appManager = useApp();
	const metadata = propMetadata || appManager.state.metadata;

	const { courseDetails, fetchCourseDetails } = useCourseDetails();
	const { pollId } = useParams();


	const onSubmit = async data => {
		const finalData = {
			pollId,
			text: data.text,
		};
		try {
			const { message } = await adminCreateOption(finalData);
			toast({
				description: capitalizeFirstLetter(message),
				position: 'top',
				status: 'success',
			});
			push(`/admin/polls`);
		} catch (error) {
			toast({
				description: capitalizeFirstLetter(error.message),
				position: 'top',
				status: 'error',
			});
		}
	};

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
				<Heading color='red.500'>{isError}</Heading>
			) : null}
		</Flex>
	) : (
		<>
			<Box paddingLeft={6}>
				<Breadcrumb
					item2={
						<BreadcrumbItem>
							<Link href='/admin/polls'>Polls</Link>
						</BreadcrumbItem>
					}
					item3={
						<BreadcrumbItem isCurrentPage>
							<Link href='#'>Create Option</Link>
						</BreadcrumbItem>
					}
				/>
			</Box>

			<CreatePageLayout
				title='Create Option'
				submitButtonText={'Submit'}
				onSubmit={handleSubmit(onSubmit)}
				submitButtonIsLoading={isSubmitting}
			>
				<Grid templateColumns='repeat(2, 1fr)' gap={10} marginBottom={10}>
					{/* Row 1 */}
					<GridItem>
						<Input
							label='Option'
							isRequired
							id='text'
							{...register('text', {
								required: 'Option is required',
							})}
							error={errors.text?.message}
						/>
					</GridItem>
				</Grid>
			</CreatePageLayout>
		</>
	);
};

export const CreateOptionsPageRoute = ({ component: Component, ...rest }) => {
	return <Route {...rest} render={props => <CreateOptionsPage {...props} />} />;
};
