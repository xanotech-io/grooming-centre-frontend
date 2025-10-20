import { Box } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { Route } from 'react-router-dom';
import { useToast } from '@chakra-ui/toast';
import { Button, Heading } from '../../../components';
import { HEADING, HEADING_DEPARTMENTS } from '../../../constants';
import { useQueryParams } from '../../../hooks';
import {
  deleteStandaloneExaminationParticipants,
  getStandaloneExaminationParticipants,
} from '../../../services';
import { capitalizeFirstLetter } from '../../../utils';
import ParticipantsPagination from './ParticipantsPagination';
import { useHistory } from 'react-router-dom';

const ParticipantsListingPage = () => {
  const toast = useToast();
  const push = useHistory();
  const examinationId = useQueryParams().get('examination');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [depsCurrentPage, setDepsCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [depsRecordsPerPage, setDepsRecordsPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const [details, setDetails] = useState({
    loading: false,
    err: null,
  });

  const handleDelete = async (id) => {
    try {
      const { message } = await deleteStandaloneExaminationParticipants(id);
      toast({
        description: capitalizeFirstLetter(message),
        position: 'top',
        status: 'success',
      });
      // Refresh the current page after deletion
      getParticipants();
    } catch (error) {
      toast({
        description: error.message,
        position: 'top',
        status: 'error',
      });
    }
  };

  const getParticipants = useCallback(async () => {
    setDetails({ loading: true });
    try {
      const params = {
        page: currentPage,
        length: recordsPerPage,
        depsPage: depsCurrentPage,
        depsLength: depsRecordsPerPage,
      };
      
      const { users, departments, pagination } = await getStandaloneExaminationParticipants(
        examinationId,
        params
      );
      
      setUsers(users || []);
      setDepartments(departments || []);
      
      // Use pagination info from API if available
      if (pagination) {
        setTotalUsers(pagination.users?.totalCount || 0);
        setTotalDepartments(pagination.departments?.totalCount || 0);
      } else {
        // Fallback to array length
        setTotalUsers(users?.length || 0);
        setTotalDepartments(departments?.length || 0);
      }
      
      setDetails({ loading: false });
    } catch (error) {
      setDetails({ err: error.message });
      setDetails({ loading: false });
    }
  }, [examinationId, currentPage, recordsPerPage, depsCurrentPage, depsRecordsPerPage]);

  useEffect(() => {
    getParticipants();
  }, [getParticipants]);

  // Since we're doing server-side pagination, we don't need to slice the data
  const usersRecord = users;
  const depsRecord = departments;

  const npages = Math.ceil(totalUsers / recordsPerPage);
  const nDepspages = Math.ceil(totalDepartments / depsRecordsPerPage);

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
        <Heading as="h1" fontSize="heading.h4">
          By Users
        </Heading>

        <Button
          link={`/admin/standalone-exams/participants/create?examination=${examinationId}`}
        >
          Add Participants
        </Button>
      </Box>

      {/* for users */}
      <div className="users_details">
        {details.loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : (
          <>
            <table className="content-table">
              <thead>
                <tr>
                  {HEADING.map((item, i) => (
                    <th key={i}>{item?.desc}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usersRecord?.map((item, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                    <td>{item?.firstName}</td>
                    <td>{item?.lastName}</td>
                    <td>{item?.username}</td>
                    <td>{item?.email}</td>
                    <td>{item?.gender}</td>
                    <td>
                      <div
                        style={{
                          backgroundColor: 'red',
                          padding: '5px',
                          textAlign: 'center',
                          borderRadius: '5px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDelete(item?.id)}
                      >
                        Delete
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ParticipantsPagination
              documentCount={usersRecord?.length}
              totalCount={totalUsers}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              recordsPerPage={recordsPerPage}
              setRecordsPerPage={setRecordsPerPage}
              firstIndex={(currentPage - 1) * recordsPerPage + 1}
              lastIndex={Math.min(currentPage * recordsPerPage, totalUsers)}
              nPages={npages}
              name={'user'}
            />
          </>
        )}
      </div>

      {/* for departments */}

      <Box
        display="flex"
        flexDirection={{ base: 'column', md: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'flex-start', lg: 'center' }}
        paddingBottom={5}
        gap={5}
        marginTop="50px"
      >
        <Heading as="h1" fontSize="heading.h4">
          By Departments
        </Heading>
      </Box>

      <div className="users_details">
        {details.loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : (
          <>
            <table className="content-table">
              <thead>
                <tr>
                  {HEADING_DEPARTMENTS?.map((item) => (
                    <th key={item?.id}>{item?.desc}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {depsRecord?.map((item, index) => (
                  <tr key={index}>
                    <td>{(depsCurrentPage - 1) * depsRecordsPerPage + index + 1}</td>
                    <td>{item?.name}</td>
                    <td>
                      <div
                        style={{
                          backgroundColor: 'red',
                          padding: '5px',
                          textAlign: 'center',
                          borderRadius: '5px',
                          width: '50%',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDelete(item?.id)}
                      >
                        Delete
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ParticipantsPagination
              documentCount={depsRecord?.length}
              totalCount={totalDepartments}
              nPages={nDepspages}
              currentPage={depsCurrentPage}
              setCurrentPage={setDepsCurrentPage}
              recordsPerPage={depsRecordsPerPage}
              setRecordsPerPage={setDepsRecordsPerPage}
              firstIndex={(depsCurrentPage - 1) * depsRecordsPerPage + 1}
              lastIndex={Math.min(depsCurrentPage * depsRecordsPerPage, totalDepartments)}
              name={'docs'}
            />
          </>
        )}
      </div>
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
