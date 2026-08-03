import { Box, Text } from "@chakra-ui/layout";
import { Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { Input } from "../../../components";

// Kept identical to ExamTemplateDetailsPage.jsx's — same question-type badge colors.
const TYPE_COLOR = {
  MCQ: { bg: "#EBF4FF", color: "#3182CE" },
  TrueFalse: { bg: "#F0FFF4", color: "#38A169" },
  FillBlank: { bg: "#FAF5FF", color: "#805AD5" },
  Matching: { bg: "#FFF5F5", color: "#E53E3E" },
  ShortAnswer: { bg: "#FFFAF0", color: "#DD6B20" },
  Essay: { bg: "#F7FAFC", color: "#4A5568" },
};

// Ported verbatim from TemplateStandalone.jsx's breakdown table — per-type
// editable Quantity, read-only Marks (from the selected marking template's
// markDistribution), computed Subtotal.
const QuestionQuantitiesTable = ({
  selectedTemplate,
  types,
  counts,
  onChange,
  examType,
  sectionsWeightageTotal = 0,
  marksTotal,
  quantityTotal,
}) => {
  if (!selectedTemplate) return null;

  return (
    <Box border="1px solid #E2E8F0" borderRadius="8px" padding="16px">
      <Text fontSize="14px" fontWeight="600" color="#4A5568" marginBottom="12px">
        {examType === "hybrid"
          ? `Standalone Questions — marks per type from "${selectedTemplate.markingTemplateName}"`
          : `Question Quantities — marks per type from "${selectedTemplate.markingTemplateName}"`}
      </Text>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th textTransform="none" color="#4A5568">Question Type</Th>
              <Th textTransform="none" color="#4A5568">Quantity</Th>
              <Th textTransform="none" color="#4A5568">Marks (per question)</Th>
              <Th textTransform="none" color="#4A5568">Subtotal</Th>
            </Tr>
          </Thead>
          <Tbody>
            {types.map((type) => {
              const style = TYPE_COLOR[type] || { bg: "#F7FAFC", color: "#718096" };
              const typeMark = selectedTemplate.markDistribution?.[type];
              return (
                <Tr key={type}>
                  <Td>
                    <Badge
                      bg={style.bg}
                      color={style.color}
                      px="8px"
                      py="2px"
                      borderRadius="8px"
                      textTransform="none"
                      fontSize="12px"
                    >
                      {type}
                    </Badge>
                  </Td>
                  <Td fontSize="13px" color="#1A202C">
                    <Input
                      id={`quantity-${type}`}
                      type="number"
                      min={0}
                      placeholder="0"
                      value={counts[type] ?? ""}
                      onChange={(e) => onChange(type, e.target.value)}
                    />
                  </Td>
                  <Td fontSize="13px" fontWeight="600" color="#6b006b">
                    {typeMark ?? "—"}
                  </Td>
                  <Td fontSize="13px" color="#1A202C">
                    {(Number(counts[type]) || 0) * (Number(typeMark) || 0)}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Text fontSize="xs" color="gray.500" mt={2}>
        {examType === "hybrid"
          ? `Sections weightage (${sectionsWeightageTotal}) + Standalone questions (${marksTotal}) = Total Marks (${sectionsWeightageTotal + marksTotal})`
          : `Total: ${quantityTotal} questions, ${marksTotal} marks`}
      </Text>
    </Box>
  );
};

export default QuestionQuantitiesTable;
