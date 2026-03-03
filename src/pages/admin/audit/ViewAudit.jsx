import { useState } from 'react';
import { Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/layout';
import { BreadcrumbItem } from '@chakra-ui/react';
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
  Spinner,
} from '../../../components';
import { FaSortAmountUpAlt, FaUser, FaClock, FaTrash } from 'react-icons/fa';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import { useToast } from '@chakra-ui/toast';
import { EmptyState } from '../../../layouts';
import { Avatar } from '@chakra-ui/avatar';
import { useTableRows } from '../../../hooks';
import { http } from '../../../services/http/http';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ViewAudit = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalDocumentsCount, setTotalDocumentsCount] = useState(0);

  // Fetch audit data using http.get
  const fetchAuditData = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await http.get('/admin/user-audit', { params });

      // Transform the data to match table format
      const rows = response.data.data.rows?.map(mapAuditToRow) || [];

      const result = { 
        rows, 
        showingDocumentsCount: response.data.data.showingDocumentsCount || 0,
        totalDocumentsCount: response.data.data.totalDocumentsCount || 0,
        currentPage: response.data.data.currentPage || 1,
        totalPages: response.data.data.totalPages || 1
      };
      
      // Update the total documents count state
      setTotalDocumentsCount(result.totalDocumentsCount);
      
      return result;
    } catch (error) {
      console.error('Error fetching audit data:', error);
      setError(error.message);
      toast({
        description: 'Failed to load audit data',
        position: 'top',
        status: 'error',
      });
      return { rows: [], showingDocumentsCount: 0, totalDocumentsCount: 0, currentPage: 1, totalPages: 1 };
    } finally {
      setIsLoading(false);
    }
  };

  const mapAuditToRow = (audit) => ({
    id: audit.id,
    user: {
      firstName: audit.firstName,
      lastName: audit.lastName,
      username: audit.username,
      email: audit.email,
      id: audit.userId,
      avatar: null, // No avatar in the API response
    },
    userRole: audit.userRole,
    departments: audit.departmentsArray || [],
    gender: audit.gender,
    action: audit.action,
    lastLogin: audit.userUpdatedAt, // Using userUpdatedAt as last activity
    createdAt: audit.createdAt,
    updatedAt: audit.updatedAt,
    displayId: audit.displayId,
  });

  // Delete single audit log
  const deleteAuditLog = async (auditId) => {
    try {
      setIsDeleting(true);
      await http.delete(`/admin/user-audit/${auditId}`);
      
      toast({
        description: 'Audit log deleted successfully',
        position: 'top',
        status: 'success',
      });
      
      // Refresh the data
      fetchRowItems();
    } catch (error) {
      console.error('Error deleting audit log:', error);
      toast({
        description: 'Failed to delete audit log',
        position: 'top',
        status: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete all audit logs
  const deleteAllAuditLogs = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete all audit logs? This action cannot be undone.');
    
    if (!isConfirmed) return;

    try {
      setIsDeleting(true);
      await http.delete('/admin/user-audit');
      
      toast({
        description: 'All audit logs deleted successfully',
        position: 'top',
        status: 'success',
      });
      
      // Refresh the data
      fetchRowItems();
    } catch (error) {
      console.error('Error deleting all audit logs:', error);
      toast({
        description: 'Failed to delete all audit logs',
        position: 'top',
        status: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const tableProps = {
    searchKey: "search", // Add search support
    filterControls: [
      {
        triggerText: "User Role",
        queryKey: "userRole",
        width: "200px",
        body: {
          checks: [
            { label: "Admin", queryValue: "admin" },
            { label: "Super Admin", queryValue: "super admin" },
            { label: "User", queryValue: "user" },
            { label: "Instructor", queryValue: "instructor" },
          ],
        },
      },
      {
        triggerText: "Gender",
        queryKey: "gender",
        width: "150px",
        body: {
          checks: [
            { label: "Male", queryValue: "male" },
            { label: "Female", queryValue: "female" },
          ],
        },
      },
      {
        triggerText: "Action",
        queryKey: "action",
        width: "150px",
        body: {
          checks: [
            { label: "Login", queryValue: "login" },
            { label: "Logout", queryValue: "logout" },
            { label: "Create", queryValue: "create" },
            { label: "Update", queryValue: "update" },
            { label: "Delete", queryValue: "delete" },
          ],
        },
      },
      {
        triggerText: "Sort",
        queryKey: "sort",
        triggerIcon: <FaSortAmountUpAlt />,
        width: "250px",
        position: "right-bottom",
        body: {
          radios: [
            {
              label: "Name: A-Z",
              queryValue: "asc",
              additionalParams: { sortBy: "firstName" },
            },
            {
              label: "Name: Z-A", 
              queryValue: "desc",
              additionalParams: { sortBy: "firstName" },
            },
            {
              label: "Recent Activity",
              queryValue: "desc",
              additionalParams: { sortBy: "createdAt" },
            },
            {
              label: "Oldest Activity",
              queryValue: "asc", 
              additionalParams: { sortBy: "createdAt" },
            },
            {
              label: "User Created: Newest",
              queryValue: "desc",
              additionalParams: { sortBy: "userCreatedAt" },
            },
            {
              label: "User Created: Oldest",
              queryValue: "asc",
              additionalParams: { sortBy: "userCreatedAt" },
            },
          ],
        },
      },
    ],

    columns: [
      {
        id: "user",
        key: "user",
        text: "User Information",
        fraction: "350px",
        renderContent: (userData) => (
          <Flex alignItems="center" gap={3}>
            <Avatar
              size="sm"
              name={`${userData.firstName} ${userData.lastName}`}
              src={userData.avatar}
            />
            <Box>
              <Text fontWeight="semibold" fontSize="sm" color="gray.700">
                {userData.firstName} {userData.lastName}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {userData.email}
              </Text>
            </Box>
          </Flex>
        ),
      },
      {
        id: "userRole",
        key: "userRole",
        text: "Role",
        fraction: "150px",
        renderContent: (role) => (
          <Text fontSize="sm" textTransform="capitalize" color="gray.700">
            {role || 'N/A'}
          </Text>
        ),
      },
      {
        id: "action",
        key: "action",
        text: "Action",
        fraction: "150px",
        renderContent: (action) => (
          <Text fontSize="sm" textTransform="capitalize" color="gray.700">
            {action || 'N/A'}
          </Text>
        ),
      },
      {
        id: "departments",
        key: "departments", 
        text: "No of departments",
        fraction: "300px",
        renderContent: (departments) => (
          <Box>
            {departments.length > 0 ? (
              <Text fontSize="sm" color="gray.700">
                {departments.join(', ')}
              </Text>
            ) : (
              <Text fontSize="sm" color="gray.400">No departments</Text>
            )}
          </Box>
        ),
      },
      {
        id: "createdAt",
        key: "createdAt",
        text: "Activity Time",
        fraction: "180px",
        renderContent: (createdAt) => (
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              {dayjs(createdAt).format('DD/MM/YYYY')}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {dayjs(createdAt).format('h:mm A')}
            </Text>
          </Box>
        ),
      },
      {
        id: "gender",
        key: "gender", 
        text: "Gender",
        fraction: "100px",
        renderContent: (gender) => (
          <Text fontSize="sm" textTransform="capitalize" color="gray.600">
            {gender || 'N/A'}
          </Text>
        ),
      },
    ],

    options: {
      action: [
        {
          text: "View Profile",
          link: (audit) => `/admin/users/details/${audit.user.id}/profile`,
        },
        {
          text: "Delete Log",
          color: "red.500",
          onClick: (audit) => deleteAuditLog(audit.id),
          icon: <FaTrash size="12" />,
          isLoading: isDeleting,
        },
      ],
      selection: false, // Disable selection for audit logs
      pagination: true,
    },
  };

  const fetcher = (props) => async () => {
    return await fetchAuditData(props?.params);
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/audit">Audit Logs</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3" marginBottom={2}>
            User Audit Logs
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Monitor user activity, login patterns, and account information
          </Text>
        </Box>

        <Flex alignItems="center" gap={4}>
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            leftIcon={<FaTrash />}
            onClick={deleteAllAuditLogs}
            isLoading={isDeleting}
            loadingText="Deleting..."
          >
            Delete All Logs
          </Button>
          
          <Box textAlign="right">
            <Flex alignItems="center" gap={2} marginBottom={1}>
              <FaUser size="14" color="#666" />
              <Text fontSize="sm" color="gray.600">
                Total Logs: {totalDocumentsCount}
              </Text>
            </Flex>
            <Flex alignItems="center" gap={2}>
              <FaClock size="14" color="#666" />
              <Text fontSize="xs" color="gray.500">
                Last updated: {dayjs().format('DD/MM/YYYY h:mm A')}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>

      {isLoading && rows.length === 0 ? (
        <Flex
          height="400px"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" color="primary.base" />
          <Text marginTop={4} color="gray.600">
            Loading audit data...
          </Text>
        </Flex>
      ) : error ? (
        <EmptyState
          cta={<Button onClick={fetchRowItems}>Try Again</Button>}
          heading="Failed to load audit data"
          description={error}
        />
      ) : (
        <Table
          {...tableProps}
          placeholder="Search by name, username, email, or action"
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          isLoading={isLoading}
        />
      )}
    </AdminMainAreaWrapper>
  );
};

export const ViewAuditRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ViewAudit {...props} />} />;
};

export default ViewAuditRoute;
