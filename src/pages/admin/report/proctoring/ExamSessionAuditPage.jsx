import { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Box, Flex, Grid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td,
  Text, Spinner, Badge, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, useDisclosure, useToast,
} from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import { BreadcrumbItem } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Button, Heading, Link } from '../../../../components';
import { getExamSessionAudit } from '../../../../services';
import AlertTypeBadge from './components/AlertTypeBadge';
import RecordActionModal from './components/RecordActionModal';

const fmtName = (obj) => (obj ? `${obj.firstName ?? ''} ${obj.lastName ?? ''}`.trim() || '—' : '—');
const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString() : '—');

const ACTION_LABELS = {
  warning_issued: 'Warning Issued',
  exam_paused: 'Exam Paused',
  exam_suspended: 'Exam Suspended',
};

const KpiStat = ({ label, value }) => (
  <Box p={5} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
    <Text fontSize="13px" fontWeight="500" color="#667085" mb={1}>{label}</Text>
    <Text fontSize="26px" fontWeight="700" color="#101928">{value ?? '—'}</Text>
  </Box>
);

const ExamSessionAuditPageContent = () => {
  const { examId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const actionModal = useDisclosure();

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getExamSessionAudit(examId);
      setData(result);
    } catch {
      toast({ title: 'Failed to load session audit', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [examId, toast]);

  useEffect(() => { loadAudit(); }, [loadAudit]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Spinner color="#660066" size="xl" />
      </Flex>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" py={16}>
        <Text color="#475367">No audit data found for this exam.</Text>
      </Box>
    );
  }

  const { examTitle, kpis, sessions } = data;

  return (
    <Box as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Flex align="center" gap={3} mb={6}>
        <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => history.goBack()}>
          Back
        </Button>
        <Text fontSize="18px" fontWeight="700" color="#101928">{examTitle}</Text>
      </Flex>

      {/* KPI Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap={5} mb={8}>
        <KpiStat label="Total Events" value={kpis?.totalEvents} />
        <KpiStat label="Unique Students" value={kpis?.uniqueStudents} />
        <KpiStat label="Violation Frequency (%)" value={kpis?.violationFrequency != null ? `${kpis.violationFrequency}%` : '—'} />
        <KpiStat label="Suspended Sessions" value={kpis?.totalSuspendedSessions} />
        <KpiStat label="Alerts per 100 Students" value={kpis?.alertsPer100Students} />
        <KpiStat label="Avg Response Time" value={kpis?.avgProctorResponseTimeMinutes != null ? `${kpis.avgProctorResponseTimeMinutes} min` : '—'} />
        <KpiStat label="Total Sessions" value={kpis?.totalSessions} />
      </Grid>

      {/* Sessions */}
      <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
        <Text fontSize="16px" fontWeight="700" color="#101928" mb={4}>Student Sessions</Text>
        {sessions?.length === 0 ? (
          <Text color="#475367" fontSize="13px" textAlign="center" py={8}>No sessions recorded.</Text>
        ) : (
          <Accordion allowMultiple>
            {sessions?.map((session, idx) => (
              <AccordionItem key={idx} border="1px solid" borderColor="gray.100" borderRadius="md" mb={3}>
                <AccordionButton _expanded={{ bg: '#F9F0FF' }} borderRadius="md" py={4} px={5}>
                  <Flex flex={1} align="center" justify="space-between" textAlign="left" flexWrap="wrap" gap={2}>
                    <Box>
                      <Text fontSize="14px" fontWeight="600" color="#101928">{fmtName(session.student)}</Text>
                      <Text fontSize="12px" color="#475367">{session.student?.email ?? '—'}</Text>
                    </Box>
                    <HStack spacing={4}>
                      <VStack spacing={0} align="center">
                        <Text fontSize="11px" color="#667085">Alerts</Text>
                        <Text fontSize="14px" fontWeight="700" color="#B54708">{session.alertCount ?? 0}</Text>
                      </VStack>
                      <VStack spacing={0} align="center">
                        <Text fontSize="11px" color="#667085">Violations</Text>
                        <Text fontSize="14px" fontWeight="700" color="#D92D20">{session.violationCount ?? 0}</Text>
                      </VStack>
                      <VStack spacing={0} align="center">
                        <Text fontSize="11px" color="#667085">Warnings</Text>
                        <Text fontSize="14px" fontWeight="700" color="#B54708">{session.warningCount ?? 0}</Text>
                      </VStack>
                      <VStack spacing={0} align="center">
                        <Text fontSize="11px" color="#667085">Flags</Text>
                        <Text fontSize="14px" fontWeight="700" color="#3538CD">{session.systemFlagCount ?? 0}</Text>
                      </VStack>
                      {session.latestAction && (
                        <Badge
                          px={3} py={1} borderRadius="full" fontSize="11px"
                          bg="#E0F2FE" color="#0369A1" fontWeight="500" textTransform="none"
                        >
                          {ACTION_LABELS[session.latestAction.actionTaken] ?? session.latestAction.actionTaken}
                        </Badge>
                      )}
                    </HStack>
                  </Flex>
                  <AccordionIcon ml={3} />
                </AccordionButton>
                <AccordionPanel pb={4} px={5}>
                  <Flex mb={3} justify="space-between" align="center">
                    <HStack spacing={4} fontSize="12px" color="#475367">
                      <Text>Proctor: <b>{fmtName(session.proctor)}</b></Text>
                      <Text>Start: <b>{fmtTime(session.sessionStart)}</b></Text>
                      <Text>End: <b>{fmtTime(session.sessionEnd)}</b></Text>
                    </HStack>
                  </Flex>
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th px={3} py={2} fontSize="11px" color="#344054" textTransform="none">Alert Type</Th>
                          <Th px={3} py={2} fontSize="11px" color="#344054" textTransform="none">Description</Th>
                          <Th px={3} py={2} fontSize="11px" color="#344054" textTransform="none">Timestamp</Th>
                          <Th px={3} py={2} fontSize="11px" color="#344054" textTransform="none">Status</Th>
                          <Th px={3} py={2} fontSize="11px" color="#344054" textTransform="none">Action Taken</Th>
                          <Th px={3} py={2} fontSize="11px" color="#344054" textTransform="none"></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {session.events?.map((evt) => {
                          const lastAction = evt.actions?.[evt.actions.length - 1];
                          return (
                            <Tr key={evt.eventId}>
                              <Td px={3} py={3}><AlertTypeBadge type={evt.alertType} /></Td>
                              <Td px={3} py={3} fontSize="12px" color="#475367" maxW="200px">
                                <Text noOfLines={2}>{evt.description ?? '—'}</Text>
                              </Td>
                              <Td px={3} py={3} fontSize="12px" color="#101928">{fmtTime(evt.eventTimestamp)}</Td>
                              <Td px={3} py={3} fontSize="12px" color="#101928">
                                {evt.status ? evt.status.charAt(0).toUpperCase() + evt.status.slice(1) : '—'}
                              </Td>
                              <Td px={3} py={3} fontSize="12px" color="#475367">
                                {lastAction ? ACTION_LABELS[lastAction.actionTaken] ?? lastAction.actionTaken : '—'}
                              </Td>
                              <Td px={3} py={3}>
                                {!lastAction && (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    colorScheme="purple"
                                    onClick={() => { setSelectedEvent({ id: evt.eventId, description: evt.description }); actionModal.onOpen(); }}
                                  >
                                    Record Action
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Box>

      <RecordActionModal
        isOpen={actionModal.isOpen}
        onClose={actionModal.onClose}
        event={selectedEvent}
        onSuccess={loadAudit}
      />
    </Box>
  );
};

export const ExamSessionAuditPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb
      item2={<BreadcrumbItem><Link href="/admin/report/proctoring-audit">Proctoring &amp; Audit</Link></BreadcrumbItem>}
      item3={<BreadcrumbItem isCurrentPage><Link href="#">Exam Session Audit</Link></BreadcrumbItem>}
    />
    <Heading mb={6}>Exam Session Audit</Heading>
    <Route {...rest} render={(props) => <ExamSessionAuditPageContent {...props} />} />
  </AdminMainAreaWrapper>
);

export default ExamSessionAuditPageContent;
