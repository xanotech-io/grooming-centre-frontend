import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Button,
  SimpleGrid,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Flex,
  Avatar,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  TagLabel,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBook,
  FiAward,
  FiTrendingUp,
  FiBarChart,
} from 'react-icons/fi';
import { MdQuiz, MdSchool } from 'react-icons/md';
import { BiTask } from 'react-icons/bi';
import { Route, useParams } from 'react-router-dom';
import { useExaminationRecords } from './hooks/useExaminationRecords';

const ExaminationRecordsPage = () => {
  const { id: userId } = useParams();
  const {
    examinationRecords,
    stats,
    isLoading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    filterType,
    setFilterType,
  } = useExaminationRecords();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Debug logging
  console.log('ExaminationRecordsPage Component Rendered!');
  console.log('ExaminationRecordsPage Debug:', {
    userId,
    examinationRecords,
    examinationRecordsType: typeof examinationRecords,
    examinationRecordsIsArray: Array.isArray(examinationRecords),
    stats,
    isLoading,
    error,
    recordsLength: examinationRecords?.length,
  });

  // Log the actual records structure if available
  if (examinationRecords && examinationRecords.length > 0) {
    console.log('First examination record:', examinationRecords[0]);
  }

  if (isLoading) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.base" />
          <Text>Loading examination records... (userId: {userId})</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  const getTypeIcon = (type) => {
    return type === 'regular' ? <MdSchool /> : <MdQuiz />;
  };

  const getTypeColor = (type) => {
    return type === 'regular' ? 'blue' : 'purple';
  };

  return (
    <Box p={6} minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={4} mb={6}>
        <Heading size="lg" color="primary.base">
          Examination Records (User ID: {userId})
        </Heading>
        <Text color="gray.600">
          Comprehensive view of examination performance and answer sheets
        </Text>
        <Text fontSize="sm" color="blue.500">
          Debug: Records: {examinationRecords?.length || 0}, Loading: {isLoading.toString()}, Error: {error || 'none'}
        </Text>
        <Box bg="gray.100" p={3} borderRadius="md" fontSize="xs" fontFamily="mono">
          <Text fontWeight="bold">Raw Data Debug:</Text>
          <Text>Records Array: {JSON.stringify(examinationRecords, null, 2)}</Text>
          <Text>Stats: {JSON.stringify(stats, null, 2)}</Text>
        </Box>
      </VStack>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          icon={<Icon as={FiBarChart} />}
          label="Total Examinations"
          value={stats?.overall?.totalExaminations || 0}
          helpText="All time"
          colorScheme="blue"
        />
        <StatCard
          icon={<Icon as={FiTrendingUp} />}
          label="Average Score"
          value={`${stats?.overall?.averageScore || 0}%`}
          helpText="Across all exams"
          colorScheme="green"
        />
        <StatCard
          icon={<Icon as={FiCheckCircle} />}
          label="Passed"
          value={stats?.overall?.totalPassed || 0}
          helpText="Successful attempts"
          colorScheme="green"
        />
        <StatCard
          icon={<Icon as={FiXCircle} />}
          label="Failed"
          value={stats?.overall?.totalFailed || 0}
          helpText="Needs improvement"
          colorScheme="red"
        />
      </SimpleGrid>

      {/* Filter Buttons */}
      <HStack spacing={4} mb={6}>
        <Button
          variant={filterType === 'all' ? 'solid' : 'outline'}
          colorScheme="primary"
          onClick={() => setFilterType('all')}
        >
          All Examinations
        </Button>
        <Button
          variant={filterType === 'regular' ? 'solid' : 'outline'}
          colorScheme="blue"
          leftIcon={<MdSchool />}
          onClick={() => setFilterType('regular')}
        >
          Course Examinations
        </Button>
        <Button
          variant={filterType === 'standalone' ? 'solid' : 'outline'}
          colorScheme="purple"
          leftIcon={<MdQuiz />}
          onClick={() => setFilterType('standalone')}
        >
          Standalone Examinations
        </Button>
      </HStack>

      {/* Examination Records List */}
      <VStack spacing={4} align="stretch">
        {(!examinationRecords || examinationRecords.length === 0) ? (
          <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="md" p={4}>
            <VStack spacing={4} py={8}>
              <Icon as={BiTask} size="48px" color="gray.400" />
              <Text fontSize="lg" color="gray.500">
                No examination records found
              </Text>
              <Text color="gray.400" textAlign="center">
                This user hasn't taken any examinations yet
              </Text>
            </VStack>
          </Box>
        ) : (
          examinationRecords?.map((record, index) => {
            console.log(`Rendering record ${index}:`, record);
            return (
              <ExaminationCard key={record.id || index} record={record} />
            );
          })
        )}
      </VStack>

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="center" mt={8} spacing={2}>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              variant={currentPage === i + 1 ? 'solid' : 'outline'}
              colorScheme={currentPage === i + 1 ? 'primary' : 'gray'}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
};

const StatCard = ({ icon, label, value, helpText, colorScheme }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box bg={cardBg} borderRadius="md" p={4} borderWidth="1px" borderColor="gray.200">
      <Stat>
        <HStack>
          <Box color={`${colorScheme}.500`}>
            {icon}
          </Box>
          <Box>
            <StatLabel fontSize="sm" color="gray.500">
              {label}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {value}
            </StatNumber>
            <StatHelpText fontSize="xs">
              {helpText}
            </StatHelpText>
          </Box>
        </HStack>
      </Stat>
    </Box>
  );
};

const ExaminationCard = ({ record }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  console.log('ExaminationCard rendering with record:', record);

  if (!record) {
    return (
      <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="md" p={4}>
        <Text color="red.500">Error: Invalid record data</Text>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  const getTypeColor = (type) => {
    return type === 'regular' ? 'blue' : 'purple';
  };

  const getTypeIcon = (type) => {
    return type === 'regular' ? <MdSchool /> : <MdQuiz />;
  };

  return (
    <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="md">
      <Box pb={3} p={4}>
        <Flex justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon 
                as={getTypeIcon(record.type)} 
                color={`${getTypeColor(record.type)}.500`} 
              />
              <Heading size="md">{record.examination?.title || 'Unknown Examination'}</Heading>
              <Badge colorScheme={getTypeColor(record.type)}>
                {record.type === 'regular' ? 'Course Exam' : 'Standalone'}
              </Badge>
            </HStack>
            {record.examination?.course && (
              <Text fontSize="sm" color="gray.600">
                Course: {record.examination.course.title}
              </Text>
            )}
            <HStack spacing={4} fontSize="sm" color="gray.500">
              <HStack>
                <Icon as={FiClock} />
                <Text>Taken: {formatDate(record.dateTaken)}</Text>
              </HStack>
              <HStack>
                <Icon as={FiBook} />
                <Text>{record.examination?.amountOfQuestions || 0} Questions</Text>
              </HStack>
            </HStack>
          </VStack>
          <VStack align="end" spacing={2}>
            <Badge 
              colorScheme={getScoreColor(record.score)} 
              fontSize="lg" 
              px={3} 
              py={1}
            >
              {record.score}%
            </Badge>
            {record.numberOfCorrectAnswers && (
              <Text fontSize="sm" color="gray.600">
                {record.numberOfCorrectAnswers}/{record.numberOfQuestion} correct
              </Text>
            )}
          </VStack>
        </Flex>
      </Box>
      
      <Box pt={0} px={4} pb={4}>
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium" color="primary.base">
                  View Answer Sheet
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0} pb={0}>
              <Divider mb={4} />
              <VStack spacing={4} align="stretch">
                {record.examination?.questions?.map((question, index) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    questionNumber={index + 1}
                  />
                )) || (
                  <Text color="gray.500">No questions available</Text>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Box>
  );
};

const QuestionCard = ({ question, questionNumber }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.600');
  
  return (
    <Box bg={cardBg} p={4} borderRadius="md">
      <VStack align="start" spacing={3}>
        <HStack>
          <Badge colorScheme="gray">Q{questionNumber}</Badge>
          <Text fontWeight="medium">{question.question}</Text>
        </HStack>
        
        {question.file && (
          <Box>
            <img src={question.file} alt="Question image" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        )}
        
        <VStack align="start" spacing={2} w="full">
          {question.options?.map((option) => (
            <HStack key={option.id} w="full" justify="space-between">
              <HStack>
                <Text fontSize="sm" fontWeight="medium" minW="8">
                  {option.optionIndex}.
                </Text>
                <Text fontSize="sm">{option.name}</Text>
              </HStack>
              {option.isCorrectAnswer && (
                <Tooltip label="Correct Answer">
                  <Tag colorScheme="green" size="sm">
                    <TagLabel>Correct</TagLabel>
                    <Icon as={FiCheckCircle} ml={1} />
                  </Tag>
                </Tooltip>
              )}
            </HStack>
          )) || (
            <Text fontSize="sm" color="gray.500">No options available</Text>
          )}
        </VStack>
        
        <Text fontSize="xs" color="gray.500" fontStyle="italic">
          Note: User's selected answers are not stored in the current system schema
        </Text>
      </VStack>
    </Box>
  );
};

const ExaminationRecordsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ExaminationRecordsPage {...props} />} />;
};

export default ExaminationRecordsPage;
export { ExaminationRecordsPageRoute };