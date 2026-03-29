/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/layout';
import { BreadcrumbItem, Checkbox, Select as ChakraSelect } from '@chakra-ui/react';
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
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/table';
import { IconButton } from '@chakra-ui/button';
import { FiDownload, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import {
  adminGetCourseRoster,
  adminExportCourseRoster,
  adminGetCourseRosterExportStatus,
  adminDownloadCourseRosterExport,
} from '../../../../../services';

const DEFAULT_EXPORT_FIELDS = [
  'studentId',
  'firstName',
  'lastName',
  'email',
  'enrollmentStatus',
  'progressPercentage',
  'enrollmentDate',
];

const buildCsvFromRoster = (students = [], options = {}) => {
  const { includeGrades, includeContactInfo, includeEmergencyContact } = options;

  const headers = [
    'studentId',
    'firstName',
    'lastName',
    ...(includeContactInfo ? ['email', 'phoneNumber'] : []),
    'enrollmentStatus',
    'progressPercentage',
    'enrollmentDate',
    ...(includeGrades ? ['grade', 'passed'] : []),
    ...(includeEmergencyContact ? ['emergencyContact'] : []),
  ];

  const rows = students.map((student) => [
    student.studentId,
    student.firstName,
    student.lastName,
    ...(includeContactInfo ? [student.email || '', student.phoneNumber || ''] : []),
    student.enrollmentStatus,
    student.progressPercentage,
    student.enrollmentDate || '',
    ...(includeGrades ? [student.grade || '', student.passed ? 'true' : 'false'] : []),
    ...(includeEmergencyContact ? ['N/A'] : []),
  ]);

  const csvLines = [headers, ...rows]
    .map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvLines;
};

const ProgressReport = () => {
  const { id: courseId } = useParams();
  const toast = useToast();

  const [isFetchingRoster, setIsFetchingRoster] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState('EXCEL');
  const [includeGrades, setIncludeGrades] = useState(true);
  const [includeContactInfo, setIncludeContactInfo] = useState(true);
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(false);
  const [error, setError] = useState(null);
  const [roster, setRoster] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const loadRoster = async () => {
    setIsFetchingRoster(true);
    setError(null);

    try {
      const { roster: rosterData } = await adminGetCourseRoster(courseId, {
        page: 1,
        limit: 100,
      });

      setRoster(rosterData);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load course roster');
    } finally {
      setIsFetchingRoster(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [courseId]);

  const handleGenerateReport = async (previewMode = false) => {
    if (!roster) {
      toast({
        description: 'Course roster is not ready yet',
        position: 'top',
        status: 'warning',
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
      const exportPayload = {
        format: exportFormat,
        fields: DEFAULT_EXPORT_FIELDS,
        includeGrades,
        includeContactInfo,
        includeEmergencyContact,
      };

      const { exportRecord } = await adminExportCourseRoster(courseId, exportPayload);
      const exportStatus = await adminGetCourseRosterExportStatus(exportRecord.exportId);

      if (exportStatus.status !== 'SUCCESS') {
        throw new Error(exportStatus.message || 'Roster export failed');
      }

      const downloadData = await adminDownloadCourseRosterExport(exportRecord.exportId);

      const csvContent = buildCsvFromRoster(roster.students, {
        includeGrades,
        includeContactInfo,
        includeEmergencyContact,
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const fileName = downloadData.fileName;

      if (previewMode) {
        setCurrentPreview({
          id: exportRecord.exportId,
          fileName,
          url,
          format: downloadData.format,
          generatedAt: dayjs().format('DD/MM/YYYY h:mm a'),
        });

        toast({
          description: 'Course roster preview generated successfully',
          position: 'top',
          status: 'success',
        });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const newReport = {
          id: exportRecord.exportId,
          fileName,
          url,
          format: downloadData.format,
          generatedAt: dayjs().format('DD/MM/YYYY h:mm a'),
        };

        setGeneratedReports((prev) => [newReport, ...prev.slice(0, 4)]);

        toast({
          description: 'Course roster downloaded successfully',
          position: 'top',
          status: 'success',
        });
      }
    } catch (requestError) {
      setError(requestError.message);
      toast({
        description: capitalizeFirstLetter(
          requestError.message || 'Failed to export course roster',
        ),
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
    setGeneratedReports((prev) => {
      const updatedReports = prev.filter((report) => report.id !== reportId);
      const deletedReport = prev.find((report) => report.id === reportId);
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

  useEffect(() => {
    return () => {
      generatedReports.forEach((report) => {
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
          Course Roster Export
        </Heading>
      </Flex>

      {isFetchingRoster || isGenerating || isGeneratingPreview ? (
        <Flex
          height="calc(100vh - 300px)"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" color="primary.base" />
          <Text marginTop={4} textAlign="center" color="gray.600">
            Please wait, this might take some time.
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
            Export Course Roster
          </Heading>

          <Text color="gray.600" marginBottom={6}>
            Generate complete course roster containing enrolled students, statuses,
            course details, and optional grade/contact fields.
          </Text>

          <Flex gap={6} marginBottom={6} flexDirection={{ base: 'column', md: 'row' }}>
            <FormControl flex="1">
              <FormLabel>Export Format</FormLabel>
              <ChakraSelect
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value)}
              >
                <option value="EXCEL">EXCEL</option>
                <option value="CSV">CSV</option>
                <option value="PDF">PDF</option>
              </ChakraSelect>
            </FormControl>
          </Flex>

          <Flex gap={5} mb={6} direction={{ base: 'column', md: 'row' }}>
            <Checkbox
              isChecked={includeGrades}
              onChange={(event) => setIncludeGrades(event.target.checked)}
            >
              Include grades
            </Checkbox>
            <Checkbox
              isChecked={includeContactInfo}
              onChange={(event) => setIncludeContactInfo(event.target.checked)}
            >
              Include contact info
            </Checkbox>
            <Checkbox
              isChecked={includeEmergencyContact}
              onChange={(event) => setIncludeEmergencyContact(event.target.checked)}
            >
              Include emergency contact
            </Checkbox>
          </Flex>

          <Box marginTop={6}>
            <Flex gap={4} flexDirection={{ base: 'column', md: 'row' }}>
              <Button
                onClick={() => handleGenerateReport(false)}
                disabled={isGenerating || isGeneratingPreview}
                isLoading={isGenerating}
                loadingText="Generating Report..."
                size="lg"
                flex={{ base: 'none', md: '1' }}
              >
                Generate & Download Roster
              </Button>

              <Button
                onClick={() => handleGenerateReport(true)}
                disabled={isGenerating || isGeneratingPreview}
                isLoading={isGeneratingPreview}
                loadingText="Generating Preview..."
                size="lg"
                variant="outline"
                flex={{ base: 'none', md: '1' }}
              >
                Generate & Preview Roster
              </Button>
            </Flex>
          </Box>

          <Box marginTop={6} padding={4} backgroundColor="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              <strong>Note:</strong> TC27 export includes student roster details and supports
              CSV, EXCEL, and PDF request formats.
            </Text>
          </Box>

          <Box marginTop={8} border="1px" borderColor="gray.100" borderRadius="md" padding={4}>
            <Heading fontSize="md" mb={3}>
              Roster Summary
            </Heading>
            <Flex gap={6} flexWrap="wrap">
              <Text>Course: {roster?.courseName || '-'}</Text>
              <Text>Total Students: {roster?.summary?.totalStudents || 0}</Text>
              <Text>Enrolled: {roster?.summary?.enrolled || 0}</Text>
              <Text>Pending: {roster?.summary?.pending || 0}</Text>
            </Flex>
          </Box>

          <Box marginTop={6}>
            <Heading fontSize="md" mb={3}>
              Course Roster
            </Heading>
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Student ID</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Progress (%)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(roster?.students || []).map((student) => (
                    <Tr key={student.studentId}>
                      <Td>{student.studentId}</Td>
                      <Td>{`${student.firstName} ${student.lastName}`}</Td>
                      <Td>{student.email || '-'}</Td>
                      <Td>{student.enrollmentStatus}</Td>
                      <Td isNumeric>{student.progressPercentage}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
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
                    📊 Roster Preview Ready
                  </Heading>
                  <Text marginBottom={6} color="gray.500">
                    This preview contains a generated roster export file. Use the options below
                    to open or download.
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
                      <strong>💡 Tip:</strong> Export includes roster fields selected above.
                    </Text>
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
                      <Th>Format</Th>
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
                            {report.format}
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
                Reports are stored temporarily in your browser session. Only the last 5 exports are kept.
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