import { Flex } from "@chakra-ui/layout";
import { Route } from "react-router-dom";
import { FaSortAmountUpAlt } from "react-icons/fa";
import {
  Button,
  Heading,
  Table,
  Text,
  Breadcrumb,
  Link,
} from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminDeleteDepartment,
  adminDeleteMultipleCourses,
  adminGetDepartmentListing,
} from "../../../services";
import { BreadcrumbItem } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useTableRows } from "../../../hooks";
import { useApp } from "../../../contexts";

const DepartmentListingPage = () => {
  const appManager = useApp();

  const departmentName = appManager.state.metadata?.departments.map(
    (department) => department.name
  );

  const tableProps = {
    filterControls: [
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
        id: "2",
        key: "title",
        text: "Title",
        fraction: "2fr",
        renderContent: (data) => (
          <Link href={`/admin/departments/details/${data.departmentId}/info`}>
            <Text>{data.text}</Text>
          </Link>
        ),
      },
      {
        id: "4",
        key: "createdAt",
        text: "Created at",
        fraction: "200px",
      },
      {
        id: "5",
        key: "noOfusers",
        text: "No of Users",
        fraction: "150px",
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (department) =>
            `/admin/departments/details/${department.id}/info`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedDepartments) => {
        let format = [];
        format.push(selectedDepartments.map((datum) => datum.id));
        
        await adminDeleteDepartment(selectedDepartments);
      },
      pagination: true,
    },
  };
  const mapDepartmentToRow = (department) => ({
    id: department.id,
    title: { text: department.name, departmentId: department.id },
    createdAt: dayjs(department.createdAt).format("DD/MM/YYYY h:mm a"),
    noOfusers: department.noOfusers,
  });

  const fetcher = (props) => async () => {
    const { departments, showingDocumentsCount, totalDocumentsCount } =
      await adminGetDepartmentListing(props?.params);

    const rows = departments.map(mapDepartmentToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Departments</Link>
          </BreadcrumbItem>
        }
      />
      <Flex
        justifyContent={{
          lg: "space-between",
          md: "flex-start",
          base: "flex-start",
        }}
        alignItems={{ lg: "center", md: "flex-start", base: "flex-start" }}
        flexDirection={{ lg: "row", md: "column", base: "column" }}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        rowGap={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Departments
        </Heading>

          <Flex gap={4}>
            <Button link={`/admin/departments/create`}>Add Department</Button>
            <Button link={`/admin/departments/bulk-action`}>Bulk Action</Button>
          </Flex>
        
      </Flex>

      <Table
        {...tableProps}
        placeholder="Title"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const DepartmentListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <DepartmentListingPage {...props} />} />
  );
};

export default DepartmentListingPage;
