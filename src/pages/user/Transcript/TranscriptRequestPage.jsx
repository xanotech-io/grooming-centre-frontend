import { useState } from "react";
import { Route } from "react-router-dom";
import { Box, Flex, Grid, GridItem, Stack } from "@chakra-ui/layout";
import { Badge, useToast } from "@chakra-ui/react";
import Icon from "@chakra-ui/icon";
import {
  FaFileAlt,
  FaStamp,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaAward,
} from "react-icons/fa";
import { Button, ExportMenu, Heading, Text, TranscriptCertificateModal } from "../../../components";
import { studentRequestTranscript } from "../../../services";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";

const TYPES = [
  {
    value: "Unofficial",
    label: "Unofficial Transcript",
    icon: FaFileAlt,
    description: "Issued immediately. Suitable for personal use or informal applications.",
    badge: { label: "Issued instantly", color: "green" },
  },
  {
    value: "Official",
    label: "Official Transcript",
    icon: FaStamp,
    description: "Requires admin approval before issuance. Required for formal admissions or employment verification.",
    badge: { label: "Requires approval", color: "yellow" },
  },
];

const SummaryCard = ({ label, value }) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="md"
    p={4}
    textAlign="center"
    shadow="sm"
  >
    <Text bold fontSize="heading.h3" color="primary.base">
      {value ?? "—"}
    </Text>
    <Text as="level5" color="accent.3" mt={1}>
      {label}
    </Text>
  </Box>
);

const TranscriptRequestPage = () => {
  const toast = useToast();
  const [selectedType, setSelectedType] = useState("Unofficial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [certRecord, setCertRecord] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await studentRequestTranscript({ transcriptType: selectedType });
      setResult(res.data);
      toast({
        description: res.message || "Transcript request submitted successfully",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      toast({
        description: err?.response?.data?.message || err.message || "Unable to submit request",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedType("Unofficial");
  };

  if (result) {
    const { transcript, summary } = result;
    const isIssued = transcript.status === "Issued";

    const exportRows = [
      ["Course", "Score (%)", "Grade", "Certificate"],
      ...(transcript.courseRecords ?? []).map((record) => [
        record.courseTitle ?? "",
        record.score ?? "",
        record.grade ?? "",
        record.certificateId || record.certificateIssued ? "Issued" : "Not issued",
      ]),
    ];

    return (
      <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>
        <Box maxWidth="860px" marginX="auto">
          {/* Success banner */}
          <Flex
            align="center"
            gap={3}
            bg={isIssued ? "green.50" : "blue.50"}
            border="1px"
            borderColor={isIssued ? "green.200" : "blue.200"}
            borderRadius="md"
            p={5}
            mb={6}
          >
            <Icon fontSize="28px" color={isIssued ? "green.500" : "blue.500"}>
              {isIssued ? <FaCheckCircle /> : <FaClock />}
            </Icon>
            <Box>
              <Text bold color={isIssued ? "green.700" : "blue.700"} fontSize="text.level1">
                {isIssued
                  ? "Your transcript has been issued."
                  : "Transcript request submitted — pending admin approval."}
              </Text>
              <Text as="level5" color={isIssued ? "green.600" : "blue.600"} mt={1}>
                Type: {transcript.transcriptType} &nbsp;·&nbsp;
                <Badge
                  colorScheme={isIssued ? "green" : "yellow"}
                  borderRadius="full"
                  px={2}
                  fontSize="11px"
                >
                  {transcript.status}
                </Badge>
              </Text>
            </Box>
          </Flex>

          {/* Summary metrics */}
          <Heading as="h3" fontSize="heading.h4" mb={4}>
            Transcript Summary
          </Heading>
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }}
            gap={4}
            mb={8}
          >
            <GridItem>
              <SummaryCard label="Courses Enrolled" value={summary?.totalCoursesEnrolled} />
            </GridItem>
            <GridItem>
              <SummaryCard label="Courses Completed" value={summary?.totalCoursesCompleted} />
            </GridItem>
            <GridItem>
              <SummaryCard
                label="Completion Rate"
                value={
                  summary?.courseCompletionRate != null
                    ? `${summary.courseCompletionRate}%`
                    : "—"
                }
              />
            </GridItem>
            <GridItem>
              <SummaryCard
                label="Avg. Score"
                value={
                  summary?.weightedAverageScore != null
                    ? `${summary.weightedAverageScore}%`
                    : "—"
                }
              />
            </GridItem>
            <GridItem>
              <SummaryCard label="GPA" value={summary?.gpa?.toFixed?.(1) ?? summary?.gpa ?? "—"} />
            </GridItem>
            <GridItem>
              <SummaryCard
                label="Certs Issued"
                value={
                  summary?.certificatesIssued != null
                    ? `${summary.certificatesIssued} (${summary.certificationRatio}%)`
                    : "—"
                }
              />
            </GridItem>
          </Grid>

          {/* Course records */}
          <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={3}>
            <Heading as="h3" fontSize="heading.h4" mb={0}>
              Course Records
            </Heading>
            <ExportMenu
              rows={exportRows}
              filename="transcript-course-records"
              title="Transcript Course Records"
            />
          </Flex>
          <Box
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
            mb={6}
          >
            {/* Table header */}
            <Grid
              templateColumns="1fr 80px 60px 120px"
              bg="gray.50"
              borderBottom="1px"
              borderColor="gray.200"
              px={5}
              py={3}
            >
              <Text bold as="level5" color="gray.600">Course</Text>
              <Text bold as="level5" color="gray.600" textAlign="center">Score</Text>
              <Text bold as="level5" color="gray.600" textAlign="center">Grade</Text>
              <Text bold as="level5" color="gray.600" textAlign="center">Certificate</Text>
            </Grid>

            {(transcript.courseRecords ?? []).length === 0 ? (
              <Flex justify="center" align="center" py={10}>
                <Text color="gray.400">No course records found.</Text>
              </Flex>
            ) : (
              (transcript.courseRecords ?? []).map((record, idx) => (
                <Grid
                  key={record.courseId ?? idx}
                  templateColumns="1fr 80px 60px 120px"
                  px={5}
                  py={4}
                  borderBottom="1px"
                  borderColor="gray.100"
                  _last={{ borderBottom: "none" }}
                  alignItems="center"
                >
                  <Flex align="center" gap={3}>
                    <Icon color="primary.base" fontSize="16px">
                      <FaGraduationCap />
                    </Icon>
                    <Text bold>{record.courseTitle}</Text>
                  </Flex>

                  <Text textAlign="center" color="gray.700">
                    {record.score != null ? `${record.score}%` : "—"}
                  </Text>

                  <Flex justify="center">
                    <Badge
                      colorScheme={
                        record.grade?.startsWith("A")
                          ? "green"
                          : record.grade?.startsWith("B")
                          ? "blue"
                          : record.grade?.startsWith("C")
                          ? "yellow"
                          : "red"
                      }
                      borderRadius="full"
                      px={2}
                    >
                      {record.grade ?? "—"}
                    </Badge>
                  </Flex>

                  <Flex justify="center" align="center" gap={1}>
                    {record.certificateId || record.certificateIssued ? (
                      <Button
                        xs
                        secondary
                        leftIcon={<FaAward />}
                        onClick={() => setCertRecord(record)}
                      >
                        View
                      </Button>
                    ) : (
                      <Text as="level5" color="gray.400">Not issued</Text>
                    )}
                  </Flex>
                </Grid>
              ))
            )}
          </Box>

          <Flex justify="flex-end">
            <Button secondary onClick={handleReset}>
              Request Another
            </Button>
          </Flex>
        </Box>

        <TranscriptCertificateModal
          isOpen={Boolean(certRecord)}
          onClose={() => setCertRecord(null)}
          transcriptId={transcript.id}
          courseId={certRecord?.courseId}
          courseTitle={certRecord?.courseTitle}
          mode="view"
        />
      </Box>
    );
  }

  return (
    <Box px={{ base: 4, md: 10 }} py={8} {...maxWidthStyles_userPages}>
      <Box maxWidth="680px" marginX="auto">
        <Box mb={8}>
          <Heading as="h1" fontSize="heading.h2" mb={2}>
            Request a Transcript
          </Heading>
          <Text color="accent.3">
            Select the type of transcript you need. Your course records and grades will be automatically compiled.
          </Text>
        </Box>

        {/* Type selector */}
        <Stack spacing={4} mb={8}>
          {TYPES.map((type) => {
            const isSelected = selectedType === type.value;
            return (
              <Box
                key={type.value}
                as="button"
                onClick={() => setSelectedType(type.value)}
                textAlign="left"
                w="full"
                bg="white"
                border="2px"
                borderColor={isSelected ? "primary.base" : "gray.200"}
                borderRadius="lg"
                p={5}
                shadow={isSelected ? "md" : "sm"}
                transition="all .15s"
                _hover={{ borderColor: "primary.base", shadow: "md" }}
              >
                <Flex align="flex-start" gap={4}>
                  <Flex
                    align="center"
                    justify="center"
                    boxSize="44px"
                    borderRadius="md"
                    bg={isSelected ? "primary.base" : "gray.100"}
                    flexShrink={0}
                  >
                    <Icon
                      fontSize="20px"
                      color={isSelected ? "white" : "gray.500"}
                    >
                      <type.icon />
                    </Icon>
                  </Flex>

                  <Box flex={1}>
                    <Flex align="center" gap={2} mb={1}>
                      <Text bold fontSize="text.level1" color={isSelected ? "primary.base" : "gray.800"}>
                        {type.label}
                      </Text>
                      <Badge
                        colorScheme={type.badge.color}
                        borderRadius="full"
                        px={2}
                        fontSize="11px"
                      >
                        {type.badge.label}
                      </Badge>
                    </Flex>
                    <Text as="level5" color="gray.500">
                      {type.description}
                    </Text>
                  </Box>

                  {/* Selection indicator */}
                  <Box
                    boxSize="20px"
                    borderRadius="full"
                    border="2px"
                    borderColor={isSelected ? "primary.base" : "gray.300"}
                    bg={isSelected ? "primary.base" : "white"}
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {isSelected && (
                      <Box boxSize="8px" borderRadius="full" bg="white" />
                    )}
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </Stack>

        {/* Info note */}
        <Box
          bg="blue.50"
          border="1px"
          borderColor="blue.200"
          borderRadius="md"
          p={4}
          mb={8}
        >
          <Text as="level5" color="blue.700">
            <strong>Note:</strong> All enrolled course records, scores, and certificate statuses
            are automatically included. You do not need to select individual courses.
          </Text>
        </Box>

        <Flex justify="flex-end">
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Request {selectedType} Transcript
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export const TranscriptRequestPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <TranscriptRequestPage {...props} />} />;
};

export default TranscriptRequestPage;
