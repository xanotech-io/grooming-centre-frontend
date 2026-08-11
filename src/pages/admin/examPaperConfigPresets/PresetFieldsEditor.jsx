import React from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  Switch,
  Select as ChakraSelect,
  Input as ChakraInput,
  NumberInput,
  NumberInputField,
  IconButton,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "../../../components";
import {
  EMPTY_SECTION,
  QUESTION_TYPE_LOCK_OPTIONS,
  MARKING_TYPE_LOCK_OPTIONS,
} from "../examSectionBuilder/examTypeConfig";

export const DEFAULT_PRESET_CONFIG = {
  name: "",
  markingTemplateId: "",
  navigationMode: "free",
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
  randomizationMethod: "none",
  randomizationConfig: { shufflePerAttempt: false },
  sections: [],
};

const ToggleRow = ({ label, description, value, onChange, isDisabled }) => (
  <Flex justifyContent="space-between" alignItems="center" py="10px" borderBottom="1px solid #F7FAFC">
    <Box>
      <Text fontSize="13px" fontWeight="500" color="#1A202C">{label}</Text>
      {description && <Text fontSize="12px" color="gray.400">{description}</Text>}
    </Box>
    <Switch isChecked={value} onChange={(e) => onChange(e.target.checked)} colorScheme="purple" isDisabled={isDisabled} />
  </Flex>
);

const FieldGroup = ({ title, children }) => (
  <Box bg="white" border="1px solid #E2E8F0" borderRadius="10px" p="20px" mb="16px">
    <Text fontSize="12px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb="14px">
      {title}
    </Text>
    {children}
  </Box>
);

// Structural fields shared by preset create + edit. `disabled` locks every
// field except name (used when usageCount > 0 — see backend PATCH constraint).
export const buildPresetPayload = (form) => ({
  name: form.name.trim(),
  ...(form.markingTemplateId ? { markingTemplateId: form.markingTemplateId } : {}),
  navigationMode: form.navigationMode,
  uiSettings: form.uiSettings,
  toolsEnabled: form.toolsEnabled,
  accessibilitySettings: form.accessibilitySettings,
  submissionSettings: form.submissionSettings,
  randomizationMethod: form.randomizationMethod,
  randomizationConfig: form.randomizationConfig,
  sections: (form.sections || []).map((s) => ({
    section_name: s.section_name,
    questions_count: Number(s.questions_count) || 0,
    question_type: s.question_type || "",
    marking_type: s.marking_type || "",
    total_marks: s.total_marks ? Number(s.total_marks) : null,
  })),
});

export const hydratePresetForm = (preset) => ({
  name: preset?.name || "",
  markingTemplateId: preset?.markingTemplateId || "",
  navigationMode: preset?.navigationMode || DEFAULT_PRESET_CONFIG.navigationMode,
  uiSettings: { ...DEFAULT_PRESET_CONFIG.uiSettings, ...(preset?.uiSettings || {}) },
  toolsEnabled: { ...DEFAULT_PRESET_CONFIG.toolsEnabled, ...(preset?.toolsEnabled || {}) },
  accessibilitySettings: { ...DEFAULT_PRESET_CONFIG.accessibilitySettings, ...(preset?.accessibilitySettings || {}) },
  submissionSettings: { ...DEFAULT_PRESET_CONFIG.submissionSettings, ...(preset?.submissionSettings || {}) },
  randomizationMethod: preset?.randomizationMethod || "none",
  randomizationConfig: { ...DEFAULT_PRESET_CONFIG.randomizationConfig, ...(preset?.randomizationConfig || {}) },
  sections: preset?.sections?.length ? preset.sections : [],
});

export const PresetFieldsEditor = ({ form, setForm, markingTemplates, markingTemplatesLoading, disabled }) => {
  const set = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.length === 1) {
        next[path[0]] = value;
      } else {
        next[path[0]] = { ...prev[path[0]], [path[1]]: value };
      }
      return next;
    });
  };

  const sections = form.sections || [];

  const addSection = () => set(["sections"], [...sections, { ...EMPTY_SECTION }]);
  const updateSection = (idx, field, value) =>
    set(["sections"], sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  const removeSection = (idx) => set(["sections"], sections.filter((_, i) => i !== idx));

  return (
    <Box>
      <FieldGroup title="Basic Information">
        <Box mb="14px">
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Name *</Text>
          <ChakraInput
            size="sm"
            borderRadius="6px"
            placeholder="e.g. Standard 60-Minute MCQ Paper"
            value={form.name}
            onChange={(e) => set(["name"], e.target.value)}
          />
        </Box>
        <Box>
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Marking Template</Text>
          {markingTemplatesLoading ? (
            <Text fontSize="13px" color="gray.400">Loading templates…</Text>
          ) : (
            <ChakraSelect
              size="sm"
              borderRadius="6px"
              placeholder="None"
              value={form.markingTemplateId}
              onChange={(e) => set(["markingTemplateId"], e.target.value)}
              isDisabled={disabled}
            >
              {markingTemplates.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>{t.templateName || t.name}</option>
              ))}
            </ChakraSelect>
          )}
        </Box>
      </FieldGroup>

      <FieldGroup title="Sections">
        {sections.map((s, i) => (
          <Grid key={i} templateColumns="1.5fr 1fr 1fr 1fr 1fr auto" gap="8px" mb="8px" alignItems="center">
            <ChakraInput
              size="sm" borderRadius="6px" placeholder="Section name"
              value={s.section_name}
              onChange={(e) => updateSection(i, "section_name", e.target.value)}
              isDisabled={disabled}
            />
            <ChakraInput
              size="sm" borderRadius="6px" type="number" placeholder="# Questions"
              value={s.questions_count ?? ""}
              onChange={(e) => updateSection(i, "questions_count", e.target.value)}
              isDisabled={disabled}
            />
            <ChakraSelect
              size="sm" borderRadius="6px"
              value={s.question_type}
              onChange={(e) => updateSection(i, "question_type", e.target.value)}
              isDisabled={disabled}
            >
              {QUESTION_TYPE_LOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </ChakraSelect>
            <ChakraSelect
              size="sm" borderRadius="6px"
              value={s.marking_type}
              onChange={(e) => updateSection(i, "marking_type", e.target.value)}
              isDisabled={disabled}
            >
              {MARKING_TYPE_LOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </ChakraSelect>
            <ChakraInput
              size="sm" borderRadius="6px" type="number" placeholder="Marks"
              value={s.total_marks ?? ""}
              onChange={(e) => updateSection(i, "total_marks", e.target.value)}
              isDisabled={disabled}
            />
            <IconButton
              aria-label="Remove section" icon={<FaTrash />} size="xs" variant="ghost" colorScheme="red"
              onClick={() => removeSection(i)} isDisabled={disabled}
            />
          </Grid>
        ))}
        <Button size="xs" variant="outline" leftIcon={<FaPlus />} onClick={addSection} isDisabled={disabled}>
          Add Section
        </Button>
      </FieldGroup>

      <FieldGroup title="Navigation">
        <RadioGroup value={form.navigationMode} onChange={(v) => set(["navigationMode"], v)} isDisabled={disabled}>
          <Flex direction="column" gap="6px">
            {[
              { value: "free", label: "Free" },
              { value: "forward-only", label: "Forward Only" },
              { value: "section-locked", label: "Section Locked" },
            ].map((opt) => (
              <Radio key={opt.value} value={opt.value} colorScheme="purple">
                <Text fontSize="13px">{opt.label}</Text>
              </Radio>
            ))}
          </Flex>
        </RadioGroup>
      </FieldGroup>

      <FieldGroup title="UI Settings">
        <Flex gap="12px" flexWrap="wrap" mb="12px">
          <Box flex="1" minW="140px">
            <Text fontSize="12px" color="gray.500" mb="4px">Theme</Text>
            <ChakraSelect size="sm" borderRadius="6px" value={form.uiSettings.theme} onChange={(e) => set(["uiSettings", "theme"], e.target.value)} isDisabled={disabled}>
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="high-contrast">High Contrast</option>
            </ChakraSelect>
          </Box>
          <Box flex="1" minW="140px">
            <Text fontSize="12px" color="gray.500" mb="4px">Font Family</Text>
            <ChakraSelect size="sm" borderRadius="6px" value={form.uiSettings.font_family} onChange={(e) => set(["uiSettings", "font_family"], e.target.value)} isDisabled={disabled}>
              <option value="default">Default</option>
              <option value="dyslexia">Dyslexia</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-Serif</option>
            </ChakraSelect>
          </Box>
          <Box flex="0 0 100px">
            <Text fontSize="12px" color="gray.500" mb="4px">Font Size</Text>
            <NumberInput size="sm" min={12} max={24} value={form.uiSettings.font_size} onChange={(v) => set(["uiSettings", "font_size"], Number(v) || 16)} isDisabled={disabled}>
              <NumberInputField borderRadius="6px" />
            </NumberInput>
          </Box>
        </Flex>
        <ToggleRow label="Show Progress Bar" value={form.uiSettings.progress_indicator} onChange={(v) => set(["uiSettings", "progress_indicator"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Tools">
        <Box mb="12px">
          <Text fontSize="12px" color="gray.500" mb="4px">Calculator</Text>
          <ChakraSelect size="sm" borderRadius="6px" maxW="200px" value={form.toolsEnabled.calculator} onChange={(e) => set(["toolsEnabled", "calculator"], e.target.value)} isDisabled={disabled}>
            <option value="none">None</option>
            <option value="basic">Basic</option>
            <option value="scientific">Scientific</option>
          </ChakraSelect>
        </Box>
        <ToggleRow label="Spellchecker" value={form.toolsEnabled.spellchecker} onChange={(v) => set(["toolsEnabled", "spellchecker"], v)} isDisabled={disabled} />
        <ToggleRow label="Scratchpad" value={form.toolsEnabled.scratchpad} onChange={(v) => set(["toolsEnabled", "scratchpad"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Accessibility">
        <ToggleRow label="Font Scaling" value={form.accessibilitySettings.font_scaling} onChange={(v) => set(["accessibilitySettings", "font_scaling"], v)} isDisabled={disabled} />
        <ToggleRow label="Dyslexia Font" value={form.accessibilitySettings.dyslexia_font} onChange={(v) => set(["accessibilitySettings", "dyslexia_font"], v)} isDisabled={disabled} />
        <ToggleRow label="High Contrast" value={form.accessibilitySettings.high_contrast} onChange={(v) => set(["accessibilitySettings", "high_contrast"], v)} isDisabled={disabled} />
        <ToggleRow label="Screen Reader Optimisation" value={form.accessibilitySettings.screen_reader} onChange={(v) => set(["accessibilitySettings", "screen_reader"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Submission Settings">
        <ToggleRow label="Confirmation Dialog" value={form.submissionSettings.confirmation_dialog} onChange={(v) => set(["submissionSettings", "confirmation_dialog"], v)} isDisabled={disabled} />
        <ToggleRow label="Auto-Submit on Expiry" value={form.submissionSettings.auto_submit} onChange={(v) => set(["submissionSettings", "auto_submit"], v)} isDisabled={disabled} />
      </FieldGroup>

      <FieldGroup title="Randomization">
        <Box mb="12px">
          <Text fontSize="12px" color="gray.500" mb="4px">Method</Text>
          <ChakraSelect size="sm" borderRadius="6px" maxW="220px" value={form.randomizationMethod} onChange={(e) => set(["randomizationMethod"], e.target.value)} isDisabled={disabled}>
            <option value="none">None</option>
            <option value="questions">Shuffle Questions</option>
            <option value="options">Shuffle Options</option>
            <option value="both">Shuffle Both</option>
          </ChakraSelect>
        </Box>
        <ToggleRow
          label="Reshuffle Per Attempt"
          description="Generate a new random order on every retry attempt"
          value={form.randomizationConfig.shufflePerAttempt}
          onChange={(v) => set(["randomizationConfig", "shufflePerAttempt"], v)}
          isDisabled={disabled || form.randomizationMethod === "none"}
        />
      </FieldGroup>
    </Box>
  );
};

export default PresetFieldsEditor;
