import { Box, Flex, Grid } from '@chakra-ui/layout';
import { Badge } from '@chakra-ui/react';
import { Route, useParams } from 'react-router-dom';
import { Heading, Spinner, Text } from '../../../../../components';
import useAssessmentPreview from '../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview';
import EditAssessmentPage from './EditAssessmentPage';
import CreateAssessmentPage from './CreateAssessmentPage';
import { useFetch, useQueryParams } from '../../../../../hooks';
import { useEffect, useState } from 'react';
import { adminGetExaminationById, adminGetUserListing } from '../../../../../services';
import { capitalizeFirstLetter, getDuration } from '../../../../../utils';
import { useToast } from '@chakra-ui/react';
import dayjs from 'dayjs';

export const isStandaloneExaminationAndIsNotEditMode =
  'isStandaloneExamination && isNotEdit';

/* ── Shared display helpers ── */
const InfoRow = ({ label, value }) => (
  <Box>
    <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>{label}</Text>
    <Text fontSize="sm">{value ?? '—'}</Text>
  </Box>
);

const BoolBadge = ({ value }) => (
  <Badge colorScheme={value ? 'green' : 'gray'} fontSize="xs">
    {value ? 'Yes' : 'No'}
  </Badge>
);

const SectionCard = ({ title, children }) => (
  <Box
    bg="white"
    border="1px solid"
    borderColor="gray.200"
    borderRadius="md"
    overflow="hidden"
    mb={5}
  >
    <Box bg="gray.50" px={5} py={3} borderBottom="1px solid" borderColor="gray.200">
      <Text fontWeight="600" fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wider">
        {title}
      </Text>
    </Box>
    <Box px={5} py={5}>{children}</Box>
  </Box>
);

const paperStatusColor = (s) => {
  if (s === 'published') return 'green';
  if (s === 'draft') return 'yellow';
  if (s === 'finalized') return 'blue';
  return 'gray';
};

/* ── Examination details panel ── */
const ExaminationOverview = ({ courseId }) => {
  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetExaminationById(courseId)
      .then(({ examination: data }) => setExamination(data))
      .catch(() => setError('Failed to load examination details.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="200px">
        <Spinner />
      </Flex>
    );
  }

  if (error || !examination) {
    return (
      <Box p={6}>
        <Text color="red.500">{error || 'Examination not found.'}</Text>
      </Box>
    );
  }

  const duration = getDuration(examination.duration);
  const sections = Array.isArray(examination.sections) ? examination.sections : [];

  return (
    <Box padding={6}>
      {/* Status badges */}
      <Flex gap={2} mb={6} flexWrap="wrap">
        <Badge colorScheme={examination.active ? 'green' : 'gray'} px={3} py={1} fontSize="xs">
          {examination.active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge colorScheme={paperStatusColor(examination.paperStatus)} px={3} py={1} fontSize="xs" textTransform="capitalize">
          {examination.paperStatus || '—'}
        </Badge>
        {examination.markingMode && (
          <Badge colorScheme="purple" px={3} py={1} fontSize="xs" textTransform="capitalize">
            {examination.markingMode} marking
          </Badge>
        )}
      </Flex>

      {/* Overview */}
      <SectionCard title="Overview">
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={5}>
          <InfoRow label="Title" value={examination.title} />
          <InfoRow label="Duration" value={duration.combinedText} />
          <InfoRow label="Number of Questions" value={examination.amountOfQuestions} />
          <InfoRow label="Start Time" value={dayjs(examination.startTime).format('DD/MM/YYYY h:mm a')} />
          <InfoRow label="Pass Threshold" value={examination.passThreshold ? `${examination.passThreshold}%` : null} />
          <InfoRow label="Total Marks" value={examination.totalMarks} />
          <InfoRow label="Navigation Mode" value={examination.navigationMode} />
          <InfoRow label="Created" value={dayjs(examination.createdAt).format('DD/MM/YYYY h:mm a')} />
          <InfoRow label="Last Updated" value={dayjs(examination.updatedAt).format('DD/MM/YYYY h:mm a')} />
        </Grid>
      </SectionCard>

      {/* Paper Sections */}
      {sections.length > 0 && (
        <SectionCard title="Paper Sections">
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor="gray.200">
                  {['#', 'Section Name', 'Questions', 'Time Limit'].map((h) => (
                    <Box key={h} as="th" textAlign="left" py={2} pr={6} color="gray.500" fontWeight="600" fontSize="11px" textTransform="uppercase" letterSpacing="wider">
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {sections.map((s, i) => (
                  <Box as="tr" key={i} borderBottom="1px solid" borderColor="gray.100">
                    <Box as="td" py={3} pr={6} color="gray.400">{i + 1}</Box>
                    <Box as="td" py={3} pr={6} fontWeight="500">{s.section_name}</Box>
                    <Box as="td" py={3} pr={6}>{s.questions_count}</Box>
                    <Box as="td" py={3} pr={6}>{s.time_limit ? `${s.time_limit} min` : '—'}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </SectionCard>
      )}

      {/* Randomization */}
      {examination.randomizationConfig && (
        <SectionCard title="Randomization">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Randomize question order</Text>
              <BoolBadge value={examination.randomizationConfig.question_order} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Randomize option order</Text>
              <BoolBadge value={examination.randomizationConfig.option_order} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {/* UI Settings */}
      {examination.uiSettings && (
        <SectionCard title="UI Settings">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr 1fr' }} gap={5}>
            <InfoRow label="Theme" value={examination.uiSettings.theme} />
            <InfoRow label="Font Size" value={examination.uiSettings.font_size ? `${examination.uiSettings.font_size}px` : null} />
            <InfoRow label="Font Family" value={examination.uiSettings.font_family} />
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>Progress Indicator</Text>
              <BoolBadge value={examination.uiSettings.progress_indicator} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {/* Tools */}
      {examination.toolsEnabled && (
        <SectionCard title="Tools">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={5}>
            <InfoRow label="Calculator" value={examination.toolsEnabled.calculator} />
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>Spellchecker</Text>
              <BoolBadge value={examination.toolsEnabled.spellchecker} />
            </Flex>
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={1}>Scratchpad</Text>
              <BoolBadge value={examination.toolsEnabled.scratchpad} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {/* Accessibility */}
      {examination.accessibilitySettings && (
        <SectionCard title="Accessibility">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            {[
              ['Font Scaling', 'font_scaling'],
              ['Dyslexia-friendly Font', 'dyslexia_font'],
              ['High Contrast', 'high_contrast'],
              ['Screen Reader', 'screen_reader'],
            ].map(([label, key]) => (
              <Flex key={key} justifyContent="space-between" alignItems="center" py={1}>
                <Text fontSize="sm">{label}</Text>
                <BoolBadge value={examination.accessibilitySettings[key]} />
              </Flex>
            ))}
          </Grid>
        </SectionCard>
      )}

      {/* Submission Settings */}
      {examination.submissionSettings && (
        <SectionCard title="Submission Settings">
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Confirmation dialog before submit</Text>
              <BoolBadge value={examination.submissionSettings.confirmation_dialog} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Auto-submit on time expiry</Text>
              <BoolBadge value={examination.submissionSettings.auto_submit} />
            </Flex>
          </Grid>
        </SectionCard>
      )}
    </Box>
  );
};

/* ── Main OverviewPage ── */
const OverviewPage = () => {
  const { id: courseId, assessmentId } = useParams();
  const examinationId = useQueryParams().get('examination');
  const isStandaloneExamination =
    courseId === 'not-set' && assessmentId === 'not-set' && examinationId
      ? true
      : false;

  const isEditMode = isStandaloneExamination
    ? examinationId && examinationId !== 'new'
    : assessmentId && assessmentId !== 'new';

  // When it's a course-module examination in view mode, show full exam details
  const isExaminationView = !isStandaloneExamination && examinationId && examinationId !== 'new';

  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    isStandaloneExamination && !isEditMode
      ? isStandaloneExaminationAndIsNotEditMode
      : isStandaloneExamination && isEditMode
      ? examinationId
      : assessmentId,
    true
  );

  const { resource: users, handleFetchResource } = useFetch();
  useEffect(() => {
    handleFetchResource({
      fetcher: async () => {
        let { users } = await adminGetUserListing();
        users = users.map((user) => ({
          value: user.id,
          label: `${capitalizeFirstLetter(`${user.firstName} ${user.lastName}`)} (${user.email})`,
        }));
        return users;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toast = useToast();
  useEffect(() => {
    if (users.err)
      toast({
        description: 'Something went wrong! please refresh the page',
        position: 'top',
        status: 'error',
        duration: 60000,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.err]);

  // Examination overview takes priority
  if (isExaminationView) {
    return <ExaminationOverview courseId={courseId} />;
  }

  return isEditMode && (isLoading || error) ? (
    <Flex
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Heading color="red.500">{error}</Heading>
      ) : null}
    </Flex>
  ) : isEditMode ? (
    <EditAssessmentPage users={users} assessment={assessment} />
  ) : (
    <CreateAssessmentPage users={users} />
  );
};

const OverviewPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <OverviewPage {...props} />} />;
};

export default OverviewPageRoute;
