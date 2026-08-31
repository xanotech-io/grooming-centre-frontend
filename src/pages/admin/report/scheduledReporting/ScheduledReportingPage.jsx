import { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { BreadcrumbItem, Flex } from '@chakra-ui/react';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, ExportMenu, Heading, Link } from '../../../../components';
import { ScheduledReportingScreen } from '../../../../components/ScheduledReporting';
import { tc20ListSchedules } from '../../../../services';

const ScheduledReportingPage = () => <ScheduledReportingScreen />;

export const ScheduledReportingPageRoute = ({ ...rest }) => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    let mounted = true;
    tc20ListSchedules()
      .then(({ schedules: data } = {}) => {
        if (mounted) setSchedules(data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const csvRows = [
    [
      'Schedule ID',
      'Report Name',
      'Frequency',
      'Next Run',
      'Status',
      'Delivery Method',
      'Last Run',
      'Last Status',
    ],
    ...schedules.map((s) => [
      s.scheduleId,
      s.reportName,
      s.frequency,
      s.nextRunDate,
      s.status,
      s.deliveryMethod,
      s.lastRunDate,
      s.lastDeliveryStatus,
    ]),
  ];

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={<BreadcrumbItem isCurrentPage><Link href="/admin/report/scheduled-reporting">Scheduled Reporting</Link></BreadcrumbItem>}
      />
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading mb={0}>Scheduled Reporting</Heading>
        {schedules.length > 0 && (
          <ExportMenu rows={csvRows} filename="scheduled-reporting" title="Scheduled Reporting" />
        )}
      </Flex>
      <Route {...rest} render={(props) => <ScheduledReportingPage {...props} />} />
    </AdminMainAreaWrapper>
  );
};

export default ScheduledReportingPage;
