import { Flex } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { Badge } from "@chakra-ui/react";
import {
  Button,
  Heading,
  Table,
  Breadcrumb,
  Link,
  Text,
} from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteMultipleUsers,
  adminGetUserListing,
} from "../../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import { useTableRows } from "../../../../hooks";
import { useApp } from "../../../../contexts";

const UserListingPage = () => {
  const appManager = useApp();

  const departmentName = appManager.state.metadata?.departments.map(
    (department) => department.name
  );

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
        // noFilterTags: true,
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
          <Link href={`/admin/users/details/${data.userId}/profile`}>
            <Text>{data.text}</Text>
          </Link>
        ),
      },
      {
        id: "2",
        key: "fullName",
        text: "Full name",
        fraction: "200px",
        renderContent: (data) => (
          <Link href={`/admin/users/details/${data.userId}/profile`}>
            <Text>{data.text}</Text>
          </Link>
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
      { 
        id: "7", 
        key: "status", 
        text: "Status", 
        fraction: "100px",
        renderContent: (data) => {
          const isActive = data.active || data.status?.active || (data.text === "Approved");
          return (
            <Badge 
              colorScheme={isActive ? "green" : "orange"}
              variant="solid"
            >
              {isActive ? "Approved" : "Pending"}
            </Badge>
          );
        },
      },
      // { id: '6', key: 'certificates', text: 'Certificates', fraction: '75px', },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (user) => `/admin/users/details/${user.id}/profile`,
        },
        {
          text: "Edit",
          link: (user) => `/admin/users/edit/${user.id}`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedUsers) => {
        await adminDeleteMultipleUsers(selectedUsers);
      },
      pagination: true,
    },
  };

  const mapUserToRow = (user) => {
    const mappedUser = {
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
      status: {
        active: user.active,
        text: user.active ? "Approved" : "Pending",
      },
    };
    return mappedUser;
  };

  const fetcher = (props) => async () => {
    const { users, showingDocumentsCount, totalDocumentsCount } =
      await adminGetUserListing(props?.params);

    const rows = users.map(mapUserToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Users</Link>
          </BreadcrumbItem>
        }
      />
      <Flex
        justifyContent="space-between"
        flexDirection={{ lg: "row", base: "column", md: "column" }}
        alignItems={{ base: "flex-start", md: "flex-start" }}
        rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Manage Users
        </Heading>

        <Button link="/admin/users/edit/new">Add User</Button>
      </Flex>

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

export const UserListingPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <UserListingPage {...props} />} />;
};

export default UserListingPage;
