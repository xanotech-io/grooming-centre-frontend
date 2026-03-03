import { Flex } from '@chakra-ui/layout';
import { useEffect } from 'react';
import { useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { useHistory } from 'react-router';
import { Button, Select, Text } from '../..';
import { useQueryParams } from '../../../hooks';

const Pagination = ({
  showingDocumentsCount,
  totalDocumentsCount,
  setParams,
  setCanFilter,
}) => {
  const p = useQueryParams().get('page');
  const l = useQueryParams().get('limit');
  const initialPage = p ? parseInt(p) : 1;
  const initialLimit = l || '20';

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleGoPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectChange = ({ target: { value } }) => {
    setLimit(value);
  };

  const history = useHistory();

  useEffect(() => {
    history.push({
      pathname: '',
      search: `?page=${currentPage}${limit ? `&limit=${limit}` : ''}`,
    });
  }, [currentPage, limit, history]);

  useEffect(() => {
    setParams((prev) => ({ ...prev, page: currentPage, length: limit }));
    setCanFilter(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  return (
    <Flex justifyContent="flex-end" p={5} pb={0}>
      <Flex alignItems="center" mr={5}>
        <Text mr={3} bold>
          Rows per page:
        </Text>

        <Select
          value={limit}
          id="table-limit"
          size="sm"
          border="none"
          group={{
            width: '100px',
          }}
          options={[
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
          onChange={handleSelectChange}
          noEmptyOption
        />
      </Flex>

      <Flex alignItems="center" mr={5}>
        <Text mr={5} ml={1}>
          Showing <b>{showingDocumentsCount}</b> out of{' '}
          <b>{totalDocumentsCount}</b> items
        </Text>
        <Button asIcon onClick={handleGoPrevPage}>
          <BiChevronLeft />
        </Button>

        <Text mx={2} bold as="level3">
          {currentPage}
        </Text>

        <Button asIcon onClick={nextPage}>
          <BiChevronRight />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;
