import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  BreadcrumbItem,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Switch,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading, Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  getExamPaperConfigPreview,
  getExaminationById,
  publishExamPaperConfig,
  updateExaminationById,
} from "../../../services";
import { useApp } from "../../../contexts/App/useApp";
import {
  FiArrowLeft,
  FiCheck,
  FiEye,
  FiLock,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

// ─── Runtime Rules Derivation ─────────────────────────────────────────────────

const deriveRuntimeRules = (
  navigationMode,
  timeLimitMinutes,
  submissionSettings,
) => ({
  back_navigation_allowed: navigationMode === "free",
  question_skipping:
    navigationMode === "free" || navigationMode === "forward-only",
  section_locked_navigation: navigationMode === "section-locked",
  timer_enforced: (Number(timeLimitMinutes) || 0) > 0,
  auto_submit: submissionSettings?.auto_submit ?? false,
  confirmation_required: submissionSettings?.confirmation_dialog ?? false,
});

// ─── Runtime Rules Panel ─────────────────────────────────────────────────────

const RuleRow = ({ label, value }) => (
  <Flex
    justifyContent="space-between"
    alignItems="center"
    py="8px"
    borderBottom="1px solid #F0F0F0"
  >
    <Text fontSize="13px" color="gray.600">
      {label}
    </Text>
    <Badge
      bg={value ? "#E6F4EA" : "#FFF5EA"}
      color={value ? "#38A169" : "#DD6B20"}
      px="8px"
      py="2px"
      borderRadius="6px"
      textTransform="none"
      fontSize="11px"
    >
      {value ? "✅ Yes" : "❌ No"}
    </Badge>
  </Flex>
);

const RuntimeRulesPanel = ({ rules }) => (
  <Box bg="#F7FAFC" border="1px solid #E2E8F0" borderRadius="8px" p="16px">
    <Text
      fontSize="12px"
      fontWeight="700"
      color="gray.400"
      textTransform="uppercase"
      letterSpacing="wider"
      mb="8px"
    >
      Runtime Rules Preview
    </Text>
    <Text fontSize="11px" color="gray.400" mb="12px">
      These rules are enforced during the student exam session.
    </Text>
    <RuleRow
      label="Back navigation allowed"
      value={rules.back_navigation_allowed}
    />
    <RuleRow
      label="Question skipping allowed"
      value={rules.question_skipping}
    />
    <RuleRow
      label="Section-locked navigation"
      value={rules.section_locked_navigation}
    />
    <RuleRow label="Timer enforced" value={rules.timer_enforced} />
    <RuleRow label="Auto-submit on expiry" value={rules.auto_submit} />
    <RuleRow
      label="Confirmation required on submit"
      value={rules.confirmation_required}
    />
  </Box>
);

// ─── Config Preview Drawer (Screen 2) ────────────────────────────────────────

const BOOL = (v) => (v ? "On" : "Off");

const PreviewRow = ({ label, value }) => (
  <Flex
    justifyContent="space-between"
    py="6px"
    borderBottom="1px solid #F7FAFC"
  >
    <Text fontSize="13px" color="gray.500">
      {label}
    </Text>
    <Text fontSize="13px" fontWeight="500" color="#1A202C">
      {value}
    </Text>
  </Flex>
);

const ConfigPreviewDrawer = ({
  isOpen,
  onClose,
  examinationId,
  onPublish,
  isAdmin,
}) => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isOpen || !examinationId) return;
    setLoading(true);
    getExamPaperConfigPreview(examinationId)
      .then((res) => setData(res?.data ?? res))
      .catch(() =>
        toast({
          title: "Failed to load preview",
          status: "error",
          duration: 3000,
          isClosable: true,
        }),
      )
      .finally(() => setLoading(false));
  }, [isOpen, examinationId, toast]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishExamPaperConfig(examinationId);
      onConfirmClose();
      onClose();
      onPublish(res?.data ?? res);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        toast({
          title: "This examination has already been published.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      } else if (status === 403) {
        toast({
          title:
            "Cannot publish — active approval workflow must be resolved first.",
          status: "error",
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          title: err?.response?.data?.message || "Publish failed",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setPublishing(false);
    }
  };

  const cfg = data;
  const rr = data?.runtimeRules ?? {};
  const isLocked = data?.isLocked;
  const paperStatus = data?.paperStatus ?? cfg?.examination?.paperStatus;

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} size="lg" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid #E2E8F0" pb="16px">
            <Flex alignItems="center" gap="10px">
              <Text fontSize="16px" fontWeight="600">
                Configuration Preview
              </Text>
              {paperStatus && (
                <Badge
                  bg={
                    paperStatus === "published"
                      ? "#E6F4EA"
                      : paperStatus === "archived"
                        ? "#F7FAFC"
                        : "#EBF4FF"
                  }
                  color={
                    paperStatus === "published"
                      ? "#38A169"
                      : paperStatus === "archived"
                        ? "#718096"
                        : "#3182CE"
                  }
                  textTransform="capitalize"
                  px="8px"
                  py="2px"
                  borderRadius="6px"
                  fontSize="11px"
                >
                  {paperStatus}
                </Badge>
              )}
              {isLocked != null && (
                <Badge
                  bg={isLocked ? "#FFF5EA" : "#E6F4EA"}
                  color={isLocked ? "#DD6B20" : "#38A169"}
                  px="8px"
                  py="2px"
                  borderRadius="6px"
                  fontSize="11px"
                >
                  {isLocked ? "🔒 Locked" : "✏️ Editable"}
                </Badge>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerBody py="20px">
            {loading && (
              <Flex justifyContent="center" py="60px">
                <Spinner size="xl" color="#6b006b" />
              </Flex>
            )}
            {!loading && cfg && (
              <Grid templateColumns="1fr 1fr" gap="24px">
                {/* Left: Settings Summary */}
                <Box>
                  <Text
                    fontSize="12px"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb="12px"
                  >
                    Settings
                  </Text>

                  {cfg.configuredSections?.length > 0 && (
                    <Box mb="16px">
                      <Text
                        fontSize="12px"
                        fontWeight="600"
                        color="gray.500"
                        mb="6px"
                      >
                        Sections
                      </Text>
                      {cfg.configuredSections.map((s, i) => (
                        <Flex
                          key={i}
                          justifyContent="space-between"
                          py="4px"
                          borderBottom="1px solid #F7FAFC"
                        >
                          <Text fontSize="12px" color="gray.600">
                            {s.section_name}
                          </Text>
                          <Text fontSize="12px" color="gray.500">
                            {s.questions_count} q
                            {s.time_limit
                              ? ` · ${s.time_limit} min`
                              : " · (exam limit)"}
                          </Text>
                        </Flex>
                      ))}
                    </Box>
                  )}

                  <PreviewRow
                    label="Navigation"
                    value={(cfg.navigationMode || "—").replace(/-/g, " ")}
                  />
                  <PreviewRow
                    label="Time Limit"
                    value={
                      Number(cfg.timeLimitMinutes) > 0
                        ? `${cfg.timeLimitMinutes} min`
                        : "No time limit"
                    }
                  />
                  <PreviewRow
                    label="Randomization"
                    value={`Questions ${BOOL(cfg.randomization?.question_order)} · Options ${BOOL(cfg.randomization?.option_order)}`}
                  />
                  <PreviewRow
                    label="UI Theme"
                    value={`${cfg.uiSettings?.theme ?? "default"} · ${cfg.uiSettings?.font_size ?? 16}px · ${cfg.uiSettings?.font_family ?? "default"}`}
                  />
                  <PreviewRow
                    label="Progress Bar"
                    value={BOOL(cfg.uiSettings?.progress_indicator)}
                  />
                  <PreviewRow
                    label="Calculator"
                    value={cfg.toolsEnabled?.calculator ?? "none"}
                  />
                  <PreviewRow
                    label="Tools"
                    value={`Spell ${BOOL(cfg.toolsEnabled?.spellchecker)} · Scratch ${BOOL(cfg.toolsEnabled?.scratchpad)}`}
                  />
                  <PreviewRow
                    label="Accessibility"
                    value={`Scaling ${BOOL(cfg.accessibilitySettings?.font_scaling)} · Dyslexia ${BOOL(cfg.accessibilitySettings?.dyslexia_font)} · Contrast ${BOOL(cfg.accessibilitySettings?.high_contrast)} · Reader ${BOOL(cfg.accessibilitySettings?.screen_reader)}`}
                  />
                  <PreviewRow
                    label="Submission"
                    value={`Confirm ${BOOL(cfg.submissionSettings?.confirmation_dialog)} · Auto-submit ${BOOL(cfg.submissionSettings?.auto_submit)}`}
                  />
                </Box>

                {/* Right: Runtime Rules */}
                <Box>
                  <Text
                    fontSize="12px"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb="12px"
                  >
                    Runtime Rules
                  </Text>
                  <RuleRow
                    label="Back navigation"
                    value={rr.back_navigation_allowed}
                  />
                  <RuleRow
                    label="Question skipping"
                    value={rr.question_skipping}
                  />
                  <RuleRow
                    label="Section-locked"
                    value={rr.section_locked_navigation}
                  />
                  <RuleRow label="Timer enforced" value={rr.timer_enforced} />
                  <RuleRow label="Auto-submit" value={rr.auto_submit} />
                  <RuleRow
                    label="Confirmation required"
                    value={rr.confirmation_required}
                  />
                </Box>
              </Grid>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px solid #E2E8F0" gap="10px">
            <Button secondary onClick={onClose}>
              Close Preview
            </Button>
            {isAdmin && paperStatus !== "published" && (
              <Button onClick={onConfirmOpen}>Publish Exam</Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">
              Publish this examination?
            </AlertDialogHeader>
            <AlertDialogBody fontSize="14px">
              Once published, all configuration settings will be locked and
              cannot be changed. Students will be able to access this exam
              according to its schedule.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={cancelRef} onClick={onConfirmClose}>
                Cancel
              </Button>
              <Button isLoading={publishing} onClick={handlePublish}>
                Confirm &amp; Publish
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

// ─── Publish Success Panel (Screen 3) ────────────────────────────────────────

const PublishSuccessPanel = ({ result, onReturn }) => {
  const applied = result?.appliedSettings ?? {};
  const rr = result?.runtimeRules ?? {};
  const audit = result?.auditLog ?? {};

  return (
    <Box
      bg="white"
      border="1px solid #C6F6D5"
      borderRadius="10px"
      p="32px"
      maxW="720px"
      mx="auto"
      mt="40px"
    >
      <Flex alignItems="center" gap="12px" mb="24px">
        <Box
          bg="#38A169"
          borderRadius="50%"
          w="40px"
          h="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <FiCheck color="white" size={20} />
        </Box>
        <Box>
          <Heading fontSize="20px" fontWeight="700" color="#276749">
            Examination Published Successfully
          </Heading>
          <Badge
            bg="#E6F4EA"
            color="#38A169"
            px="8px"
            py="2px"
            borderRadius="6px"
            fontSize="12px"
            mt="4px"
            display="inline-block"
          >
            Published
          </Badge>
        </Box>
      </Flex>

      <Grid templateColumns="1fr 1fr" gap="24px" mb="24px">
        <Box>
          <Text
            fontSize="12px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb="10px"
          >
            Applied Settings
          </Text>
          <PreviewRow
            label="Navigation"
            value={(applied.navigationMode || "—").replace(/-/g, " ")}
          />
          <PreviewRow
            label="Time Limit"
            value={
              Number(applied.timeLimitMinutes) > 0
                ? `${applied.timeLimitMinutes} min`
                : "No time limit"
            }
          />
          <PreviewRow
            label="Randomization"
            value={applied.randomizationEnabled ? "Enabled" : "Disabled"}
          />
          <PreviewRow label="UI Theme" value={applied.uiTheme ?? "default"} />
          <PreviewRow label="Auto Submit" value={BOOL(applied.autoSubmit)} />
          {applied.tools && (
            <PreviewRow
              label="Calculator"
              value={applied.tools.calculator ?? "none"}
            />
          )}
        </Box>
        <Box>
          <Text
            fontSize="12px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb="10px"
          >
            Runtime Rules
          </Text>
          <RuleRow label="Back navigation" value={rr.back_navigation_allowed} />
          <RuleRow label="Question skipping" value={rr.question_skipping} />
          <RuleRow
            label="Section-locked"
            value={rr.section_locked_navigation}
          />
          <RuleRow label="Timer enforced" value={rr.timer_enforced} />
          <RuleRow label="Auto-submit" value={rr.auto_submit} />
          <RuleRow
            label="Confirmation required"
            value={rr.confirmation_required}
          />
        </Box>
      </Grid>

      {(audit.publishedBy || audit.timestamp) && (
        <Box bg="#F7FAFC" borderRadius="8px" p="14px" mb="20px">
          <Text
            fontSize="12px"
            fontWeight="700"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb="8px"
          >
            Audit Log
          </Text>
          {audit.publishedBy && (
            <Text fontSize="13px" color="gray.600">
              Published by:{" "}
              <Text as="span" fontWeight="600">
                {audit.publishedBy}
              </Text>
            </Text>
          )}
          {audit.timestamp && (
            <Text fontSize="13px" color="gray.600" mt="2px">
              Timestamp:{" "}
              <Text as="span" fontWeight="600">
                {new Date(audit.timestamp).toLocaleString()}
              </Text>
            </Text>
          )}
        </Box>
      )}

      <Button onClick={onReturn}>Return to Examination</Button>
    </Box>
  );
};

// ─── Section Row ─────────────────────────────────────────────────────────────

const SectionRow = ({ section, idx, isLocked, onChange, onRemove }) => (
  <Flex
    gap="10px"
    alignItems="center"
    p="12px"
    bg="#F7FAFC"
    borderRadius="8px"
    border="1px solid #E2E8F0"
  >
    <Box
      w="24px"
      h="24px"
      bg="#6b006b"
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Text fontSize="11px" fontWeight="700" color="white">
        {idx + 1}
      </Text>
    </Box>
    <FormControl flex="2" minW="120px">
      <Input
        size="sm"
        borderRadius="6px"
        bg="white"
        placeholder="Section A"
        value={section.section_name}
        onChange={(e) => onChange(idx, "section_name", e.target.value)}
        isDisabled={isLocked}
      />
    </FormControl>
    <FormControl flex="1" minW="80px">
      <NumberInput
        size="sm"
        min={1}
        value={section.questions_count}
        onChange={(val) => onChange(idx, "questions_count", Number(val))}
        isDisabled={isLocked}
      >
        <NumberInputField
          borderRadius="6px"
          bg="white"
          placeholder="Questions"
        />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
    <FormControl flex="1" minW="80px">
      <NumberInput
        size="sm"
        min={0}
        value={section.time_limit ?? ""}
        onChange={(val) =>
          onChange(idx, "time_limit", val ? Number(val) : null)
        }
        isDisabled={isLocked}
      >
        <NumberInputField
          borderRadius="6px"
          bg="white"
          placeholder="Min (opt)"
        />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
    {!isLocked && (
      <IconButton
        aria-label="Remove section"
        icon={<FiTrash2 size={13} />}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={() => onRemove(idx)}
      />
    )}
  </Flex>
);

// ─── Toggle Row ───────────────────────────────────────────────────────────────

const ToggleRow = ({ label, description, value, onChange, isDisabled }) => (
  <Flex
    justifyContent="space-between"
    alignItems="center"
    py="12px"
    borderBottom="1px solid #F7FAFC"
  >
    <Box>
      <Text fontSize="13px" fontWeight="500" color="#1A202C">
        {label}
      </Text>
      {description && (
        <Text fontSize="12px" color="gray.400">
          {description}
        </Text>
      )}
    </Box>
    <Switch
      isChecked={value}
      onChange={(e) => onChange(e.target.checked)}
      colorScheme="purple"
      isDisabled={isDisabled}
    />
  </Flex>
);

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({ title, children }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="24px">
    <Text
      fontSize="13px"
      fontWeight="700"
      color="gray.400"
      textTransform="uppercase"
      letterSpacing="wider"
      mb="16px"
    >
      {title}
    </Text>
    {children}
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_SECTION = {
  section_name: "",
  questions_count: 1,
  time_limit: null,
};

const DEFAULT_CONFIG = {
  sections: [],
  navigationMode: "free",
  timeLimitMinutes: 0,
  randomization: { question_order: false, option_order: false },
  uiSettings: {
    theme: "default",
    font_size: 16,
    font_family: "default",
    progress_indicator: true,
  },
  toolsEnabled: { calculator: "none", spellchecker: false, scratchpad: false },
  accessibilitySettings: {
    font_scaling: false,
    dyslexia_font: false,
    high_contrast: false,
    screen_reader: false,
  },
  submissionSettings: { confirmation_dialog: true, auto_submit: false },
};

const ExamPaperConfigPage = () => {
  const { examinationId } = useParams();
  const history = useHistory();
  const toast = useToast();
  const { state, getOneMetadata } = useApp();
  const userRole = getOneMetadata("userRoles", state.user?.userRoleId);
  const isAdmin = /admin/i.test(userRole?.name);

  const [examTitle, setExamTitle] = useState("");
  const [paperStatus, setPaperStatus] = useState("draft");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sections, setSections] = useState(DEFAULT_CONFIG.sections);
  const [navigationMode, setNavigationMode] = useState(
    DEFAULT_CONFIG.navigationMode,
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    DEFAULT_CONFIG.timeLimitMinutes,
  );
  const [randomization, setRandomization] = useState(
    DEFAULT_CONFIG.randomization,
  );
  const [uiSettings, setUiSettings] = useState(DEFAULT_CONFIG.uiSettings);
  const [toolsEnabled, setToolsEnabled] = useState(DEFAULT_CONFIG.toolsEnabled);
  const [accessibilitySettings, setAccessibilitySettings] = useState(
    DEFAULT_CONFIG.accessibilitySettings,
  );
  const [submissionSettings, setSubmissionSettings] = useState(
    DEFAULT_CONFIG.submissionSettings,
  );

  const [publishResult, setPublishResult] = useState(null);
  const [publishError, setPublishError] = useState(null);

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const {
    isOpen: isPublishConfirmOpen,
    onOpen: onPublishConfirmOpen,
    onClose: onPublishConfirmClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [publishing, setPublishing] = useState(false);

  const runtimeRules = deriveRuntimeRules(
    navigationMode,
    timeLimitMinutes,
    submissionSettings,
  );

  const populateFromExam = useCallback((exam) => {
    const d = exam?.data ?? exam;
    setExamTitle(d.title ?? "");
    setPaperStatus(d.paperStatus ?? "draft");
    setSections(d.configuredSections ?? d.sections ?? []);
    setNavigationMode(d.navigationMode ?? "free");
    setTimeLimitMinutes(d.timeLimitMinutes ?? d.duration ?? 0);
    setRandomization(
      d.randomization ?? { question_order: false, option_order: false },
    );
    setUiSettings(d.uiSettings ?? DEFAULT_CONFIG.uiSettings);
    setToolsEnabled(d.toolsEnabled ?? DEFAULT_CONFIG.toolsEnabled);
    setAccessibilitySettings(
      d.accessibilitySettings ?? DEFAULT_CONFIG.accessibilitySettings,
    );
    setSubmissionSettings(
      d.submissionSettings ?? DEFAULT_CONFIG.submissionSettings,
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getExaminationById(examinationId).catch(() => null),
      getExamPaperConfigPreview(examinationId).catch(() => null),
    ])
      .then(([examRes, previewRes]) => {
        if (!mounted) return;
        if (examRes) populateFromExam(examRes);
        if (previewRes) {
          const pr = previewRes?.data ?? previewRes;
          setIsLocked(pr.isLocked ?? false);
          if (pr.paperStatus) setPaperStatus(pr.paperStatus);
          // If preview has config fields, prefer them
          if (pr.configuredSections) setSections(pr.configuredSections);
          if (pr.navigationMode) setNavigationMode(pr.navigationMode);
          if (pr.timeLimitMinutes != null)
            setTimeLimitMinutes(pr.timeLimitMinutes);
          if (pr.randomization) setRandomization(pr.randomization);
          if (pr.uiSettings) setUiSettings(pr.uiSettings);
          if (pr.toolsEnabled) setToolsEnabled(pr.toolsEnabled);
          if (pr.accessibilitySettings)
            setAccessibilitySettings(pr.accessibilitySettings);
          if (pr.submissionSettings)
            setSubmissionSettings(pr.submissionSettings);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [examinationId, populateFromExam]);

  const handleSaveAsDraft = async () => {
    const payload = {
      examType: "standalone_examination",
      configuredSections: sections,
      navigationMode,
      timeLimitMinutes: Number(timeLimitMinutes) || 0,
      randomization,
      uiSettings,
      toolsEnabled,
      accessibilitySettings,
      submissionSettings,
    };
    setSaving(true);
    try {
      await updateExaminationById(examinationId, payload);
      toast({
        title: "Settings saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: err?.response?.data?.message || "Failed to save settings",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishConfirm = async () => {
    setPublishing(true);
    try {
      const res = await publishExamPaperConfig(examinationId);
      onPublishConfirmClose();
      setPublishResult(res?.data ?? res);
      setPaperStatus("published");
      setIsLocked(true);
    } catch (err) {
      onPublishConfirmClose();
      const status = err?.response?.status;
      if (status === 400) {
        toast({
          title: "This examination has already been published.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setPaperStatus("published");
        setIsLocked(true);
      } else if (status === 403) {
        setPublishError(
          "This examination cannot be published because it has an active approval workflow in Pending, Rejected, or Escalated status. Resolve the workflow before publishing.",
        );
      } else {
        toast({
          title: err?.response?.data?.message || "Publish failed",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleSectionChange = (idx, field, value) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="#6b006b" />
      </Flex>
    );
  }

  if (publishResult) {
    return (
      <Box marginX="22px" marginY="20px">
        <PublishSuccessPanel
          result={publishResult}
          onReturn={() => history.goBack()}
        />
      </Box>
    );
  }

  return (
    <AdminMainAreaWrapper>
    <Box marginX="22px" marginY="20px" maxW="900px">
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Exam Paper Config</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      {/* Header */}
      <Flex alignItems="center" gap="12px" mb="20px">
        <Flex
          as="button"
          alignItems="center"
          gap="6px"
          color="#6b006b"
          onClick={() => history.goBack()}
          _hover={{ opacity: 0.8 }}
        >
          <FiArrowLeft size={14} />
          <Text fontSize="13px" fontWeight="600">
            Back
          </Text>
        </Flex>
        <Box w="1px" h="20px" bg="#E2E8F0" />
        <Heading fontSize="20px" fontWeight="600">
          Exam Paper Configuration
        </Heading>
        {examTitle && (
          <>
            <Box w="1px" h="20px" bg="#E2E8F0" />
            <Text fontSize="14px" color="gray.500" noOfLines={1}>
              {examTitle}
            </Text>
          </>
        )}
      </Flex>

      {/* Status Banner */}
      {paperStatus === "published" || isLocked ? (
        <Box
          bg="#FFF5EA"
          border="1px solid #F6AD55"
          borderRadius="8px"
          p="14px"
          mb="20px"
          display="flex"
          alignItems="center"
          gap="10px"
        >
          <FiLock color="#DD6B20" size={16} />
          <Text fontSize="13px" color="#744210" fontWeight="500">
            This exam has been published. Settings are locked and cannot be
            changed.
          </Text>
        </Box>
      ) : (
        <Box
          bg="#EBF4FF"
          border="1px solid #90CDF4"
          borderRadius="8px"
          p="14px"
          mb="20px"
        >
          <Text fontSize="13px" color="#2A4365">
            Draft — settings can still be edited and saved.
          </Text>
        </Box>
      )}

      {/* Publish Error */}
      {publishError && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="8px"
          p="14px"
          mb="20px"
        >
          <Text fontSize="13px" color="red.700">
            {publishError}
          </Text>
          <Text
            fontSize="13px"
            color="#6b006b"
            fontWeight="600"
            mt="6px"
            cursor="pointer"
            onClick={() => history.push("/admin/workflow")}
            _hover={{ textDecoration: "underline" }}
          >
            → Go to Workflow / Approvals
          </Text>
        </Box>
      )}

      <Flex direction="column" gap="20px">
        {/* Section 1: Exam Sections */}
        <SectionCard title="Exam Sections">
          <Flex direction="column" gap="8px">
            <Flex mb="4px" px="12px">
              <Text
                flex="2"
                fontSize="11px"
                fontWeight="600"
                color="gray.400"
                textTransform="uppercase"
              >
                Section Name
              </Text>
              <Text
                flex="1"
                fontSize="11px"
                fontWeight="600"
                color="gray.400"
                textTransform="uppercase"
              >
                Questions
              </Text>
              <Text
                flex="1"
                fontSize="11px"
                fontWeight="600"
                color="gray.400"
                textTransform="uppercase"
              >
                Time (min)
              </Text>
              {!isLocked && <Box w="32px" />}
            </Flex>
            {sections.length === 0 && (
              <Box bg="#F7FAFC" borderRadius="8px" p="20px" textAlign="center">
                <Text fontSize="13px" color="gray.400">
                  No sections configured. Add sections to organize questions.
                </Text>
              </Box>
            )}
            {sections.map((sec, idx) => (
              <SectionRow
                key={idx}
                section={sec}
                idx={idx}
                isLocked={isLocked}
                onChange={handleSectionChange}
                onRemove={(i) =>
                  setSections((prev) => prev.filter((_, pi) => pi !== i))
                }
              />
            ))}
            {!isLocked && sections.length < 10 && (
              <Button
                secondary
                size="sm"
                leftIcon={<FiPlus />}
                alignSelf="flex-start"
                mt="4px"
                onClick={() =>
                  setSections((prev) => [...prev, { ...EMPTY_SECTION }])
                }
              >
                Add Section
              </Button>
            )}
            {sections.length >= 10 && (
              <Text fontSize="12px" color="orange.500">
                Maximum of 10 sections reached.
              </Text>
            )}
          </Flex>
        </SectionCard>

        {/* Section 2: Navigation & Time */}
        <SectionCard title="Navigation &amp; Time">
          <FormControl mb="16px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Navigation Mode
            </FormLabel>
            <RadioGroup
              value={navigationMode}
              onChange={setNavigationMode}
              isDisabled={isLocked}
            >
              <Flex direction="column" gap="8px">
                {[
                  {
                    value: "free",
                    label: "Free",
                    desc: "Students can move anywhere within the exam",
                  },
                  {
                    value: "forward-only",
                    label: "Forward Only",
                    desc: "Students cannot go back to previous questions",
                  },
                  {
                    value: "section-locked",
                    label: "Section Locked",
                    desc: "Students must complete a section before moving to the next",
                  },
                ].map((opt) => (
                  <Box
                    key={opt.value}
                    p="10px"
                    bg="#F7FAFC"
                    borderRadius="8px"
                    border={
                      navigationMode === opt.value
                        ? "2px solid #6b006b"
                        : "1px solid #E2E8F0"
                    }
                  >
                    <Radio value={opt.value} colorScheme="purple">
                      <Text fontSize="13px" fontWeight="500" color="#1A202C">
                        {opt.label}
                      </Text>
                      <Text fontSize="12px" color="gray.400">
                        {opt.desc}
                      </Text>
                    </Radio>
                  </Box>
                ))}
              </Flex>
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Time Limit (minutes)
              <Text as="span" fontSize="12px" color="gray.400" ml="6px">
                — 0 means no time limit
              </Text>
            </FormLabel>
            <NumberInput
              size="sm"
              min={0}
              value={timeLimitMinutes}
              onChange={(val) => setTimeLimitMinutes(Number(val) || 0)}
              isDisabled={isLocked}
              maxW="160px"
            >
              <NumberInputField borderRadius="6px" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {Number(timeLimitMinutes) === 0 && (
              <Text fontSize="12px" color="gray.400" mt="4px">
                No time limit set.
              </Text>
            )}
          </FormControl>
        </SectionCard>

        {/* Section 3: Randomization */}
        <SectionCard title="Randomization">
          <ToggleRow
            label="Shuffle Question Order"
            description="Each student sees questions in a different order"
            value={randomization.question_order}
            onChange={(v) =>
              setRandomization((p) => ({ ...p, question_order: v }))
            }
            isDisabled={isLocked}
          />
          <ToggleRow
            label="Shuffle MCQ Option Order"
            description="Answer choices are randomized for each student"
            value={randomization.option_order}
            onChange={(v) =>
              setRandomization((p) => ({ ...p, option_order: v }))
            }
            isDisabled={isLocked}
          />
        </SectionCard>

        {/* Section 4: UI Settings */}
        <SectionCard title="UI Settings">
          <Flex gap="16px" flexWrap="wrap" mb="16px">
            <FormControl flex="1" minW="150px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Theme
              </FormLabel>
              <Select
                size="sm"
                borderRadius="6px"
                value={uiSettings.theme}
                onChange={(e) =>
                  setUiSettings((p) => ({ ...p, theme: e.target.value }))
                }
                isDisabled={isLocked}
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="high-contrast">High Contrast</option>
              </Select>
            </FormControl>
            <FormControl flex="1" minW="150px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Font Family
              </FormLabel>
              <Select
                size="sm"
                borderRadius="6px"
                value={uiSettings.font_family}
                onChange={(e) =>
                  setUiSettings((p) => ({ ...p, font_family: e.target.value }))
                }
                isDisabled={isLocked}
              >
                <option value="default">Default</option>
                <option value="dyslexia">Dyslexia</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-Serif</option>
              </Select>
            </FormControl>
            <FormControl flex="0 0 120px">
              <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
                Font Size (px)
              </FormLabel>
              <NumberInput
                size="sm"
                min={12}
                max={24}
                value={uiSettings.font_size}
                onChange={(val) =>
                  setUiSettings((p) => ({ ...p, font_size: Number(val) || 16 }))
                }
                isDisabled={isLocked}
              >
                <NumberInputField borderRadius="6px" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Flex>
          <ToggleRow
            label="Show Progress Bar"
            description="Display a progress indicator during the exam"
            value={uiSettings.progress_indicator}
            onChange={(v) =>
              setUiSettings((p) => ({ ...p, progress_indicator: v }))
            }
            isDisabled={isLocked}
          />
        </SectionCard>

        {/* Section 5: Tools */}
        <SectionCard title="Tools">
          <FormControl mb="16px">
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Calculator
            </FormLabel>
            <Select
              size="sm"
              borderRadius="6px"
              maxW="200px"
              value={toolsEnabled.calculator}
              onChange={(e) =>
                setToolsEnabled((p) => ({ ...p, calculator: e.target.value }))
              }
              isDisabled={isLocked}
            >
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="scientific">Scientific</option>
            </Select>
          </FormControl>
          <ToggleRow
            label="Spellchecker"
            description="Enable spell-check on text inputs"
            value={toolsEnabled.spellchecker}
            onChange={(v) =>
              setToolsEnabled((p) => ({ ...p, spellchecker: v }))
            }
            isDisabled={isLocked}
          />
          <ToggleRow
            label="Scratchpad"
            description="Enable in-exam scratch notes panel"
            value={toolsEnabled.scratchpad}
            onChange={(v) => setToolsEnabled((p) => ({ ...p, scratchpad: v }))}
            isDisabled={isLocked}
          />
        </SectionCard>

        {/* Section 6: Accessibility */}
        <SectionCard title="Accessibility">
          <ToggleRow
            label="Font Scaling"
            description="Allow students to scale font size during the exam"
            value={accessibilitySettings.font_scaling}
            onChange={(v) =>
              setAccessibilitySettings((p) => ({ ...p, font_scaling: v }))
            }
            isDisabled={isLocked}
          />
          <ToggleRow
            label="Dyslexia Font"
            description="Apply dyslexia-friendly font for accessibility"
            value={accessibilitySettings.dyslexia_font}
            onChange={(v) =>
              setAccessibilitySettings((p) => ({ ...p, dyslexia_font: v }))
            }
            isDisabled={isLocked}
          />
          <ToggleRow
            label="High Contrast"
            description="Enable high-contrast display mode"
            value={accessibilitySettings.high_contrast}
            onChange={(v) =>
              setAccessibilitySettings((p) => ({ ...p, high_contrast: v }))
            }
            isDisabled={isLocked}
          />
          <ToggleRow
            label="Screen Reader Optimisation"
            description="Optimise layout for screen reader compatibility"
            value={accessibilitySettings.screen_reader}
            onChange={(v) =>
              setAccessibilitySettings((p) => ({ ...p, screen_reader: v }))
            }
            isDisabled={isLocked}
          />
        </SectionCard>

        {/* Section 7: Submission Settings */}
        <SectionCard title="Submission Settings">
          <ToggleRow
            label="Confirmation Dialog"
            description="Show 'Are you sure?' before final submission"
            value={submissionSettings.confirmation_dialog}
            onChange={(v) =>
              setSubmissionSettings((p) => ({ ...p, confirmation_dialog: v }))
            }
            isDisabled={isLocked}
          />
          <ToggleRow
            label="Auto-Submit on Expiry"
            description="Automatically submit the exam when time runs out"
            value={submissionSettings.auto_submit}
            onChange={(v) =>
              setSubmissionSettings((p) => ({ ...p, auto_submit: v }))
            }
            isDisabled={isLocked}
          />
        </SectionCard>

        {/* Runtime Rules Preview */}
        <RuntimeRulesPanel rules={runtimeRules} />

        <Divider />

        {/* Footer Actions */}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="10px"
        >
          <Button secondary leftIcon={<FiEye />} onClick={onPreviewOpen}>
            Preview as Student
          </Button>
          <Flex gap="10px" flexWrap="wrap">
            {!isLocked && (
              <Button
                secondary
                leftIcon={<FiSave />}
                isLoading={saving}
                onClick={handleSaveAsDraft}
              >
                Save as Draft
              </Button>
            )}
            {isAdmin && !isLocked && (
              <Button onClick={onPublishConfirmOpen}>Publish Exam</Button>
            )}
            {isLocked && (
              <Badge
                bg="#E6F4EA"
                color="#38A169"
                px="14px"
                py="8px"
                borderRadius="6px"
                fontSize="13px"
                fontWeight="600"
              >
                Published ✅
              </Badge>
            )}
          </Flex>
        </Flex>
      </Flex>

      {/* Preview Drawer */}
      <ConfigPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        examinationId={examinationId}
        isAdmin={isAdmin}
        onPublish={(result) => {
          onPreviewClose();
          setPublishResult(result);
          setPaperStatus("published");
          setIsLocked(true);
        }}
      />

      {/* Publish Confirmation Dialog */}
      <AlertDialog
        isOpen={isPublishConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onPublishConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px" fontWeight="600">
              Publish this examination?
            </AlertDialogHeader>
            <AlertDialogBody fontSize="14px">
              Once published, all configuration settings will be locked and
              cannot be changed. Students will be able to access this exam
              according to its schedule.
            </AlertDialogBody>
            <AlertDialogFooter gap="8px">
              <Button secondary ref={cancelRef} onClick={onPublishConfirmClose}>
                Cancel
              </Button>
              <Button isLoading={publishing} onClick={handlePublishConfirm}>
                Confirm &amp; Publish
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
    </AdminMainAreaWrapper>
  );
};

export const ExamPaperConfigPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <ExamPaperConfigPage {...props} />} />
);

export default ExamPaperConfigPageRoute;
