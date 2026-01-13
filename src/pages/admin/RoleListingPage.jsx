import { BreadcrumbItem } from '@chakra-ui/breadcrumb';
import { Box } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import { Breadcrumb, Heading, Link, Table } from '../../components';
import { useTableRows } from '../../hooks';
import { AdminMainAreaWrapper } from '../../layouts/admin/MainArea/Wrapper';
import { adminGetRoleListing } from '../../services';

const tableProps = {
  filterControls: [],

  columns: [
    {
      id: '2',
      key: 'name',
      text: 'Title',
      fraction: '1fr',
    },
    {
      id: '4',
      key: 'noOfUsers',
      text: 'No users',
      fraction: '150px',
    },
  ],

  options: {
    // action: false,
    selection: true,
  },
  pagination: true,
};

const RolesPage = () => {
  const mapRoleToRow = (role) => ({
    id: role.id,
    name: role.name,
    noOfUsers: role.noOfUsers,
  });

  const fetcher = () => async () => {
    const { roles } = await adminGetRoleListing();

    const rows = roles.map(mapRoleToRow);

    return { rows };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Roles</Link>
          </BreadcrumbItem>
        }
      />
      <Box padding={10} marginY={10} border="1px" borderColor="accent.9">
        <Heading fontSize="heading.h4" paddingBottom={4}>
          Roles
        </Heading>

        <Table
          width="100%"
          SearchBarVisibility="none"
          {...tableProps}
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const RolesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <RolesPage {...props} />} />;
};
