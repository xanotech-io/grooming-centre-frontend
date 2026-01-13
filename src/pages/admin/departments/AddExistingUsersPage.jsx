import { useState } from "react";
import { Flex, Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { Route, useParams, useHistory } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import {
  Button,
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from "../../../components";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useTableRows } from "../../../hooks";
import { useApp } from "../../../contexts";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetUserListing,
  adminAddSelectedUsersToDepartment,
} from "../../../services";

const AddExistingUsersPage = () => {
  const { departmentId } = useParams();
  const { getOneMetadata } = useApp();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddingUsers, setIsAddingUsers] = useState(false);
  const toast = useToast();
  const { push } = useHistory();

  const department = getOneMetadata("departments", departmentId);
  const appManager = useApp();

  const departmentName = appManager.state.metadata?.departments.map(
    (department) => department.name
  );

  // Custom selection handler that updates in real-time
  const handleSelectionChange = (selectedUsers) => {
    setSelectedUsers(selectedUsers);
    console.log("Selection updated:", selectedUsers.map(user => user.id));
  };

  const tableProps = {
    filterControls: [
      {
        triggerText: "%Grade point",
        queryKey: "grade",
        width: "125%",
        body: {
          radios: [
            { label: "1 to 30", queryValue: "1-30" },
            { label: "31 to 50", queryValue: "31-50" },
            { label: "51 to 70", queryValue: "51-70" },
            {
              label: "71 to 100",
              queryValue: "71-100",
            },
          ],
        },
      },
      {
        triggerText: "Department",
        queryKey: "department",
        width: "125%",
        body: {
          checks: [
            ...(departmentName?.map((name) => ({
              label: name,
              queryValue: name,
            })) || []),
          ],
        },
      },
      {
        triggerText: "Role",
        queryKey: "role",
        width: "170%",
        body: {
          checks: [
            { label: "Super Admin", queryValue: "super admin" },
            { label: "Admin", queryValue: "admin" },
            { label: "User", queryValue: "user" },
          ],
        },
      },
      {
        triggerText: "Sort",
        queryKey: "sort",
        triggerIcon: <FaSortAmountUpAlt />,
        width: "200px",
        position: "right-bottom",
        body: {
          radios: [
            {
              label: "Alphabetically: ascending",
              queryValue: "asc",
              additionalParams: { date: false },
            },
            {
              label: "Alphabetically: descending",
              queryValue: "desc",
              additionalParams: { date: false },
            },
            {
              label: "Date: ascending",
              queryValue: "asc",
              additionalParams: { date: true },
            },
            {
              label: "Date: descending",
              queryValue: "desc",
              additionalParams: { date: true },
            },
          ],
        },
      },
    ],

    columns: [
      {
        id: "1",
        key: "userId",
        text: "User ID",
        fraction: "100px",
        renderContent: (data) => (
          <Text>{data.text}</Text>
        ),
      },
      {
        id: "2",
        key: "fullName",
        text: "Full name",
        fraction: "200px",
        renderContent: (data) => (
          <Text>{data.text}</Text>
        ),
      },
      { id: "3", key: "department", text: "Department", fraction: "200px" },
      { id: "4", key: "noOfDepartments", text: "No. of Departments", fraction: "150px" },
      {
        id: "5",
        key: "email",
        text: "Email Address",
        fraction: "250px",
      },
      { id: "6", key: "gradePoint", text: "GP (%)", fraction: "75px" },
    ],

    options: {
      selection: true,
      multipleDeleteFetcher: async (selectedUsers) => {
        console.log("Action button clicked for users:", selectedUsers.map(user => user.id));
        console.log("Department ID:", departmentId);
        
        // For now, just show a toast with the information
        toast({
          description: `Selected ${selectedUsers.length} users for department: ${department?.name}`,
          position: "top",
          status: "info",
        });
      },
      selectionLabel: "Add Selected Users", // Custom label for the selection button
      pagination: true,
    },
  };

  const mapUserToRow = (user) => ({
    ...user,
    fullName: {
      text: `${user.firstName} ${user.lastName}`,
      userId: user.id,
    },
    userId: {
      text: `${user.displayId}`,
      userId: user.id,
    },
    department: user.departmentName,
    noOfDepartments: user.departmentNumber,
    certificates: user.noOfCertificate,
  });

  const fetcher = (props) => async () => {
    const { users, showingDocumentsCount, totalDocumentsCount } =
      await adminGetUserListing(props?.params);

    const rows = users.map(mapUserToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  const handleAddUsersClick = async () => {
    console.log("Selected User IDs:", selectedUsers.map(user => user.id));
    console.log("Department ID:", departmentId);
    console.log("Department Name:", department?.name);
    
    if (selectedUsers.length === 0) {
      toast({
        description: "Please select at least one user to add",
        position: "top",
        status: "warning",
      });
      return;
    }

    setIsAddingUsers(true);

    try {
      const userIds = selectedUsers.map(user => user.id);
      const { message, data } = await adminAddSelectedUsersToDepartment(departmentId, userIds);
      
      // Show detailed results
      if (data.successful > 0 && data.errors === 0) {
        toast({
          description: `Successfully added ${data.successful} user(s) to ${data.departmentName}`,
          position: "top",
          status: "success",
        });
        
        // Navigate back to department details
        push(`/admin/departments/details/${departmentId}/info`);
      } else if (data.successful > 0 && data.errors > 0) {
        toast({
          description: `Partially completed: ${data.successful} users added, ${data.errors} failed. Check console for details.`,
          position: "top",
          status: "warning",
        });
        
        // Log error details for debugging
        console.log("Error details:", data.errorDetails);
        
        // Clear selection for failed users
        setSelectedUsers([]);
      } else {
        toast({
          description: `Failed to add users: ${data.errorDetails.join(', ')}`,
          position: "top",
          status: "error",
        });
        
        console.log("All errors:", data.errorDetails);
      }
      
    } catch (error) {
      console.error("Error adding users to department:", error);
      toast({
        description: `Error: ${error.message || 'Failed to add users to department'}`,
        position: "top",
        status: "error",
      });
    } finally {
      setIsAddingUsers(false);
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/departments">Departments</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem>
              <Link href={`/admin/departments/details/${departmentId}/info`}>{department?.name}</Link>
            </BreadcrumbItem>
          }
          item4={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Add Existing Users</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Heading fontSize="heading.h3" paddingX={6} marginBottom={4}>
        Add Multiple Users to {department?.name}
      </Heading>

      <Box
        marginX={6}
        padding={6}
        marginY={6}
        border="1px"
        borderColor="accent.9"
        borderRadius="md"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          marginBottom={6}
          flexDirection={{ lg: "row", base: "column", md: "column" }}
          rowGap={4}
        >
          <Heading fontSize="heading.h4">
            Select Users to Add to {department?.name}
          </Heading>
          
          <Flex gap={4}>
            <Button 
              variant="outline" 
              onClick={() => push(`/admin/departments/details/${departmentId}/info`)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddUsersClick}
              colorScheme="blue"
              isDisabled={selectedUsers.length === 0}
              isLoading={isAddingUsers}
              loadingText="Adding Users..."
            >
              Add Selected Users ({selectedUsers.length})
            </Button>
          </Flex>
        </Flex>

        <Table
          {...tableProps}
          placeholder="Search by name, email, department..."
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          onSelectionChange={handleSelectionChange}
          selectionButtonText="Add Selected Users"
        />
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const AddExistingUsersPageRoute = ({ component: Component, ...rest }) => {
  return (
    <Route 
      {...rest} 
      render={(props) => <AddExistingUsersPage {...props} />} 
    />
  );
};

export default AddExistingUsersPage;
