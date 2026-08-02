import { Grid, Box, Text, Skeleton } from '@chakra-ui/react';

const CARD_CONFIGS = [
  {
    key: 'alertsPer100Students',
    label: 'Alerts per 100 Students',
    format: (v) => (v != null ? Number(v).toFixed(1) : '—'),
  },
  {
    key: 'violationFrequency',
    label: 'Violation Frequency (%)',
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—'),
  },
  {
    key: 'avgProctorResponseTimeMinutes',
    label: 'Avg Proctor Response',
    format: (v) => (v != null ? `${Number(v).toFixed(1)} min` : '—'),
  },
  {
    key: 'totalSuspendedSessions',
    label: 'Flagged Sessions',
    format: (v) => (v != null ? String(v) : '—'),
  },
];

const KpiCards = ({ kpis, isLoading }) => {
  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
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
          <Text fontSize="14px" fontWeight="500" color="#101928" mb={2}>
            {cfg.label}
          </Text>
          {isLoading ? (
            <Skeleton height="36px" width="80px" mb={2} />
          ) : (
            <Text fontSize="28px" fontWeight="700" color="#101928" mb={2}>
              {cfg.format(kpis?.[cfg.key])}
            </Text>
          )}
        </Box>
      ))}
    </Grid>
  );
};

export default KpiCards;
