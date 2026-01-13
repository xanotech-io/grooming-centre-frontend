import { Box, Flex, StackDivider } from "@chakra-ui/layout";
import PropTypes from "prop-types";
import Header from "./Header/Header";
import TableHead from "./TableHead/TableHead";
import TableBody from "./TableBody/TableBody";
import { useState } from "react";
import { Button, Text } from "..";
import { DeleteMenuItemButton } from "../Cards/QuestionListCard";
import { AiFillMinusSquare } from "react-icons/ai";
import { BiTrash } from "react-icons/bi";
import breakpoints from "../../theme/breakpoints";
import { useFetch } from "../../hooks";
import { capitalizeFirstLetter } from "../../utils";
import { useToast } from "@chakra-ui/toast";
import { useEffect } from "react";

const useTable = ({
  rowsData,
  setRows,
  multipleDeleteFetcher,
  options,
  handleFetch,
  onSelectionChange,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const {
    resource: { loading: deletionInProgress },
    handleFetchResource,
  } = useFetch();
  const toastBread = useToast();

  const [params, setParams] = useState({});
  const [canFilter, setCanFilter] = useState(false);

  // Fetch Table initial's data for non-paginated option
  useEffect(() => {
    if (!options.pagination) handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.pagination]);

  // Fetch Table data every time permitted to
  useEffect(() => {
    if (canFilter) {
      handleFetch({ params });
      setCanFilter(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFilter]);

  /**
   * toggles all rows selection
   * @param {Array<{ id: string }>} rows
   *
   * @return void
   */
  const handleSelectRowsToggle = (rows) => {
    let newRows = [];

    if (!(selectedRows.length === (rowsData?.length || 0))) {
      newRows = rows;
    }

    setSelectedRows(newRows);
    // Notify parent component about selection change
    if (onSelectionChange) {
      onSelectionChange(newRows);
    }
  };

  /**
   * deselects all rows
   *
   * @return void
   */
  const handleDeselectAllRows = () => {
    setSelectedRows([]);
    // Notify parent component about selection change
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  /**
   * toggles single row selection
   * @param {{ id: string }} row
   *
   * @return void
   */
  const handleSelectRowToggle = (row) => {
    const rows = [...selectedRows];
    const rowIndex = rows.findIndex(({ id }) => row.id === id);
    const rowIsNotSelected = rowIndex === -1;

    if (rowIsNotSelected) {
      rows.push(row);
    } else {
      rows.splice(rowIndex, 1);
    }

    setSelectedRows(rows);
    // Notify parent component about selection change
    if (onSelectionChange) {
      onSelectionChange(rows);
    }
  };

  /**
   * deletes many rows
   * @param {Array<{ id: string }>} selectedRows
   *
   * @return void
   */
  const handleDeleteRows = (selectedRows) => {
    const onSuccess = () => {
      const allRows = [...(rowsData || [])];

      selectedRows.forEach((row) => {
        const rowIndexInRowsData = allRows.findIndex(({ id }) => id === row.id);
        const rowIsInRowsData = rowIndexInRowsData !== -1;

        // deletes it from `rowsData`
        if (rowIsInRowsData) {
          allRows.splice(rowIndexInRowsData, 1);
        }
      });

      // setRows((prev) => ({
      //   data: {
      //     rows: [],
      //   },
      // }));
      setRows((prev) => ({
        data: {
          ...prev.data,
          rows: allRows,
          showingDocumentsCount: prev.data.showingDocumentsCount
            ? prev.data.showingDocumentsCount - selectedRows.length
            : 0,
        },
      }));

      console.log(allRows);

      handleDeselectAllRows();

      toastBread({
        description: capitalizeFirstLetter("deleted successfully"),
        position: "top",
        status: "success",
      });
    };

    const onError = (err) => {
      toastBread({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    };

    handleFetchResource({
      fetcher: () => multipleDeleteFetcher(selectedRows),
      onSuccess,
      onError,
    });
  };

  return {
    selectedRows,
    deletionInProgress,
    handleDeselectAllRows,
    handleSelectRowsToggle,
    handleSelectRowToggle,
    handleDeleteRows,
    setParams,
    setCanFilter,
  };
};

export const Table = ({
  rows,
  setRows,
  filterControls,
  SearchBarVisibility,
  placeholder,
  columns,
  options,
  templateColumns,
  columnGap = 2,
  generalRowStyles,
  handleFetch,
  onSelectionChange,
  // Calc from the width of the aside and margins
  width = "100%",
  maxWidth = "100%",
}) => {
  const manager = useTable({
    rowsData: rows.data?.rows,
    setRows,
    multipleDeleteFetcher: options?.multipleDeleteFetcher,
    options,
    handleFetch,
    onSelectionChange,
  });

  const getTemplateColumns = () =>
    columns.reduce(
      (prev, col) => (prev += col.fraction ? `${col.fraction} ` : "2fr "),
      ""
    );

  generalRowStyles = {
    ...generalRowStyles,
    borderBottom: "1px",
    borderColor: "accent.1",
  };

  const generalCellStyles = {
    // borderBottom: "1px",
    // borderColor: "accent.2",
    paddingX: columnGap,
  };

  const checkboxStyles = {
    ...generalCellStyles,
    // paddingLeft: 5,
    transform: "translate(2px, 5px)",
  };

  const commonProps = {
    rows,
    templateColumns: getTemplateColumns() || templateColumns,
    columns,
    options,
    columnGap,
    generalRowStyles,
    generalCellStyles,
    checkboxStyles,
    selectedRows: manager.selectedRows,
  };

  return (
    <Box>
      <Header
        SearchBarVisibility={SearchBarVisibility}
        placeholder={placeholder}
        filterControls={filterControls}
        setParams={manager.setParams}
        setCanFilter={manager.setCanFilter}
      />

      <Box paddingTop={3} marginTop={3} borderTop="1px" borderColor="accent.2">
        {manager.selectedRows.length ? (
          <Flex alignItems="center" marginBottom={3}>
            <Button
              asIcon
              sm
              marginRight={2}
              data-testid="deselect"
              onClick={manager.handleDeselectAllRows}
            >
              <AiFillMinusSquare />
            </Button>

            <Text as="level3" bold marginX={5}>
              {manager.selectedRows.length} selected
            </Text>

            <DeleteMenuItemButton
              onDelete={manager.handleDeleteRows.bind(
                null,
                manager.selectedRows
              )}
              renderTrigger={({ onOpen }) => (
                <Button
                  asIcon
                  sm
                  data-testid="delete"
                  onClick={onOpen}
                  onDoubleClick={manager.handleDeleteRows.bind(
                    null,
                    manager.selectedRows
                  )}
                  color="secondary.7"
                >
                  <BiTrash />
                </Button>
              )}
            />
          </Flex>
        ) : null}

        <Box
          divider={<StackDivider borderColor="gray.200" marginY={0} />}
          role="table"
          padding={2}
          paddingBottom={5}
          width="100%"
          maxWidth="100%"
          overflowX="auto"
          backgroundColor="white"
        >
          <TableHead
            {...commonProps}
            onSelect={manager.handleSelectRowsToggle}
          />

          <TableBody
            {...commonProps}
            onRowSelect={manager.handleSelectRowToggle}
            deletionInProgress={manager.deletionInProgress}
            setParams={manager.setParams}
            setCanFilter={manager.setCanFilter}
            handleDeselectAllRows={manager.handleDeselectAllRows}
          />
        </Box>
      </Box>
    </Box>
  );
};

Table.propTypes = {
  filterControls: PropTypes.array,
  SearchBarVisibility: PropTypes.string,
  placeholder: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      key: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      minWidth: PropTypes.string,
    })
  ).isRequired,
  options: PropTypes.shape({
    action: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.any,
        isDelete: PropTypes.bool,
        link: PropTypes.func,
        props: PropTypes.object,
        onClick: PropTypes.func,
      })
    ),
    selection: PropTypes.bool,
    multipleDeleteFetcher: PropTypes.func,
  }),
  rows: PropTypes.shape({
    data: PropTypes.shape({
      data: PropTypes.arrayOf(PropTypes.object),
      totalCount: PropTypes.number,
      showingCount: PropTypes.number,
    }),
    loading: PropTypes.bool,
    err: PropTypes.bool,
  }),
  setRows: PropTypes.func.isRequired,
  templateColumns: PropTypes.string,
  columnGap: PropTypes.any,
  generalRowStyles: PropTypes.object,
  width: PropTypes.string,
  handleFetch: PropTypes.func,
  onSelectionChange: PropTypes.func,
};
