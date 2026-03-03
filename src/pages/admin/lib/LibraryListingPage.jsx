import { BreadcrumbItem } from "@chakra-ui/breadcrumb";
import { Flex } from "@chakra-ui/layout";
import { FaSortAmountUpAlt } from "react-icons/fa";
import { Route } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Heading,
  Link,
  Table,
  Text,
} from "../../../components";
import { useApp } from "../../../contexts";
import { useTableRows } from "../../../hooks";
import { AdminMainAreaWrapper } from "../../../layouts";
import {
  adminDeleteMultipleLibraryFiles,
  adminLibraryListing,
} from "../../../services";

const LibraryListingPage = () => {
  const appManager = useApp();

  const department = appManager.state.metadata?.departments.map(
    (department) => department
  );

  const tableProps = {
    filterControls: [
      // {
      //   triggerText: "Type",
      //   queryKey: "type",
      //   width: "170%",
      //   body: {
      //     radios: [
      //       { label: "Video", queryValue: "video" },
      //       { label: "Audio", queryValue: "audio" },
      //       { label: "Pdf", queryValue: "pdf" },
      //     ],
      //   },
      // },
      {
        triggerText: "Department",
        queryKey: "department",
        width: "125%",
        body: {
          checks: [
            ...(department?.map(({ name, id }) => ({
              label: name,
              queryValue: id,
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
        id: "1",
        key: "title",
        text: "Title",
        renderContent: (data) => (
          <Link href={`/admin/library/details/${data.libraryId}`}>
            <Text>{data.text}</Text>
          </Link>
        ),
      },
      {
        id: "2",
        key: "department",
        text: "Department",
        renderContent: (departmentId) =>
          appManager.getOneMetadata("departments", departmentId, {
            allMetadata: true,
          })?.name,
      },
      {
        id: "3",
        key: "type",
        text: "Type",
      },
      {
        id: "4",
        key: "instructor",
        text: "Uploaded By",
        fraction: "200px",
      },
    ],

    options: {
      action: [
        {
          text: "View",
          link: (library) => `/admin/library/details/${library.id}`,
        },
        {
          text: "Edit",
          link: (library) => `/admin/library/edit/${library.id}`,
        },
        {
          isDelete: true,
        },
      ],
      selection: true,
      multipleDeleteFetcher: async (selectedLibrary) => {
        console.log(selectedLibrary);
        await adminDeleteMultipleLibraryFiles(selectedLibrary);
      },
      pagination: true,
    },
  };

  const mapLibraryToRow = (library) => ({
    id: library.id,

    title: {
      text: library.title,
      libraryId: library.id,
    },
    department: library.departmentId,
    type: library.fileType,
    instructor: `${library.instructor.firstName} ${library.instructor.lastName}`,
  });

  const fetcher = (props) => async () => {
    const { library, showingDocumentsCount, totalDocumentsCount } =
      await adminLibraryListing(props?.params);

    const rows = library.map(mapLibraryToRow);

    return { rows, showingDocumentsCount, totalDocumentsCount };
  };

  const { rows, setRows, fetchRowItems } = useTableRows(fetcher);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Library</Link>
          </BreadcrumbItem>
        }
      />
      <Flex
       justifyContent='space-between'
       flexDirection={{lg:"row", base:"column"}}
       alignItems={{sm:"flex-start", md:"flex-start"}}
       rowGap={6}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Library
        </Heading>

        <Button link="/admin/library/edit/new">Add File</Button>
      </Flex>
      <Table
        {...tableProps}
        placeholder="Title, type"
        rows={rows}
        setRows={setRows}
        handleFetch={fetchRowItems}
      />
    </AdminMainAreaWrapper>
  );
};

export const LibraryListingPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <LibraryListingPage {...props} />} />
  );
};
