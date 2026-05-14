import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Badge, BreadcrumbItem } from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link, Spinner, Text } from "../../../../../components";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { adminGetExaminationById } from "../../../../../services";
import { getDuration } from "../../../../../utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const InfoRow = ({ label, value }) => (
  <Box>
    <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
      {label}
    </Text>
    <Text fontSize="text.level2">{value ?? "—"}</Text>
  </Box>
);

const BoolBadge = ({ value }) => (
  <Badge colorScheme={value ? "green" : "gray"} fontSize="xs">
    {value ? "Yes" : "No"}
  </Badge>
);

const SectionCard = ({ title, children }) => (
  <Box
    bg="white"
    border="1px solid"
    borderColor="gray.200"
    borderRadius="md"
    overflow="hidden"
    mb={6}
  >
    <Box bg="gray.50" px={5} py={3} borderBottom="1px solid" borderColor="gray.200">
      <Text fontWeight="600" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="wider">
        {title}
      </Text>
    </Box>
    <Box px={5} py={5}>
      {children}
    </Box>
  </Box>
);

const paperStatusColor = (status) => {
  if (status === "published") return "green";
  if (status === "draft") return "yellow";
  if (status === "finalized") return "blue";
  return "gray";
};

const ViewModuleExaminationPage = () => {
  const history = useHistory();
  const { courseId, moduleId, examinationId } = useParams();
  const [examination, setExamination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetExaminationById(courseId)
      .then(({ examination: data }) => setExamination(data))
      .catch(() => setError("Failed to load examination details."))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" paddingTop="100px">
        <Spinner />
      </Box>
    );
  }

  if (error || !examination) {
    return (
      <AdminMainAreaWrapper>
        <Box paddingY={10} paddingX={6}>
          <Text color="red.500">{error || "Examination not found."}</Text>
        </Box>
      </AdminMainAreaWrapper>
    );
  }

  const duration = getDuration(examination.duration);
  const sections = Array.isArray(examination.sections) ? examination.sections : [];

  return (
    <AdminMainAreaWrapper>
      <Breadcrumb
        item2={<BreadcrumbItem><Link href="/admin/courses">Courses</Link></BreadcrumbItem>}
        item3={<BreadcrumbItem><Link href={`/admin/courses/details/${courseId}/modules`}>Modules</Link></BreadcrumbItem>}
        item4={<BreadcrumbItem><Link href={`/admin/courses/${courseId}/module/${moduleId}/examinations`}>Examinations</Link></BreadcrumbItem>}
        item5={<BreadcrumbItem isCurrentPage><Link href="#">{examination.title}</Link></BreadcrumbItem>}
      />

      {/* ── Header ── */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={8}
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Heading as="h1" fontSize="heading.h3" mb={2}>{examination.title}</Heading>
          <Flex gap={2} flexWrap="wrap">
            <Badge colorScheme={examination.active ? "green" : "gray"} px={3} py={1} fontSize="xs">
              {examination.active ? "Active" : "Inactive"}
            </Badge>
            <Badge colorScheme={paperStatusColor(examination.paperStatus)} px={3} py={1} fontSize="xs" textTransform="capitalize">
              {examination.paperStatus || "—"}
            </Badge>
            {examination.markingMode && (
              <Badge colorScheme="purple" px={3} py={1} fontSize="xs" textTransform="capitalize">
                {examination.markingMode} marking
              </Badge>
            )}
          </Flex>
        </Box>

        <Flex gap={3} flexWrap="wrap">
          {examination.markingMode === "manual" && (
            <Button
              size="sm"
              onClick={() => history.push(`/admin/manual-marking/${examinationId}/students`)}
            >
              Manual Marking
            </Button>
          )}
          <Button
            size="sm"
            secondary
            onClick={() =>
              history.push(
                `/admin/courses/${courseId}/assessment/${courseId}/questions/new?examination=${examinationId}`
              )
            }
          >
            Manage Questions
          </Button>
        </Flex>
      </Flex>

      {/* ── Overview ── */}
      <SectionCard title="Overview">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap={6}>
          <InfoRow label="Duration" value={duration.combinedText} />
          <InfoRow label="Number of Questions" value={examination.amountOfQuestions} />
          <InfoRow label="Start Time" value={dayjs(examination.startTime).format("DD/MM/YYYY h:mm a")} />
          <InfoRow label="Pass Threshold" value={examination.passThreshold ? `${examination.passThreshold}%` : null} />
          <InfoRow label="Total Marks" value={examination.totalMarks} />
          <InfoRow label="Navigation Mode" value={examination.navigationMode} />
          <InfoRow
            label="Created"
            value={dayjs(examination.createdAt).format("DD/MM/YYYY h:mm a")}
          />
          <InfoRow
            label="Last Updated"
            value={dayjs(examination.updatedAt).format("DD/MM/YYYY h:mm a")}
          />
        </Grid>
      </SectionCard>

      {/* ── Paper Sections ── */}
      {sections.length > 0 && (
        <SectionCard title="Paper Sections">
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor="gray.200">
                  {["#", "Section Name", "Questions", "Time Limit"].map((h) => (
                    <Box
                      key={h}
                      as="th"
                      textAlign="left"
                      py={2}
                      pr={6}
                      color="gray.500"
                      fontWeight="600"
                      textTransform="uppercase"
                      fontSize="11px"
                      letterSpacing="wider"
                    >
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {sections.map((s, i) => (
                  <Box as="tr" key={i} borderBottom="1px solid" borderColor="gray.100">
                    <Box as="td" py={3} pr={6} color="gray.400">{i + 1}</Box>
                    <Box as="td" py={3} pr={6} fontWeight="500">{s.section_name}</Box>
                    <Box as="td" py={3} pr={6}>{s.questions_count}</Box>
                    <Box as="td" py={3} pr={6}>{s.time_limit ? `${s.time_limit} min` : "—"}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </SectionCard>
      )}

      {/* ── Randomization ── */}
      {examination.randomizationConfig && (
        <SectionCard title="Randomization">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Randomize question order</Text>
              <BoolBadge value={examination.randomizationConfig.question_order} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Randomize option order</Text>
              <BoolBadge value={examination.randomizationConfig.option_order} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {/* ── UI Settings ── */}
      {examination.uiSettings && (
        <SectionCard title="UI Settings">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} gap={6}>
            <InfoRow label="Theme" value={examination.uiSettings.theme} />
            <InfoRow label="Font Size" value={examination.uiSettings.font_size ? `${examination.uiSettings.font_size}px` : null} />
            <InfoRow label="Font Family" value={examination.uiSettings.font_family} />
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>
                Progress Indicator
              </Text>
              <BoolBadge value={examination.uiSettings.progress_indicator} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {/* ── Tools ── */}
      {examination.toolsEnabled && (
        <SectionCard title="Tools">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={6}>
            <InfoRow label="Calculator" value={examination.toolsEnabled.calculator} />
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>Spellchecker</Text>
              <BoolBadge value={examination.toolsEnabled.spellchecker} />
            </Flex>
            <Flex direction="column">
              <Text fontWeight="bold" color="gray.500" fontSize="text.level3" mb={1}>Scratchpad</Text>
              <BoolBadge value={examination.toolsEnabled.scratchpad} />
            </Flex>
          </Grid>
        </SectionCard>
      )}

      {/* ── Accessibility ── */}
      {examination.accessibilitySettings && (
        <SectionCard title="Accessibility">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            {[
              ["Font Scaling", "font_scaling"],
              ["Dyslexia-friendly Font", "dyslexia_font"],
              ["High Contrast", "high_contrast"],
              ["Screen Reader", "screen_reader"],
            ].map(([label, key]) => (
              <Flex key={key} justifyContent="space-between" alignItems="center" py={1}>
                <Text fontSize="sm">{label}</Text>
                <BoolBadge value={examination.accessibilitySettings[key]} />
              </Flex>
            ))}
          </Grid>
        </SectionCard>
      )}

      {/* ── Submission Settings ── */}
      {examination.submissionSettings && (
        <SectionCard title="Submission Settings">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Confirmation dialog before submit</Text>
              <BoolBadge value={examination.submissionSettings.confirmation_dialog} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" py={1}>
              <Text fontSize="sm">Auto-submit on time expiry</Text>
              <BoolBadge value={examination.submissionSettings.auto_submit} />
            </Flex>
          </Grid>
        </SectionCard>
      )}
    </AdminMainAreaWrapper>
  );
};

export const ViewModuleExaminationPageRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <ViewModuleExaminationPage {...props} />}
    />
  );
};

export default ViewModuleExaminationPageRoute;
