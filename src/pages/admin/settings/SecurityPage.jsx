import { Route } from "react-router-dom";
import { Flex, BreadcrumbItem } from "@chakra-ui/react";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { Breadcrumb, Link } from "../../../components";

const SecurityPage = () => {
  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={<BreadcrumbItem><Link href="/admin/settings">Settings</Link></BreadcrumbItem>}
          item3={<BreadcrumbItem isCurrentPage><Link href="#">Security</Link></BreadcrumbItem>}
        />
      </Flex>
      SecurityPage
    </AdminMainAreaWrapper>
  );
};

export const SecurityPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <SecurityPage {...props} />} />;
};