import { Box, Flex } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import { FaSortAmountUpAlt } from 'react-icons/fa';
import {
  Button,
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from '../../../components';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import {
  adminDeleteMultipleCourses,
  adminGetStandaloneExaminationParticipants,
} from '../../../services';
import { BreadcrumbItem } from '@chakra-ui/react';
import { useTableRows } from '../../../hooks';
import { FiEdit } from 'react-icons/fi';
import { useParams } from 'react-router-dom';

const tableProps = {
  filterControls: [
    {
      triggerText: 'Grade',
      queryKey: 'grade',
      width: '125%',
      body: {
        radios: [
          { label: 'A', queryValue: 'A' },
          { label: 'B', queryValue: 'B' },
          { label: 'C', queryValue: 'C' },
          { label: 'E', queryValue: 'E' },
          { label: 'D', queryValue: 'D' },
          { label: 'F', queryValue: 'F' },
        ],
      },
    },

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
      id: '1',
      key: 'fullName',
      text: 'Full name',
      renderContent: (data) => (
        <Link href={`/admin/users/details/${data.userId}/profile`}>
          <Text>{data.text}</Text>
        </Link>
      ),
    },
    { id: '2', key: 'department', text: 'Department' },
    {
      id: '3',
      key: 'email',
      text: 'Email Address',
    },
    { id: '4', key: 'grade', text: 'Grade' },
  ],

  options: {
    action: [
      {
        text: 'View',
        link: (user) => `/admin/users/details/${user.id}/profile`,
      },
      {
        text: 'Edit',
        link: (user) => `/admin/users/edit/${user.id}`,
      },
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedUsers) => {
      console.log(selectedUsers);
      await adminDeleteMultipleCourses();
    },
    pagination: true,
  },
};

const StandaloneExaminationAllParticipantsPage = () => {
  const mapUserToRow = (user) => ({
    ...user,
    fullName: {
      text: `${user.firstName} ${user.lastName}`,
      userId: user.id,
    },
    department: user.departmentName,
  });

  const { examinationId, examinationName } = useParams();

  const fetcher = (props) => async () => {
    const { users, showingDocumentsCount, totalDocumentsCount } =
      await adminGetStandaloneExaminationParticipants(
        examinationId,
        props?.params
      );

    const rows = users.map(mapUserToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem>
            <Link href="/admin/standalone-exams">Standalone Examination</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">All Participants</Link>
          </BreadcrumbItem>
        }
      />
      <Box
        display="flex"
        justifyContent={{
          base: 'flex-start',
          md: 'flex-start',
          lg: 'space-between',
        }}
        alignItems={{ base: 'flex-start', md: 'flex-start', lg: 'center' }}
        flexDirection={{ base: 'column', md: 'column', lg: 'row' }}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
        gap={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          {examinationName}
        </Heading>

        <Button
          link={`/admin/courses/not-set/assessment/not-set/overview?examination=${examinationId}&examinationName=${examinationName}`}
          leftIcon={<FiEdit />}
        >
          Edit
        </Button>
      </Box>

      <Heading as="h1" fontSize="heading.h4" mb={10}>
        All Participants
      </Heading>

      <Table
        {...tableProps}
        placeholder="Name, email"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const StandaloneExaminationAllParticipantsPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <StandaloneExaminationAllParticipantsPage {...props} />
      )}
    />
  );
};

export default StandaloneExaminationAllParticipantsPage;
