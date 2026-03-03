import { Route } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/layout";
import { Text } from "../../../components";
import { Certificate } from "../../admin/users/UserInfoPage/pages/certTemp";
import useCertificateDetails from "./hooks/useCertificateDetais";
import { PageLoaderLayout } from "../../../layouts";
import { EmptyState } from "../Courses/Grades/GradesPage";

const CertificatePage = () => {
  const manager = useCertificateDetails();

  const { certificate, isLoading, error } = manager;
  console.log(certificate);
  return (
    <Flex justifyContent="center" pt={16} minH={"100vh"} px={10}>
      {isLoading ? (
        <PageLoaderLayout />
      ) : (
        <>
          {error ? (
            <EmptyState text={error} />
          ) : (
            <Certificate
              name={`${certificate?.user?.firstName} ${certificate?.user?.lastName}`}
              title={`${certificate?.course?.courseTitle}`}
            />
          )}
          <></>
        </>
      )}
    </Flex>
  );
};

export const CertificatePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CertificatePage {...props} />} />;
};
