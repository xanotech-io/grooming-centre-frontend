import { Route } from 'react-router-dom';
import { BreadcrumbItem } from '@chakra-ui/react';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Heading, Link } from '../../../../components';
import { ScheduledReportingScreen } from '../../../../components/ScheduledReporting';

const ScheduledReportingPage = () => <ScheduledReportingScreen />;

export const ScheduledReportingPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb
      item2={<BreadcrumbItem isCurrentPage><Link href="/admin/report/scheduled-reporting">Scheduled Reporting</Link></BreadcrumbItem>}
    />
    <Heading mb={6}>Scheduled Reporting</Heading>
    <Route {...rest} render={(props) => <ScheduledReportingPage {...props} />} />
  </AdminMainAreaWrapper>
);

export default ScheduledReportingPage;
