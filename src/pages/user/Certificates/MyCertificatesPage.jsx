import { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Spinner,
  Text,
  Badge,
  Divider,
} from "@chakra-ui/react";
import {
  FaCertificate,
  FaDownload,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { Heading } from "../../../components";
import { studentGetMyCertificates } from "../../../services";
import { useApp } from "../../../contexts";

const statusConfig = {
  Eligible: {
    color: "#276749",
    bg: "#F0FFF4",
    border: "#9AE6B4",
    icon: FaCheckCircle,
    barColor: "#38A169",
  },
  Pending: {
    color: "#744210",
    bg: "#FFFAF0",
    border: "#F6AD55",
    icon: FaClock,
    barColor: "#ED8936",
  },
  "Not Eligible": {
    color: "#742A2A",
    bg: "#FFF5F5",
    border: "#FC8181",
    icon: FaTimesCircle,
    barColor: "#E53E3E",
  },
};

const SummaryCard = ({ label, value, color }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="12px"
    p="20px 24px"
    flex={1}
    minW="140px"
  >
    <Text fontSize="28px" fontWeight="800" color={color || "#6b006b"}>
      {value}
    </Text>
    <Text fontSize="13px" color="gray.500" mt="2px">
      {label}
    </Text>
  </Box>
);

const CertificateCard = ({ cert }) => {
  const config = statusConfig[cert.status] || statusConfig["Not Eligible"];
  const StatusIcon = config.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Box
      bg="white"
      border="1px solid #E2E8F0"
      borderRadius="12px"
      overflow="hidden"
      _hover={{ borderColor: "#6b006b", shadow: "md" }}
      transition="all 0.15s"
    >
      <Box h="4px" bg={config.barColor} />
      <Box p="20px">
        {/* Icon + title */}
        <Flex alignItems="flex-start" gap="12px" mb="12px">
          <Box
            w="44px"
            h="44px"
            bg="#F0E6FF"
            borderRadius="10px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <FaCertificate color="#6b006b" size={20} />
          </Box>
          <Box flex={1}>
            <Text fontSize="14px" fontWeight="700" color="#1A202C" noOfLines={2}>
              {cert.certificate_title}
            </Text>
            <Text fontSize="12px" color="gray.500" mt="2px" noOfLines={1}>
              {cert.course_title}
            </Text>
          </Box>
        </Flex>

        {/* Status badge */}
        <Flex alignItems="center" gap="6px" mb="12px">
          <StatusIcon size={12} color={config.color} />
          <Badge
            bg={config.bg}
            color={config.color}
            border={`1px solid ${config.border}`}
            px="8px"
            py="2px"
            borderRadius="8px"
            textTransform="none"
            fontSize="11px"
            fontWeight="600"
          >
            {cert.status}
          </Badge>
        </Flex>

        <Divider mb="12px" />

        {/* Dates */}
        <Box mb="14px">
          <Flex justifyContent="space-between" mb="4px">
            <Text fontSize="11px" color="gray.400">
              Completion Date
            </Text>
            <Text fontSize="11px" color="gray.700" fontWeight="600">
              {formatDate(cert.completion_date)}
            </Text>
          </Flex>
          <Flex justifyContent="space-between" mb="4px">
            <Text fontSize="11px" color="gray.400">
              Issued Date
            </Text>
            <Text fontSize="11px" color="gray.700" fontWeight="600">
              {formatDate(cert.issued_date)}
            </Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text fontSize="11px" color="gray.400">
              Expiry Date
            </Text>
            <Text fontSize="11px" color="gray.700" fontWeight="600">
              {cert.expiry_date ? formatDate(cert.expiry_date) : "No Expiry"}
            </Text>
          </Flex>
        </Box>

        {/* Actions */}
        <Flex gap="8px">
          {cert.download_option === "Yes" && cert.status === "Eligible" && (
            <Box
              as="a"
              href={cert.verification_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              flex={1}
            >
              <Flex
                justifyContent="center"
                alignItems="center"
                gap="6px"
                py="9px"
                bg="#F0FFF4"
                borderRadius="6px"
                border="1px solid #9AE6B4"
                color="#276749"
                fontSize="12px"
                fontWeight="600"
                _hover={{ bg: "#c6e8d1" }}
                cursor="pointer"
              >
                <FaDownload size={11} />
                Download
              </Flex>
            </Box>
          )}
          {cert.verification_link && cert.status === "Eligible" && (
            <Box
              as="a"
              href={cert.verification_link}
              target="_blank"
              rel="noopener noreferrer"
              flex={1}
            >
              <Flex
                justifyContent="center"
                alignItems="center"
                gap="6px"
                py="9px"
                bg="#F0E6FF"
                borderRadius="6px"
                border="1px solid #e0c9e0"
                color="#6b006b"
                fontSize="12px"
                fontWeight="600"
                _hover={{ bg: "#e0c9e0" }}
                cursor="pointer"
              >
                <FaExternalLinkAlt size={10} />
                Verify
              </Flex>
            </Box>
          )}
          {cert.status === "Pending" && (
            <Flex
              flex={1}
              justifyContent="center"
              alignItems="center"
              py="9px"
              bg="#FFFAF0"
              borderRadius="6px"
              border="1px solid #F6AD55"
              color="#744210"
              fontSize="12px"
              fontWeight="600"
            >
              Awaiting Eligibility
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

const MyCertificatesPage = () => {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const learnerId = state?.user?.id || state?.user?._id;
    studentGetMyCertificates({ learnerId })
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [state?.user]);

  const certs = data?.certificates || [];
  const summary = data?.summary || {};

  return (
    <Box
      paddingX={{ base: "16px", tablet: "40px", laptop: "80px" }}
      paddingY="32px"
      minH="100vh"
      bg="#F7F9FC"
    >
      {/* Header */}
      <Box mb="28px">
        <Heading fontSize="24px" fontWeight="700" color="#1A202C">
          My Certificates
        </Heading>
        <Text fontSize="14px" color="gray.500" mt="4px">
          View, download and verify your earned certificates
        </Text>
      </Box>

      {loading && (
        <Flex justifyContent="center" alignItems="center" minH="300px">
          <Spinner size="xl" color="#6b006b" />
        </Flex>
      )}

      {!loading && (
        <>
          {/* Summary strip */}
          <Flex gap="12px" flexWrap="wrap" mb="28px">
            <SummaryCard label="Total Certificates" value={summary.total_certificates ?? 0} />
            <SummaryCard
              label="Eligible"
              value={summary.eligible_certificates ?? 0}
              color="#38A169"
            />
            <SummaryCard
              label="Pending"
              value={summary.pending_certificates ?? 0}
              color="#ED8936"
            />
            <SummaryCard
              label="Downloadable"
              value={summary.downloadable_certificates ?? 0}
              color="#6b006b"
            />
            <SummaryCard
              label="Verifiable"
              value={summary.verification_enabled_certificates ?? 0}
              color="#3182CE"
            />
          </Flex>

          {/* Empty state */}
          {certs.length === 0 && (
            <Box
              bg="white"
              border="1px solid #E2E8F0"
              borderRadius="12px"
              p="48px"
              textAlign="center"
            >
              <Box
                w="64px"
                h="64px"
                bg="#F0E6FF"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb="16px"
              >
                <FaCertificate color="#6b006b" size={26} />
              </Box>
              <Text fontSize="16px" fontWeight="600" color="#1A202C" mb="8px">
                No Certificates Yet
              </Text>
              <Text fontSize="14px" color="gray.500" maxW="360px" mx="auto">
                Complete a course to earn your first certificate.
              </Text>
            </Box>
          )}

          {/* Certificate grid */}
          {certs.length > 0 && (
            <>
              <Text fontSize="13px" color="gray.500" mb="16px">
                {certs.length} certificate{certs.length !== 1 ? "s" : ""}
              </Text>
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap="16px"
              >
                {certs.map((cert) => (
                  <CertificateCard key={cert.certificate_id} cert={cert} />
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export const MyCertificatesPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <MyCertificatesPage {...props} />} />
);

export default MyCertificatesPageRoute;
