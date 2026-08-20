import { Grid, Box, Text, Skeleton } from '@chakra-ui/react';

const CARD_CONFIGS = [
  {
    key: 'complianceRate',
    label: 'Compliance Rate',
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—'),
  },
  {
    key: 'onTimeCompletionRate',
    label: 'On-Time Completion Rate',
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—'),
  },
  {
    key: 'deliverySuccessRate',
    label: 'Delivery Success Rate',
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—'),
  },
  {
    key: 'escalationRate',
    label: 'Escalation Rate',
    format: (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—'),
  },
];

const ComplianceKpiCards = ({ kpis, isLoading }) => (
  <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
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
  </Grid>
);

export default ComplianceKpiCards;
