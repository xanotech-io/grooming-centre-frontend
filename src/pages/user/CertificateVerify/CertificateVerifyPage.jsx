import { useEffect, useState } from "react";
import { Route, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiShield } from "react-icons/fi";
import { certV2VerifyCertificate } from "../../../services";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CertificateVerifyPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No verification token provided.");
      setLoading(false);
      return;
    }
    certV2VerifyCertificate(token)
      .then((data) => setResult(data))
      .catch((err) => {
        if (err?.status === 410 || err?.message?.toLowerCase().includes("revoked")) {
          setRevoked(true);
        } else {
          setError(err?.message || "Certificate not found.");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Flex
      minH="100vh"
      bg="#F7F9FC"
      justifyContent="center"
      alignItems="flex-start"
      paddingTop="60px"
      paddingX="16px"
    >
      <Box
        bg="white"
        border="1px solid #E2E8F0"
        borderRadius="16px"
        p="40px"
        maxW="520px"
        w="100%"
        boxShadow="sm"
      >
        {/* Header */}
        <Flex alignItems="center" gap="10px" mb="24px">
          <Box
            w="44px" h="44px" bg="#F0E6FF" borderRadius="10px"
            display="flex" alignItems="center" justifyContent="center" flexShrink={0}
          >
            <FiShield color="#660066" size={20} />
          </Box>
          <Box>
            <Text fontSize="18px" fontWeight="700" color="#101928">Certificate Verification</Text>
            <Text fontSize="12px" color="gray.500">Verify the authenticity of a certificate</Text>
          </Box>
        </Flex>

        <Divider mb="24px" />

        {loading && (
          <Flex justifyContent="center" alignItems="center" py="40px" gap="12px">
            <Spinner size="md" color="#660066" />
            <Text color="gray.500" fontSize="14px">Verifying certificate…</Text>
          </Flex>
        )}

        {!loading && revoked && (
          <Flex direction="column" alignItems="center" py="24px" gap="12px">
            <Box
              w="56px" h="56px" bg="#FFF5F5" borderRadius="50%"
              display="flex" alignItems="center" justifyContent="center"
            >
              <FiXCircle color="#E53E3E" size={24} />
            </Box>
            <Text fontSize="16px" fontWeight="700" color="#742A2A">Certificate Revoked</Text>
            <Text fontSize="14px" color="gray.500" textAlign="center">
              This certificate has been revoked and is no longer valid.
            </Text>
            <Badge bg="#FFF5F5" color="#742A2A" border="1px solid #FC8181" px="10px" py="3px" borderRadius="8px" textTransform="none" fontSize="12px">
              Revoked
            </Badge>
          </Flex>
        )}

        {!loading && error && (
          <Flex direction="column" alignItems="center" py="24px" gap="12px">
            <Box
              w="56px" h="56px" bg="#FFFAF0" borderRadius="50%"
              display="flex" alignItems="center" justifyContent="center"
            >
              <FiAlertCircle color="#ED8936" size={24} />
            </Box>
            <Text fontSize="16px" fontWeight="700" color="#744210">Not Found</Text>
            <Text fontSize="14px" color="gray.500" textAlign="center">{error}</Text>
          </Flex>
        )}

        {!loading && result && (
          <Flex direction="column" gap="0">
            {/* Valid banner */}
            <Flex
              bg="#F0FFF4" border="1px solid #9AE6B4" borderRadius="10px"
              alignItems="center" gap="10px" p="14px" mb="20px"
            >
              <FiCheckCircle color="#276749" size={20} />
              <Box>
                <Text fontSize="14px" fontWeight="700" color="#276749">Certificate Valid</Text>
                <Text fontSize="12px" color="#276749">This certificate has been verified as authentic.</Text>
              </Box>
            </Flex>

            {/* Details */}
            {[
              { label: "Student Name", value: result.studentName },
              { label: "Course", value: result.courseName },
              { label: "Certificate Type", value: result.certificateType },
              { label: "Issue Date", value: formatDate(result.issueDate) },
              { label: "Issued By", value: result.issuer },
              { label: "Status", value: result.status },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Flex justifyContent="space-between" py="12px">
                  <Text fontSize="13px" color="gray.500">{label}</Text>
                  <Text fontSize="13px" fontWeight="600" color="#101928">{value || "—"}</Text>
                </Flex>
                <Divider />
              </Box>
            ))}

            <Text fontSize="11px" color="gray.400" mt="20px" textAlign="center">
              Token: {token}
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export const CertificateVerifyPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CertificateVerifyPage {...props} />} />
);

export default CertificateVerifyPage;
