import { Grid, Box, Text, Skeleton } from '@chakra-ui/react';

const CARD_CONFIGS = [
  {
    key: 'totalEventsLogged',
    label: 'Total Events Logged',
    format: (v) => (v != null ? String(v) : '—'),
  },
  {
    key: 'flaggedEventsCount',
    label: 'Flagged Events',
    format: (v) => (v != null ? String(v) : '—'),
  },
  {
    key: 'unauthorizedAccessAttemptsPercentage',
    label: 'Unauthorized Access (%)',
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—'),
  },
  {
    key: 'failedLoginCount',
    label: 'Failed Login Count',
    format: (v) => (v != null ? String(v) : '—'),
  },
];

const AuditKpiCards = ({ kpis, isLoading }) => {
  const successCount = kpis?.successCount ?? kpis?.statusBreakdown?.success;
  const failureCount = kpis?.failureCount ?? kpis?.statusBreakdown?.failure;

  return (
    <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(5, 1fr)' }} gap={6} mb={8}>
      {CARD_CONFIGS.map((cfg) => (
        <Box
          key={cfg.key}
          p={6}
          bg="white"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="sm"
        >
          <Text fontSize="14px" fontWeight="500" color="#475367" mb={2}>
            {cfg.label}
          </Text>
          {isLoading ? (
            <Skeleton height="36px" width="80px" />
          ) : (
            <Text fontSize="28px" fontWeight="700" color="#101928">
              {cfg.format(kpis?.[cfg.key])}
            </Text>
          )}
        </Box>
      ))}
      <Box p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
        <Text fontSize="14px" fontWeight="500" color="#475367" mb={2}>
          Success / Failure Split
        </Text>
        {isLoading ? (
          <Skeleton height="36px" width="100px" />
        ) : (
          <Text fontSize="28px" fontWeight="700" color="#101928">
            <Text as="span" color="green.500">{successCount ?? '—'}</Text>
            {' / '}
            <Text as="span" color="red.500">{failureCount ?? '—'}</Text>
          </Text>
        )}
      </Box>
    </Grid>
  );
};

export default AuditKpiCards;
