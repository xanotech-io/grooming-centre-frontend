import React from 'react';
import { Box, Flex, Text, Skeleton } from '@chakra-ui/react';

const KPICard = ({ label, value, sub, subColor, isLoading }) => (
    <Box flex="1" minW="160px">
        <Text fontSize="13px" fontWeight="500" color="#475467" mb={2}>
            {label}
        </Text>
        {isLoading ? (
            <Skeleton height="36px" width="80px" mb={1} />
        ) : (
            <Text fontSize="28px" fontWeight="700" color="#101928" lineHeight="1.1" mb={1}>
                {value ?? '—'}
            </Text>
        )}
        {sub && !isLoading && (
            <Text fontSize="12px" fontWeight="500" color={subColor || '#38A169'}>
                {sub}
            </Text>
        )}
    </Box>
);

const Divider = () => <Box w="1px" bg="#E2E8F0" flexShrink={0} />;

const ArchiveKPICards = ({ kpis, isLoading }) => {
    const successRate = kpis?.retrievalSuccessRate != null
        ? `${Number(kpis.retrievalSuccessRate).toFixed(1)}%`
        : '—';

    const avgTime = kpis?.avgRetrievalTimeMs != null
        ? kpis.avgRetrievalTimeMs >= 1000
            ? `${(kpis.avgRetrievalTimeMs / 1000).toFixed(1)}s`
            : `${Math.round(kpis.avgRetrievalTimeMs)}ms`
        : '—';

    return (
        <Flex gap={8} mb={8} px={1} flexWrap="wrap" align="flex-start">
            <KPICard
                label="Total Archived Reports"
                value={kpis?.totalArchivedReports ?? '—'}
                sub="Currently archived"
                isLoading={isLoading}
            />
            <Divider />
            <KPICard
                label="Total Retrieved Reports"
                value={kpis?.totalRetrievedReports ?? '—'}
                sub="Successfully retrieved"
                isLoading={isLoading}
            />
            <Divider />
            <KPICard
                label="Retrieval Success Rate"
                value={isLoading ? null : successRate}
                sub={kpis?.retrievalSuccessRate >= 90 ? 'On target' : 'Below target'}
                subColor={kpis?.retrievalSuccessRate >= 90 ? '#38A169' : '#E53E3E'}
                isLoading={isLoading}
            />
            <Divider />
            <KPICard
                label="Avg. Retrieval Time"
                value={isLoading ? null : avgTime}
                sub="Per retrieval request"
                subColor="#4A5568"
                isLoading={isLoading}
            />
        </Flex>
    );
};

export default ArchiveKPICards;
