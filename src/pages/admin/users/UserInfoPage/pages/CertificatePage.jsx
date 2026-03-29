import { Route } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { Certificate } from "./certTemp";
import useCertificateDetails from "../../../../user/Certificate/hooks/useCertificateDetais";
import { PageLoaderLayout } from "../../../../../layouts";
import { EmptyState } from "../../../../user/Courses/Grades/GradePageUser";
import { Button, Text } from "../../../../../components";
import {
  adminIssueComplianceCertificate,
  adminRevokeComplianceCertificate,
} from "../../../../../services";
import { useParams } from "react-router-dom";

const CertificatePage = () => {
  const { id: learnerId, course_id: courseId } = useParams();
  const toast = useToast();
  const manager = useCertificateDetails();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  const { certificate, isLoading, error } = manager;

  useEffect(() => {
    if (certificate) {
      setCertificateData(certificate);
    }
  }, [certificate]);

  const handleIssueCertificate = async () => {
    setIsSubmitting(true);
    try {
      const learnerName = `${certificateData?.user?.firstName || "Learner"} ${
        certificateData?.user?.lastName || ""
      }`.trim();

      const { certificate: issuedCertificate, message } =
        await adminIssueComplianceCertificate({
          learnerId: learnerId || certificateData?.user?.id || "LRN-001",
          learnerName,
          courseId: courseId || certificateData?.course?.id || "CRS-001",
          courseName: certificateData?.course?.courseTitle || "Course",
          certificateType: "Certificate of Completion",
          format: "SVG",
          issuedBy: "Admin-001",
          status: "Issued",
          remarks: "Course completed successfully",
        });

      setCertificateData((prev) => ({
        ...prev,
        ...issuedCertificate,
        status: issuedCertificate.status,
        certificateId: issuedCertificate.certificateId,
      }));

      toast({
        description: message,
        position: "top",
        status: "success",
      });
    } catch (requestError) {
      toast({
        description: requestError.message || "Failed to issue certificate",
        position: "top",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!certificateData?.certificateId) {
      toast({
        description: "No issued certificate to revoke",
        position: "top",
        status: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { certificate: revokedCertificate, message } =
        await adminRevokeComplianceCertificate(certificateData.certificateId, {
          reason: "Revoked by Admin",
        });

      setCertificateData((prev) => ({
        ...prev,
        ...revokedCertificate,
      }));

      toast({
        description: message,
        position: "top",
        status: "success",
      });
    } catch (requestError) {
      toast({
        description: requestError.message || "Failed to revoke certificate",
        position: "top",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex justifyContent="center" pt={16} minH={"100vh"} px={10}>
      {isLoading ? (
        <PageLoaderLayout />
      ) : (
        <>
          {error ? (
            <EmptyState text={error} />
          ) : (
            <Box>
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Text>
                  Status: {certificateData?.status || "Pending"}
                </Text>
                <Flex gap={2}>
                  <Button
                    onClick={handleIssueCertificate}
                    isLoading={isSubmitting}
                    disabled={certificateData?.status === "Issued"}
                  >
                    Issue Certificate
                  </Button>
                  <Button
                    secondary
                    onClick={handleRevokeCertificate}
                    isLoading={isSubmitting}
                    disabled={certificateData?.status !== "Issued"}
                  >
                    Revoke Certificate
                  </Button>
                </Flex>
              </Flex>
              <Certificate
                name={`${certificateData?.user?.firstName || ""} ${
                  certificateData?.user?.lastName || ""
                }`}
                title={`${certificateData?.course?.courseTitle || ""}`}
              />
            </Box>
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
