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
  FiDownload,
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
  //TODO: Remove or comment out in production
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
    return type === 'regular' ? MdSchool : MdQuiz;
  };

  const getTypeColor = (type) => {
    return type === 'regular' ? 'blue' : 'purple';
  };

  // Parse question JSON to extract text
  const getQuestionText = (questionJson) => {
    try {
      if (typeof questionJson === 'string') {
        const parsed = JSON.parse(questionJson);
        if (parsed.blocks && parsed.blocks.length > 0) {
          return parsed.blocks.map(block => block.text).join(' ');
        }
      }
      return questionJson;
    } catch (error) {
      return questionJson;
    }
  };

  // Download examination records as JSON/CSV
  const handleDownload = () => {
    try {
      // Prepare data for download
      const downloadData = {
        userId,
        generatedAt: new Date().toISOString(),
        statistics: {
          overall: stats?.overall || {},
          regular: stats?.regular || {},
          standalone: stats?.standalone || {},
        },
        examinations: examinationRecords?.map(record => ({
          id: record.id,
          type: record.type,
          title: record.examination?.title,
          course: record.examination?.course?.title || 'N/A',
          dateTaken: record.dateTaken,
          score: record.score,
          numberOfQuestions: record.examination?.amountOfQuestions || 0,
          numberOfCorrectAnswers: record.numberOfCorrectAnswers || 0,
          questions: record.examination?.questions?.map((q, index) => ({
            questionNumber: index + 1,
            question: getQuestionText(q.question),
            hasFile: !!q.file,
            fileUrl: q.file || null,
            options: q.options?.map(opt => ({
              index: opt.optionIndex,
              text: opt.name,
              isCorrectAnswer: opt.isCorrectAnswer,
            })) || [],
          })) || [],
        })) || [],
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(downloadData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `examination-records-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download examination records. Please try again.');
    }
  };

  // Download as CSV
  const handleDownloadCSV = () => {
    try {
      // Prepare CSV header
      let csv = 'Examination Type,Title,Course,Date Taken,Score (%),Questions,Correct Answers\n';
      
      // Add data rows
      examinationRecords?.forEach(record => {
        const type = record.type === 'regular' ? 'Course Exam' : 'Standalone';
        const title = (record.examination?.title || 'Unknown').replace(/,/g, ';');
        const course = (record.examination?.course?.title || 'N/A').replace(/,/g, ';');
        const date = new Date(record.dateTaken).toLocaleString();
        const score = record.score;
        const questions = record.examination?.amountOfQuestions || 0;
        const correct = record.numberOfCorrectAnswers || 0;
        
        csv += `${type},"${title}","${course}","${date}",${score},${questions},${correct}\n`;
      });

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `examination-records-${userId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
  };

  return (
    <Box p={6} minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={4} mb={6}>
        <Flex justify="space-between" align="center" w="full">
          <Box>
            <Heading size="lg" color="primary.base">
              Examination Records (User: {userId})
            </Heading>
            <Text color="gray.600" mt={2}>
              Comprehensive view of examination performance and answer sheets
            </Text>
          </Box>
          <HStack spacing={2}>
            <Tooltip label="Download as CSV">
              <Button
                leftIcon={<Icon as={FiDownload} />}
                colorScheme="green"
                variant="outline"
                onClick={handleDownloadCSV}
                isDisabled={!examinationRecords || examinationRecords.length === 0}
              >
                CSV
              </Button>
            </Tooltip>
            <Tooltip label="Download as JSON (includes questions and answers)">
              <Button
                leftIcon={<Icon as={FiDownload} />}
                colorScheme="primary"
                onClick={handleDownload}
                isDisabled={!examinationRecords || examinationRecords.length === 0}
              >
                JSON
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </VStack>

      {/* Overall Statistics Cards */}
      <VStack spacing={6} mb={8} align="stretch">
        <Heading size="md" color="gray.700">Overall Statistics</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
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

        {/* Detailed Statistics - Collapsible */}
        <Accordion allowMultiple defaultIndex={[0, 1]}>
          {/* Regular Examinations Statistics */}
          <AccordionItem borderWidth="1px" borderRadius="md" mb={4}>
            <AccordionButton py={3} _hover={{ bg: 'gray.50' }}>
              <HStack flex="1" textAlign="left">
                <Icon as={MdSchool} color="blue.500" boxSize={5} />
                <Heading size="md" color="gray.700">
                  Course Examinations Statistics
                </Heading>
                <Badge colorScheme="blue" ml={2}>
                  {stats?.regular?.totalExaminations || 0} exams
                </Badge>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4}>
                <StatCard
                  label="Total"
                  value={stats?.regular?.totalExaminations || 0}
                  helpText="Course exams taken"
                  colorScheme="blue"
                  size="sm"
                />
                <StatCard
                  label="Average Score"
                  value={`${stats?.regular?.averageScore || 0}%`}
                  helpText="Average"
                  colorScheme="blue"
                  size="sm"
                />
                <StatCard
                  label="Highest Score"
                  value={`${stats?.regular?.highestScore || 0}%`}
                  helpText="Best result"
                  colorScheme="green"
                  size="sm"
                />
                <StatCard
                  label="Lowest Score"
                  value={`${stats?.regular?.lowestScore || 0}%`}
                  helpText="Lowest result"
                  colorScheme="orange"
                  size="sm"
                />
                <StatCard
                  label="Passed"
                  value={stats?.regular?.passedExaminations || 0}
                  helpText="Successful"
                  colorScheme="green"
                  size="sm"
                />
                <StatCard
                  label="Failed"
                  value={stats?.regular?.failedExaminations || 0}
                  helpText="Unsuccessful"
                  colorScheme="red"
                  size="sm"
                />
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* Standalone Examinations Statistics */}
          <AccordionItem borderWidth="1px" borderRadius="md">
            <AccordionButton py={3} _hover={{ bg: 'gray.50' }}>
              <HStack flex="1" textAlign="left">
                <Icon as={MdQuiz} color="purple.500" boxSize={5} />
                <Heading size="md" color="gray.700">
                  Standalone Examinations Statistics
                </Heading>
                <Badge colorScheme="purple" ml={2}>
                  {stats?.standalone?.totalExaminations || 0} exams
                </Badge>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4}>
                <StatCard
                  label="Total"
                  value={stats?.standalone?.totalExaminations || 0}
                  helpText="Standalone exams taken"
                  colorScheme="purple"
                  size="sm"
                />
                <StatCard
                  label="Average Score"
                  value={`${stats?.standalone?.averageScore || 0}%`}
                  helpText="Average"
                  colorScheme="purple"
                  size="sm"
                />
                <StatCard
                  label="Highest Score"
                  value={`${stats?.standalone?.highestScore || 0}%`}
                  helpText="Best result"
                  colorScheme="green"
                  size="sm"
                />
                <StatCard
                  label="Lowest Score"
                  value={`${stats?.standalone?.lowestScore || 0}%`}
                  helpText="Lowest result"
                  colorScheme="orange"
                  size="sm"
                />
                <StatCard
                  label="Passed"
                  value={stats?.standalone?.passedExaminations || 0}
                  helpText="Successful"
                  colorScheme="green"
                  size="sm"
                />
                <StatCard
                  label="Failed"
                  value={stats?.standalone?.failedExaminations || 0}
                  helpText="Unsuccessful"
                  colorScheme="red"
                  size="sm"
                />
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>

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

const StatCard = ({ icon, label, value, helpText, colorScheme, size = 'md' }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box bg={cardBg} borderRadius="md" p={size === 'sm' ? 3 : 4} borderWidth="1px" borderColor="gray.200">
      <Stat>
        {icon && size === 'md' && (
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
        )}
        {(!icon || size === 'sm') && (
          <Box>
            <StatLabel fontSize={size === 'sm' ? 'xs' : 'sm'} color="gray.500">
              {label}
            </StatLabel>
            <StatNumber fontSize={size === 'sm' ? 'xl' : '2xl'} fontWeight="bold">
              {value}
            </StatNumber>
            <StatHelpText fontSize="xs">
              {helpText}
            </StatHelpText>
          </Box>
        )}
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
    return type === 'regular' ? MdSchool : MdQuiz;
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
  
  // Parse the question JSON to extract text
  const getQuestionText = (questionJson) => {
    try {
      if (typeof questionJson === 'string') {
        const parsed = JSON.parse(questionJson);
        if (parsed.blocks && parsed.blocks.length > 0) {
          return parsed.blocks.map(block => block.text).join(' ');
        }
      }
      return questionJson;
    } catch (error) {
      console.error('Error parsing question:', error);
      return questionJson;
    }
  };
  
  return (
    <Box bg={cardBg} p={4} borderRadius="md">
      <VStack align="start" spacing={3}>
        <HStack align="start">
          <Badge colorScheme="gray" mt={1}>Q{questionNumber}</Badge>
          <Text fontWeight="medium">{getQuestionText(question.question)}</Text>
        </HStack>
        
        {question.file && (
          <Box borderWidth="1px" borderColor="gray.300" borderRadius="md" overflow="hidden" maxW="full">
            <img 
              src={question.file} 
              alt={`Question ${questionNumber} attachment`} 
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                display: 'block'
              }} 
            />
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
      </VStack>
    </Box>
  );
};

const ExaminationRecordsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ExaminationRecordsPage {...props} />} />;
};

export default ExaminationRecordsPage;
export { ExaminationRecordsPageRoute };