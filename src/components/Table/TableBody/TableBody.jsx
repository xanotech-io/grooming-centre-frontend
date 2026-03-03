import { useState, useEffect } from 'react';
import { Icon } from '@chakra-ui/icon';
import { Box, Grid } from '@chakra-ui/react';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { HiDotsHorizontal } from 'react-icons/hi';
import { Checkbox, Spinner, Text } from '../..';
import { Link } from 'react-router-dom';
import { DeleteMenuItemButton } from '../../Cards/QuestionListCard';
import { EmptyState } from '../../../layouts';
import { fireDoubleClick } from '../../../utils';
import { ImDatabase } from 'react-icons/im';
import Pagination from '../Pagination/Pagination';

const TableBody = ({
  rows,
  deletionInProgress,
  columns,
  options,
  templateColumns,
  columnGap,
  generalRowStyles,
  generalCellStyles,
  checkboxStyles,
  selectedRows,
  onRowSelect,
  setParams,
  setCanFilter,
  handleDeselectAllRows,
}) => {
  const getTemplateColumns = () =>
    `${options?.selection ? '20px ' : ''}${templateColumns}${
      options?.action ? ' auto' : ''
    }`;

  const handleIsChecked = (rowId) =>
    selectedRows?.find((row) => row.id === rowId) ? true : false;

  const handleCheckboxChange = (rowId) => {
    onRowSelect({ id: rowId });
  };

  return (
    <Box role="tbody">
      {!deletionInProgress &&
        rows.data?.rows?.map((row) => (
          <Grid
            key={row.id}
            role="row"
            alignItems="center"
            templateColumns={getTemplateColumns}
            columnGap={columnGap}
            height="55px"
            {...generalRowStyles}
          >
            {options?.selection && (
              <Box
                //
                {...checkboxStyles}
              >
                <Checkbox
                  isChecked={handleIsChecked(row.id)}
                  onChange={handleCheckboxChange.bind(null, row.id)}
                />
              </Box>
            )}

            {columns.map((col) =>
              col.renderContent ? (
                <Box key={col.id} {...generalCellStyles}>
                  {col.renderContent(row[col.key])}
                </Box>
              ) : (
                <Cell
                  key={col.id}
                  cell={col}
                  text={row[col.key]}
                  {...generalCellStyles}
                />
              )
            )}

            {options?.action && (
              <Cell
                renderText={() => (
                  <ActionIconButton
                    options={options.action}
                    row={row}
                    onRowSelect={onRowSelect}
                    handleDeselectAllRows={handleDeselectAllRows}
                  />
                )}
                minWidth="fit-content"
                {...generalCellStyles}
              />
            )}
          </Grid>
        ))}

      {rows.loading || rows.err || deletionInProgress ? (
        <Grid height="200px" placeItems="center" textAlign="center">
          {rows.loading && <Spinner size="md" />}

          {deletionInProgress && (
            <Grid placeItems="center" textAlign="center">
              <Spinner marginBottom={5} />
              <Text as="level2" bold>
                Please wait, as this operation might take a while
              </Text>
            </Grid>
          )}

          {rows.err && (
            <Text color="red.500" as="level1" bold>
              Unavailable Service
            </Text>
          )}
        </Grid>
      ) : (
        !rows.data?.rows?.length && (
          <EmptyState
            height="200px"
            illustration={
              <Icon fontSize="20px" boxSize="35px">
                <ImDatabase />
              </Icon>
            }
            description="No Data Available"
          />
        )
      )}

      {options?.pagination && (
        <Pagination
          setParams={setParams}
          setCanFilter={setCanFilter}
          showingDocumentsCount={rows.data?.showingDocumentsCount}
          totalDocumentsCount={rows.data?.totalDocumentsCount}
        />
      )}
    </Box>
  );
};

const ActionIconButton = ({
  options,
  row,
  onRowSelect,
  handleDeselectAllRows,
}) => {
  const [readyToDelete, setReadyToDelete] = useState(false);

  const handleDeleteClick = async () => {
    handleDeselectAllRows();
    setReadyToDelete(true);
  };

  // Handle Delete
  useEffect(() => {
    if (readyToDelete) {
      onRowSelect({ id: row.id });

      // Delete the Row
      // WARNING Hack
      setTimeout(
        () => fireDoubleClick(document.querySelector('[data-testid="delete"]')),
        250
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToDelete]);

  return (
    <Menu placement="bottom-end">
      <MenuButton
        padding={2}
        rounded="full"
        _hover={{
          background: 'none',
          color: 'others.3',
        }}
        _focus={{ border: 'none', background: 'white' }}
      >
        <HiDotsHorizontal />
      </MenuButton>

      <MenuList position="relative" zIndex={2}>
        {Array.isArray(options) &&
          options.map((opt, index) =>
            opt.isDelete ? (
              <DeleteMenuItemButton
                key={index}
                onDelete={() => handleDeleteClick()}
              />
            ) : (
              <MenuItem
                key={index}
                as={opt.link && Link}
                to={opt.link?.(row)}
                onClick={opt.onClick}
                {...opt.props}
              >
                {opt.text}
              </MenuItem>
            )
          )}
      </MenuList>
    </Menu>
  );
};

const Cell = ({ cell, text, minWidth = '150px', renderText, ...rest }) => {
  return (
    <Box role="cell" minWidth={cell?.minWidth || minWidth} {...rest}>
      {renderText ? (
        renderText()
      ) : (
        <Text>{text !== undefined ? text : cell?.text}</Text>
      )}
    </Box>
  );
};

export default TableBody;
