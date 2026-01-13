import { Route } from "react-router-dom";
import { Flex, Box, Text } from "@chakra-ui/layout";

import { Certificate } from "./certTemp";
import useCertificateDetails from "../../../../user/Certificate/hooks/useCertificateDetais";
import { PageLoaderLayout } from "../../../../../layouts";
import { EmptyState } from "../../../../user/Courses/Grades/GradePageUser";

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
            <>
              <Certificate
                name={`${certificate?.user?.firstName} ${certificate?.user?.lastName}`}
                title={`${certificate?.course?.courseTitle}`}
              />
            </>
          )}
          <></>
        </>
      )}
    </Flex>
  );
};

const CertificatePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <CertificatePage {...props} />} />;
};
export default CertificatePageRoute;
