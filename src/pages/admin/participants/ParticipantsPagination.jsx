import { Flex } from '@chakra-ui/layout';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { Button, Select, Text } from '../../../components';

const ParticipantsPagination = ({
  documentCount,
  totalCount,
  setRecordsPerPage,
  recordsPerPage,
  currentPage,
  setCurrentPage,
  nPages,
}) => {
  const nextPage = () => {
    setCurrentPage(currentPage === nPages ? nPages : currentPage + 1);
  };

  const handleGoPrevPage = () => {
    setCurrentPage(currentPage === 1 ? 1 : currentPage - 1);
  };

  const handleSelectChange = ({ target: { value } }) => {
    setRecordsPerPage(value);
  };

  return (
    <Flex justifyContent="flex-end" p={5} pb={0} marginBottom="20px">
      <Flex alignItems="center" mr={5}>
        <Text mr={3} bold>
          Rows per page:
        </Text>

        <Select
          value={recordsPerPage}
          id="table-limit"
          size="sm"
          border="none"
          group={{
            width: '100px',
          }}
          options={[
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' },
          ]}
          onChange={handleSelectChange}
          noEmptyOption
        />
      </Flex>

      <Flex alignItems="center" mr={5}>
        <Text mr={5} ml={1}>
          Showing <b>{documentCount}</b> out of <b>{totalCount}</b> documents
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

export default ParticipantsPagination;
