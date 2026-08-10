import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Text,
  Flex,
  Box,
  Spinner,
  Badge,
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { FaCertificate, FaDownload } from "react-icons/fa";
import { Button } from "../Button/Button";
import {
  getTranscriptCourseCertificate,
  generateTranscriptCourseCertificate,
  certV2DownloadCertificate,
} from "../../services";

const CERT_TYPES = ["Completion", "Participation", "Achievement"];

const extractCertificate = (res) => {
  const payload = res?.data ?? res;
  return payload?.certificate ?? payload;
};

/**
 * Shared view/generate modal for a single course's certificate on a transcript.
 * Used on both the admin transcript page and the student's own transcript view.
 */
const TranscriptCertificateModal = ({
  isOpen,
  onClose,
  transcriptId,
  courseId,
  courseTitle,
  mode = "view",
  onGenerated,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [certificateType, setCertificateType] = useState("Completion");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(CERT_TYPES[0]);

  useEffect(() => {
    if (isOpen) setSelectedType(CERT_TYPES[0]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !transcriptId || !courseId) return;
    setCertificate(null);
    setPreviewUrl(null);

    if (mode === "generate") {
      setNotFound(true);
      return;
    }

    setNotFound(false);
    setLoading(true);
    getTranscriptCourseCertificate(transcriptId, courseId, selectedType)
      .then((res) => setCertificate(extractCertificate(res)))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast({
            title: err?.response?.data?.message || "Failed to load certificate",
            status: "error",
            duration: 4000,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, transcriptId, courseId, mode, selectedType, toast]);

  useEffect(() => {
    const certificateId = certificate?.certificateId ?? certificate?.certificate_id;
    if (!certificateId) return;
    setPreviewLoading(true);
    let url;
    certV2DownloadCertificate(certificateId)
      .then((svgContent) => {
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      })
      .catch(() => toast({ title: "Could not load certificate preview", status: "error", duration: 4000 }))
      .finally(() => setPreviewLoading(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [certificate, toast]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${courseTitle || "certificate"}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerate = async (typeOverride) => {
    const type = typeOverride ?? certificateType;
    setGenerating(true);
    try {
      const res = await generateTranscriptCourseCertificate(transcriptId, courseId, { certificateType: type });
      const cert = extractCertificate(res);
      setCertificate(cert);
      setNotFound(false);
      toast({ title: `${type} certificate generated`, status: "success", duration: 3000 });
      onGenerated?.(cert);
    } catch (err) {
      const msg =
        err?.response?.status === 422
          ? err?.response?.data?.message || "Student hasn't reached 100% course progress yet"
          : err?.response?.data?.message || "Failed to generate certificate";
      toast({ title: msg, status: "error", duration: 4000 });
    } finally {
      setGenerating(false);
    }
  };

  const showGenerateForm = notFound;
  const isGenerateOnlyMode = mode === "generate";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={certificate ? "2xl" : "md"} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={2}>
            <FaCertificate color="#6b006b" />
            <Text>{courseTitle || "Certificate"}</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {!isGenerateOnlyMode && (
            <HStack spacing={2} mb={4}>
              {CERT_TYPES.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedType === type ? "solid" : "outline"}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </HStack>
          )}
          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : showGenerateForm ? (
            isGenerateOnlyMode ? (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  No certificate has been issued for this course yet. You can manually generate one if the
                  student has met all completion criteria.
                </Text>
                <FormControl>
                  <FormLabel fontSize="sm">Certificate Type</FormLabel>
                  <Select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
                    {CERT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.600" textAlign="center" py={6}>
                No {selectedType} certificate has been generated for this course yet.
              </Text>
            )
          ) : certificate ? (
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    Type
                  </Text>
                  <Badge colorScheme="purple">{certificate.certificateType ?? certificate.certificate_type}</Badge>
                </HStack>
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    Issued
                  </Text>
                  <Text fontSize="sm">
                    {certificate.issueDate ?? certificate.issue_date
                      ? new Date(certificate.issueDate ?? certificate.issue_date).toLocaleDateString()
                      : "—"}
                  </Text>
                </HStack>
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    Status
                  </Text>
                  <Text fontSize="sm">{certificate.status || "Issued"}</Text>
                </HStack>
              </HStack>
              <Box borderWidth="1px" borderRadius="md" bg="gray.50" p={3} minH="200px">
                {previewLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : previewUrl ? (
                  <Box as="img" src={previewUrl} alt={`${courseTitle || "Certificate"} preview`} w="100%" h="auto" display="block" />
                ) : (
                  <Text color="gray.400" textAlign="center" py={6}>
                    Preview unavailable
                  </Text>
                )}
              </Box>
            </VStack>
          ) : (
            <Text color="gray.400" textAlign="center" py={6}>
              Could not load certificate details
            </Text>
          )}
        </ModalBody>
        <ModalFooter gap={2}>
          {showGenerateForm ? (
            isGenerateOnlyMode ? (
              <Button onClick={() => handleGenerate()} isLoading={generating}>
                Generate Certificate
              </Button>
            ) : (
              <Button onClick={() => handleGenerate(selectedType)} isLoading={generating}>
                Generate {selectedType} Certificate
              </Button>
            )
          ) : certificate ? (
            <Button leftIcon={<FaDownload />} onClick={handleDownload} isDisabled={!previewUrl} isLoading={previewLoading}>
              Download
            </Button>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TranscriptCertificateModal;
