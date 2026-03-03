import { Breadcrumb, Button, Heading, Link, Table } from "../../../components";
import { BreadcrumbItem, Box, Flex } from "@chakra-ui/react";
import { Route, useParams } from "react-router";
import { useApp } from "../../../contexts";
import { useTableRows } from "../../../hooks";
import {
  adminDeleteMultipleCourses,
  adminGetDepartmentUsersListing,
} from "../../../services";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";

const tableProps = {
  filterControls: [],

  columns: [
    {
      id: "2",
      key: "name",
      text: "Name",
      fraction: "1fr",
    },
    {
      id: "4",
      key: "email",
      text: "Email",
      fraction: "300px",
    },
    {
      id: "5",
      key: "roles",
      text: "Roles",
      fraction: "180px",
    },
  ],

  options: {
    action: [
      {
        isDelete: true,
      },
    ],
    selection: true,
    multipleDeleteFetcher: async (selectedDepartments) => {
      console.log(selectedDepartments);
      await adminDeleteMultipleCourses();
    },
    pagination: true,
  },
};

const ViewDepartmentPage = () => {
  const { departmentId } = useParams();
  const { getOneMetadata } = useApp();

  const department = getOneMetadata("departments", departmentId);

  const mapDepartmentUserToRow = (user) => ({
    id: user.id,
    name: user.firstName + " " + user.lastName,
    email: user.email,
    roles: user.userRoleName,
  });

  const fetcher = (props) => async () => {
    const { users, showingDocumentsCount, totalDocumentsCount } =
      await adminGetDepartmentUsersListing(departmentId, props?.params);

    const rows = users.map(mapDepartmentUserToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

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
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{department?.name}</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <Heading fontSize="heading.h3" paddingX={6}>
        {department?.name}
      </Heading>

      <Box
        marginX={6}
        padding={10}
        marginY={10}
        border="1px"
        borderColor="accent.9"
      >
        <Flex justifyContent="space-between">
          <Heading fontSize="heading.h4">Users</Heading>
          <Flex gap={4}>
            <Button link={`/admin/users/edit/new`}>Add New User</Button>
            <Button link={`/admin/departments/${departmentId}/add-existing-users`}>Add Existing User</Button>
          </Flex>
        </Flex>
        <Table
          width="100%"
          {...tableProps}
          placeholder="Name, email, role"
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const ViewDepartmentPageRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={(props) => <ViewDepartmentPage {...props} />} />
  );
};
