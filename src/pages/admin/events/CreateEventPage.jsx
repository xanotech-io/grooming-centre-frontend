import { Box, Grid } from '@chakra-ui/layout';
import { useToast } from '@chakra-ui/toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Route, useHistory, useParams } from 'react-router-dom';
import { useAdminEventsPage } from '..';
import {
	DateTimePicker,
	Input,
	Select,
	Textarea,
	Upload,
} from '../../../components';
import { useApp, useCache } from '../../../contexts';
import { useDateTimePicker, useUpload } from '../../../hooks';
import { CreatePageLayout } from '../../../layouts';
import { adminCreateEvent, adminEditEvent } from '../../../services';
import {
	appendFormData,
	capitalizeFirstLetter,
	formatDateToISO,
	isUpcoming,
	populateSelectOptions,
} from '../../../utils';

const CreateEventPage = () => {
	const toast = useToast();
	const cache = useCache();
	const {
		state: { allMetadata: metadata },
	} = useApp();
	const { push, replace } = useHistory();
	const { eventId } = useParams();
	const isEditMode = eventId && eventId !== 'new';

	const { events, isLoading, hasError } = useAdminEventsPage();
	const event = isEditMode ? events?.find(event => event.id === eventId) : null;

	// Block from editing non upcoming events
	useEffect(() => {
		if (isEditMode && event && !isUpcoming(event.startTime, event.endTime)) {
			replace('/admin/events');

			toast({
				description: 'Page not found! This event is not upcoming',
				position: 'top',
				status: 'error',
				duration: 3500,
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditMode, event]);

	const [disableSubmit, setDisableSubmit] = useState(false);

	useEffect(() => {
		if (
			(isEditMode && !isLoading && !hasError && events && !event) ||
			hasError
		) {
			setDisableSubmit(true);
			toast({
				description:
					'Something went wrong! Please Refresh the page or try again later',
				position: 'top',
				status: 'error',
				duration: 1000 * 60 * 60,
			});

			return () => {
				toast.closeAll();
			};
		}
	}, [isEditMode, event, isLoading, hasError, events, toast]);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm();
	const coverImageManager = useUpload();
	const startTimeManager = useDateTimePicker();
	const endTimeManager = useDateTimePicker();

	// Init `Title` value
	useEffect(() => {
		if (event) {
			setValue('title', event.name);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event]);

	// Init `Description` value
	useEffect(() => {
		if (event) {
			setValue('description', event.description);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event]);

	// Init `DepartmentId` value
	useEffect(() => {
		if (event) {
			setValue('departmentId', event.departmentId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event, metadata]);

	// Init `Dates` value
	useEffect(() => {
		if (event) {
			startTimeManager.handleChange(event.startTime);
			endTimeManager.handleChange(event.endTime);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event]);

	useEffect(() => {
		if (event) {
			coverImageManager.handleInitialImageSelect(event.coverImage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event]);

	// Handle form submission
	const onSubmit = async data => {
		try {
			const startTime =
				startTimeManager.handleGetValueAndValidate('Start Time');
			const endTime = endTimeManager.handleGetValueAndValidate('End Time');
			const coverImage = coverImageManager.handleGetFileAndValidate(
				'Event Cover'
				// true // TODO: remove comment
			);

			data = {
				...data,
				coverImage,
				startTime: formatDateToISO(startTime),
				endTime: formatDateToISO(endTime),
			};

			const body = appendFormData(data);

			const { message } = await (isEditMode
				? adminEditEvent(eventId, body)
				: adminCreateEvent(body));

			// Clear cache on both admin side
			cache.handleDelete('admin-events');

			toast({
				description: capitalizeFirstLetter(message),
				position: 'top',
				status: 'success',
			});

			push(`/admin/events`);
		} catch (error) {
			console.error(error);
			toast({
				description: capitalizeFirstLetter(error.message),
				position: 'top',
				status: 'error',
			});
		}
	};

	return (
		<CreatePageLayout
			title={`${isEditMode ? 'Edit' : 'Create'} Event`}
			submitButtonText={isEditMode ? 'Update' : 'Submit'}
			onSubmit={handleSubmit(onSubmit)}
			submitButtonIsLoading={isSubmitting || isLoading}
			submitButtonIsDisabled={
				isSubmitting || isLoading || hasError || disableSubmit
			}
		>
			 <Box as="div" display={{lg:"grid",base:"flex", md:"flex"}} flexDirection={{base:"column", md:"column"}} gridTemplateColumns="1fr 1fr" gap={10} marginBottom={10}>
				<Input
					label='Title'
					isRequired
					id='title'
					{...register('title', {
						required: 'Title is required',
					})}
					error={errors.title?.message}
				/>

				<Select
					label='Select department'
					options={populateSelectOptions(metadata?.departments)}
					isRequired
					id='departmentId'
					isLoading={!metadata?.departments}
					{...register('departmentId', {
						required: 'Please select a department',
					})}
					error={errors.departmentId?.message}
				/>
			</Box>

			<Box marginBottom={8}>
				<Textarea
					minHeight='150px'
					label='Description'
					id='description'
					isRequired
					{...register('description', {
						required: 'Please add a description',
						maxLength: 1000,
					})}
					error={
						errors.description?.type === 'maxLength'
							? 'Maximum length of 1000 characters'
							: errors.description?.message
					}
				/>
			</Box>

			<Box as="div" display={{lg:"grid",base:"flex", md:"flex"}} flexDirection={{base:"column", md:"column"}} gridTemplateColumns="1fr 1fr" gap={10} marginBottom={10}>
				<DateTimePicker
					id='startTime'
					isRequired
					label='Start date & time'
					value={startTimeManager.value}
					onChange={startTimeManager.handleChange}
				/>

				<DateTimePicker
					id='endTime'
					isRequired
					label='End date & time'
					value={endTimeManager.value}
					onChange={endTimeManager.handleChange}
				/>
			</Box>

			<Box as="div" display={{lg:"grid",sm:"block", md:"block"}} gridTemplateColumns="1fr" gap={10} marginBottom={10}>
				<Box width='' marginBottom={8}>
					<Select
						label='Event Location'
						isRequired
						defaultValue='Virtual Meeting'
						options={[{ value: 'Virtual Meeting', label: 'Virtual' }]}
						id='location'
						{...register('location', {
							required: 'Event location is required',
						})}
						error={errors.location?.message}
					/>
				</Box>
				{/* <Box width='' marginBottom={8}>
					<Input
						label='Price'
						isRequired
						id='price'
						{...register('price', {
							required: 'Price is required',
						})}
						error={errors.price?.message}
					/>
				</Box> */}
			</Box>

			<Box marginBottom={8}>
				<Upload
					isRequired // TODO: remove
					id='coverImage'
					label='Event Cover'
					onFileSelect={coverImageManager.handleFileSelect}
					imageUrl={coverImageManager.image.url}
					accept={coverImageManager.accept}
				/>
			</Box>
		</CreatePageLayout>
	);
};

export const CreateEventPageRoute = ({ ...rest }) => {
	return <Route {...rest} render={props => <CreateEventPage {...props} />} />;
};
