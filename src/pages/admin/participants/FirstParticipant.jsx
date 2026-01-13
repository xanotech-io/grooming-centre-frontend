import { Route } from 'react-router-dom';
import { Box } from '@chakra-ui/layout';
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
} from '../../../components';
import { BreadcrumbItem, Tag } from '@chakra-ui/react';
import { FaSortAmountUpAlt } from 'react-icons/fa';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import {
  adminDeleteStandaloneExaminationQuestion,
  adminGetStandaloneExaminationListing,
} from '../../../services';
import { getDuration } from '../../../utils';
import dayjs from 'dayjs';
import { useTableRows } from '../../../hooks';

const tableProps = {
  filterControls: [
    {
      triggerText: 'Sort',
      queryKey: 'sort',
      triggerIcon: <FaSortAmountUpAlt />,
      width: '200px',
      position: 'right-bottom',
      // noFilterTags: true,
      body: {
        radios: [
          {
            label: 'Alphabetically: ascending',
            queryValue: 'asc',
            additionalParams: { date: false },
          },
          {
            label: 'Alphabetically: descending',
            queryValue: 'desc',
            additionalParams: { date: false },
          },
          {
            label: 'Date: ascending',
            queryValue: 'asc',
            additionalParams: { date: true },
          },
          {
            label: 'Date: descending',
            queryValue: 'desc',
            additionalParams: { date: true },
          },
        ],
      },
    },
  ],

  columns: [
    {
      id: '2',
      key: 'title',
      text: 'Examination Title',
      fraction: '2fr',
      renderContent: (data) => (
        <Link
          href={`/admin/standalone-exams/overview?examination=${data.examinationId}`}
        >
          <Text>{data.text}</Text>
        </Link>
      ),
    },
    {
      id: '3',
      key: 'noOfUsers',
      text: 'No. of Candidates',
      fraction: '200px',
    },
    {
      id: '4',
      key: 'startDate',
      text: 'Start Date',
      fraction: '200px',
    },
    {
      id: '5',
      key: 'duration',
      text: 'Duration',
      fraction: '150px',
    },
    {
      id: '6',
      key: 'status',
      text: 'Status',
      fraction: '150px',
      renderContent: (status) => (
        <Box>
          <Tag
            borderRadius="full"
            size="sm"
            backgroundColor={status ? 'accent.4' : 'accent.1'}
            color={status ? 'accent.5' : 'accent.3'}
          >
            <Text bold>{status ? 'Published' : 'UnPublished'}</Text>
          </Tag>
        </Box>
      ),
    },
  ],

  options: {
    action: [
      {
        text: 'Edit',
        link: (examination) =>
          `/admin/standalone-exams/overview/?examination=${examination.id}`,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedExaminations) => {
      await adminDeleteStandaloneExaminationQuestion(
        selectedExaminations[0]?.id
      );
    },
    pagination: true,
  },
};

const ParticipantsListingPage = () => {
  const mapExaminationToRow = (examination) => ({
    id: examination.id,
    // courseId,
    title: {
      text: examination.title,
      examinationId: examination.id,
      // courseId,
    },
    startDate: dayjs(examination.startTime).format('DD/MM/YYYY h:mm a'),
    duration: getDuration(examination.duration).combinedText,
    noOfUsers: examination.noOfUsers,
    status: examination.isPublished,
  });

  const fetcher = (props) => async () => {
    const { examinations, showingDocumentsCount, totalDocumentsCount } =
      await adminGetStandaloneExaminationListing(props?.params);

    const rows = examinations.map(mapExaminationToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <Box marginLeft="20px" marginRight="25px" marginTop="20px">
      <Box
        display="flex"
        flexDirection={{ base: 'column', md: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'flex-start', lg: 'center' }}
        paddingBottom={5}
        gap={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          By Examination
        </Heading>

        <Button link={`/admin/standalone-exams/participants/create`}>
          Add Participants
        </Button>
      </Box>

      <Table
        {...tableProps}
        placeholder="Title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
      <Box
        display="flex"
        flexDirection={{ base: 'column', md: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'flex-start', lg: 'center' }}
        paddingBottom={5}
        gap={5}
        marginTop="20px"
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          By Users
        </Heading>
      </Box>

      <Table
        {...tableProps}
        placeholder="Title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </Box>
  );
};

export const ParticipantsListingPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ParticipantsListingPage {...props} />}
    />
  );
};

export default ParticipantsListingPageRoute;
