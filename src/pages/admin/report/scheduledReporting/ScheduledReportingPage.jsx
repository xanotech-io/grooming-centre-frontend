import { Route } from 'react-router-dom';
import { BreadcrumbItem } from '@chakra-ui/react';
import { AdminMainAreaWrapper } from '../../../../layouts/admin/MainArea/Wrapper';
import { Breadcrumb, Heading, Link } from '../../../../components';
import { ScheduledReportingScreen } from '../../../../components/ScheduledReporting';

const ScheduledReportingPage = () => <ScheduledReportingScreen />;

export const ScheduledReportingPageRoute = ({ ...rest }) => (
  <AdminMainAreaWrapper>
    <Breadcrumb>
      <BreadcrumbItem>
        <Link to="/admin/report/studentReport">Reports</Link>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <Link to="/admin/report/scheduled-reporting">Scheduled Reporting</Link>
      </BreadcrumbItem>
    </Breadcrumb>
    <Heading mb={6}>Scheduled Reporting</Heading>
    <Route {...rest} render={(props) => <ScheduledReportingPage {...props} />} />
  </AdminMainAreaWrapper>
);

export default ScheduledReportingPage;
