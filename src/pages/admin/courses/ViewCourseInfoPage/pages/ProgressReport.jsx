import { useState, useEffect } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/layout';
import { BreadcrumbItem } from '@chakra-ui/react';
import {
  Button,
  Heading,
  Text,
  Breadcrumb,
  Link,
  Spinner,
} from '../../../../../components';
import { AdminMainAreaWrapper } from '../../../../../layouts/admin/MainArea/Wrapper';
import { useToast } from '@chakra-ui/toast';
import { EmptyState } from '../../../../../layouts';
import { capitalizeFirstLetter } from '../../../../../utils';
import { Input } from '@chakra-ui/input';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/table';
import { IconButton } from '@chakra-ui/button';
import { FiDownload, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';

const ProgressReport = () => {
  const { id: courseId } = useParams();
  const toast = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [error, setError] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleGenerateReport = async (previewMode = false) => {
    if (!startDate || !endDate) {
      toast({
        description: 'Please select both start and end dates',
        position: 'top',
        status: 'error',
      });
      return;
    }

    if (dayjs(startDate).isAfter(dayjs(endDate))) {
      toast({
        description: 'Start date cannot be after end date',
        position: 'top',
        status: 'error',
      });
      return;
    }

    if (previewMode) {
      setIsGeneratingPreview(true);
    } else {
      setIsGenerating(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        courseId,
      });

      const response = await fetch(`https://privateapi.groomingcentre.net/api/v1/admin/export-course-progress-sheet?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        console.error('Error generating progress report:', response);
        throw new Error('Failed to generate progress report');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const fileName = `course-progress-report-${startDate}-to-${endDate}.xlsx`;
      
      if (previewMode) {
        // Set current preview
        setCurrentPreview({
          id: Date.now(),
          fileName,
          url,
          startDate,
          endDate,
          generatedAt: dayjs().format('DD/MM/YYYY h:mm a'),
        });
        
        toast({
          description: 'Progress report preview generated successfully',
          position: 'top',
          status: 'success',
        });
      } else {
        // Download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Store the generated report for viewing
        const newReport = {
          id: Date.now(),
          fileName,
          url,
          startDate,
          endDate,
          generatedAt: dayjs().format('DD/MM/YYYY h:mm a'),
        };
        
        setGeneratedReports(prev => [newReport, ...prev.slice(0, 4)]); // Keep only last 5 reports
        
        toast({
          description: 'Progress report downloaded successfully',
          position: 'top',
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error generating progress report:', error);
      setError(error.message);
      toast({
        description: capitalizeFirstLetter(error.message || 'Failed to generate progress report'),
        position: 'top',
        status: 'error',
      });
    } finally {
      if (previewMode) {
        setIsGeneratingPreview(false);
      } else {
        setIsGenerating(false);
      }
    }
  };

  const handleViewReport = (report) => {
    // Open the Excel file in a new tab
    const newWindow = window.open(report.url, '_blank');
    if (!newWindow) {
      toast({
        description: 'Please allow popups to view the report',
        position: 'top',
        status: 'warning',
      });
    }
  };

  const handleDownloadReport = (report) => {
    const link = document.createElement('a');
    link.href = report.url;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteReport = (reportId) => {
    setGeneratedReports(prev => {
      const updatedReports = prev.filter(report => report.id !== reportId);
      // Find and revoke the URL of the deleted report
      const deletedReport = prev.find(report => report.id === reportId);
      if (deletedReport) {
        window.URL.revokeObjectURL(deletedReport.url);
      }
      return updatedReports;
    });
  };

  const handleDownloadCurrentPreview = () => {
    if (currentPreview) {
      const link = document.createElement('a');
      link.href = currentPreview.url;
      link.download = currentPreview.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        description: 'Report downloaded successfully',
        position: 'top',
        status: 'success',
      });
    }
  };

  const handleClosePreview = () => {
    if (currentPreview) {
      window.URL.revokeObjectURL(currentPreview.url);
      setCurrentPreview(null);
    }
  };

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      generatedReports.forEach(report => {
        window.URL.revokeObjectURL(report.url);
      });
      if (currentPreview) {
        window.URL.revokeObjectURL(currentPreview.url);
      }
    };
  }, []);

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={
          <BreadcrumbItem isCurrentPage>
            <Link href="/admin/courses">Courses</Link>
          </BreadcrumbItem>
        }
        item3={
          <BreadcrumbItem isCurrentPage>
            <Link href="#">Progress Report</Link>
          </BreadcrumbItem>
        }
      />

      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={5}
      >
        <Heading as="h1" fontSize="heading.h3">
          Course Progress Report
        </Heading>
      </Flex>

      {isGenerating || isGeneratingPreview ? (
        <Flex
          height="calc(100vh - 300px)"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" color="primary.base" />
          <Text marginTop={4} textAlign="center" color="gray.600">
            Please wait, this might take some time as it's pulling documents from the server
          </Text>
        </Flex>
      ) : error ? (
        <Flex
          height="calc(100vh - 300px)"
          justifyContent="center"
          alignItems="center"
        >
          <EmptyState
            cta={<Button onClick={() => setError(null)}>Try Again</Button>}
            heading="Oops an error occurred"
            description={error || "An unexpected error occurred, please try again later"}
          />
        </Flex>
      ) : (
        <Box backgroundColor="white" padding={8} shadow="md" borderRadius="md">
          <Heading fontSize="heading.h4" marginBottom={6}>
            Generate Progress Report
          </Heading>
          
          <Text color="gray.600" marginBottom={6}>
            Select a date range to generate a comprehensive progress report for this course. 
            The report will be downloaded as an Excel spreadsheet containing detailed student progress data.
          </Text>

          <Flex gap={6} marginBottom={8} flexDirection={{ base: 'column', md: 'row' }}>
            <FormControl flex="1">
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </FormControl>

            <FormControl flex="1">
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={dayjs().format('YYYY-MM-DD')}
              />
            </FormControl>
          </Flex>

          <Box marginTop={6}>
            <Flex gap={4} flexDirection={{ base: 'column', md: 'row' }}>
              <Button
                onClick={() => handleGenerateReport(false)}
                disabled={!startDate || !endDate || isGenerating || isGeneratingPreview}
                isLoading={isGenerating}
                loadingText="Generating Report..."
                size="lg"
                flex={{ base: 'none', md: '1' }}
              >
                Generate & Download Report
              </Button>
              
              <Button
                onClick={() => handleGenerateReport(true)}
                disabled={!startDate || !endDate || isGenerating || isGeneratingPreview}
                isLoading={isGeneratingPreview}
                loadingText="Generating Preview..."
                size="lg"
                variant="outline"
                flex={{ base: 'none', md: '1' }}
              >
                Generate & Preview
              </Button>
            </Flex>
          </Box>

          <Box marginTop={6} padding={4} backgroundColor="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              <strong>Note:</strong> The progress report includes student enrollment data, 
              lesson completion rates, assessment scores, and overall course progress for the selected date range.
            </Text>
          </Box>

          {currentPreview && (
            <Box marginTop={8} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
              <Flex 
                justifyContent="space-between" 
                alignItems="center" 
                padding={4} 
                backgroundColor="gray.50"
                borderBottom="1px solid"
                borderBottomColor="gray.200"
              >
                <Box>
                  <Heading fontSize="md" marginBottom={1}>
                    Preview: {currentPreview.fileName}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Generated on {currentPreview.generatedAt}
                  </Text>
                </Box>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    onClick={handleDownloadCurrentPreview}
                    leftIcon={<FiDownload />}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClosePreview}
                  >
                    Close Preview
                  </Button>
                </Flex>
              </Flex>
              
              <Box height="600px" backgroundColor="white" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <Box textAlign="center" padding={8}>
                  <Heading fontSize="lg" marginBottom={4} color="gray.600">
                    📊 Excel Preview Ready
                  </Heading>
                  <Text marginBottom={6} color="gray.500">
                    Excel files cannot be directly previewed in the browser. 
                    Use the options below to view or download the report.
                  </Text>
                  <Flex gap={4} justifyContent="center" flexDirection={{ base: 'column', md: 'row' }}>
                    <Button
                      onClick={() => handleViewReport(currentPreview)}
                      leftIcon={<FiExternalLink />}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      onClick={handleDownloadCurrentPreview}
                      leftIcon={<FiDownload />}
                      colorScheme="green"
                    >
                      Download File
                    </Button>
                  </Flex>
                  <Box marginTop={6} padding={4} backgroundColor="blue.50" borderRadius="md" textAlign="left">
                    <Text fontSize="sm" color="blue.800">
                      <strong>💡 Tip:</strong> After clicking "Open in New Tab", your browser will either:
                    </Text>
                    <Box as="ul" marginTop={2} marginLeft={4} fontSize="sm" color="blue.700">
                      <Box as="li">• Open Excel Online (if you have Microsoft 365)</Box>
                      <Box as="li">• Download the file automatically</Box>
                      <Box as="li">• Show a preview if you have Excel installed</Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {generatedReports.length > 0 && (
            <Box marginTop={8}>
              <Heading fontSize="heading.h5" marginBottom={4}>
                Recent Reports
              </Heading>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>File Name</Th>
                      <Th>Date Range</Th>
                      <Th>Generated At</Th>
                      <Th width="120px">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {generatedReports.map((report) => (
                      <Tr key={report.id}>
                        <Td>
                          <Text fontSize="sm" isTruncated maxWidth="200px">
                            {report.fileName}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {dayjs(report.startDate).format('DD/MM/YY')} - {dayjs(report.endDate).format('DD/MM/YY')}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{report.generatedAt}</Text>
                        </Td>
                        <Td>
                          <Flex gap={1}>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={<FiExternalLink />}
                              aria-label="View report"
                              title="View in new tab"
                              onClick={() => handleViewReport(report)}
                            />
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={<FiDownload />}
                              aria-label="Download report"
                              title="Download again"
                              onClick={() => handleDownloadReport(report)}
                            />
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              icon={<FiTrash2 />}
                              aria-label="Delete report"
                              title="Remove from list"
                              onClick={() => handleDeleteReport(report.id)}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              <Text fontSize="xs" color="gray.500" marginTop={2}>
                Reports are stored temporarily in your browser session. Only the last 5 reports are kept.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </AdminMainAreaWrapper>
  );
};

export const ProgressReportRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProgressReport {...props} />} />;
};

export default ProgressReportRoute;