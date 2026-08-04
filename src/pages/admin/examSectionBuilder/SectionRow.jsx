import { Box, Flex, Grid, GridItem, Text, HStack } from "@chakra-ui/layout";
import { Heading, IconButton, Checkbox } from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
import { Button, Input, Select } from "../../../components";
import {
  ALL_QUESTION_TYPES,
  QUESTION_TYPE_LOCK_OPTIONS,
  MARKING_TYPE_LOCK_OPTIONS,
  EMPTY_SECTION,
} from "./examTypeConfig";

// Ported verbatim from TemplateStandalone.jsx's SectionRow — shared by
// Course Exam and Assessment so both apply the same Exam Type/Sections
// rules Standalone Exams established.
const SectionRow = ({ section, idx, onChange, onRemove, disabled }) => (
  <Box
    border="1px solid #E2E8F0"
    borderRadius="8px"
    padding="24px"
    marginBottom="16px"
    bg="white"
  >
    <Flex justifyContent="space-between" alignItems="center" marginBottom="20px">
      <Heading as="h4" size="sm" color="#1A202C">
        Section {idx + 1}
      </Heading>
      <IconButton
        aria-label="Remove section"
        icon={<FiTrash2 size={14} />}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={() => onRemove(idx)}
        isDisabled={disabled}
      />
    </Flex>

    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
      <GridItem colSpan={3}>
        <Input
          id={`section-${idx}-name`}
          label="Name"
          placeholder="Section name e.g. Section A"
          value={section.section_name}
          isDisabled={disabled}
          onChange={(e) => onChange(idx, "section_name", e.target.value)}
        />
      </GridItem>
      <GridItem colSpan={3}>
        <Text fontSize="sm" fontWeight="500" mb={2}>Question Types</Text>
        <HStack spacing={4} flexWrap="wrap">
          <Checkbox
            isChecked={(section.question_types?.length ?? 0) === ALL_QUESTION_TYPES.length}
            isIndeterminate={
              (section.question_types?.length ?? 0) > 0 &&
              section.question_types.length < ALL_QUESTION_TYPES.length
            }
            isDisabled={disabled}
            onChange={(e) =>
              onChange(idx, "question_types", e.target.checked ? ALL_QUESTION_TYPES : [])
            }
          >
            All
          </Checkbox>
          {QUESTION_TYPE_LOCK_OPTIONS.filter((o) => o.value !== "").map((opt) => (
            <Checkbox
              key={opt.value}
              isChecked={(section.question_types ?? []).includes(opt.value)}
              isDisabled={disabled}
              onChange={(e) => {
                const current = section.question_types ?? [];
                const next = e.target.checked
                  ? [...current, opt.value]
                  : current.filter((v) => v !== opt.value);
                onChange(idx, "question_types", next);
              }}
            >
              {opt.label}
            </Checkbox>
          ))}
        </HStack>
      </GridItem>
      <GridItem>
        <Select
          id={`section-${idx}-marking-type`}
          label="Marking Type"
          noEmptyOption
          isDisabled={disabled}
          value={section.marking_type ?? ""}
          onChange={(e) => onChange(idx, "marking_type", e.target.value)}
          options={MARKING_TYPE_LOCK_OPTIONS}
        />
      </GridItem>
      <GridItem>
        <Input
          id={`section-${idx}-weightage`}
          label="Weightage/ total score"
          type="number"
          min={0}
          placeholder="e.g. 20"
          value={section.total_marks ?? ""}
          isDisabled={disabled}
          onChange={(e) =>
            onChange(
              idx,
              "total_marks",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        />
      </GridItem>
      <GridItem>
        <Input
          id={`section-${idx}-question-count`}
          label="Question Count"
          type="number"
          min={0}
          placeholder="e.g. 2"
          value={section.questions_count ?? ""}
          isDisabled={disabled}
          onChange={(e) =>
            onChange(
              idx,
              "questions_count",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        />
      </GridItem>
    </Grid>
  </Box>
);

export default SectionRow;

export const SectionsBuilder = ({ sections, onAdd, onChange, onRemove, disabled }) => (
  <>
    {sections.length === 0 && (
      <Text fontSize="sm" color="gray.500" mb={3}>
        No sections added yet. Sections let you group questions and optionally cap time per group.
      </Text>
    )}
    {sections.map((s, i) => (
      <SectionRow
        key={i}
        section={s}
        idx={i}
        onChange={onChange}
        onRemove={onRemove}
        disabled={disabled}
      />
    ))}
    <Button secondary type="button" onClick={onAdd} disabled={disabled}>
      + Add Section
    </Button>
  </>
);

export const createEmptySection = () => ({ ...EMPTY_SECTION });
