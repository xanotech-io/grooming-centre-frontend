import React, { useState } from "react";
import { Box, Flex, Grid, GridItem, Text, Divider } from "@chakra-ui/layout";
import { Heading, Switch, HStack, Circle, IconButton } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { FaTrashAlt, FaRegSave, FaFileAlt, FaPlusCircle } from "react-icons/fa";
import { Button, Input, Select } from "../../../components";
import { useQueryParams, useGoBack } from "../../../hooks";

const SectionCard = ({ sectionLetter, onDelete }) => {
    return (
        <Box
            border="1px solid #E2E8F0"
            borderRadius="8px"
            padding="24px"
            marginBottom="24px"
            bg="white"
        >
            <Flex justifyContent="space-between" alignItems="center" marginBottom="20px">
                <Heading as="h4" size="md" color="#1A202C">
                    Section {sectionLetter}
                </Heading>
                <IconButton
                    icon={<FaTrashAlt />}
                    variant="ghost"
                    color="#A0AEC0"
                    _hover={{ color: "red.500", bg: "red.50" }}
                    onClick={onDelete}
                    aria-label="Delete section"
                />
            </Flex>

            <Grid templateColumns="repeat(2, 1fr)" gap={6} marginBottom="24px">
                <GridItem>
                    <Select
                        label="Question type"
                        id={`questionType_${sectionLetter}`}
                        placeholder="Select question type"
                        options={[
                            { label: "Multiple Choice Question (MCQ)", value: "mcq" },
                            { label: "Fill in the blank", value: "fill_blank" },
                            { label: "Essay / Descriptive", value: "essay" },
                        ]}
                    />
                </GridItem>
                <GridItem>
                    <Select
                        label="Marking type"
                        id={`markingType_${sectionLetter}`}
                        placeholder="Select marking type"
                        options={[
                            { label: "Automatic marking", value: "automatic" },
                            { label: "Hybrid marking", value: "hybrid" },
                            { label: "Manual marking", value: "manual" },
                        ]}
                    />
                </GridItem>

                <GridItem>
                    <Input
                        label="Quantity"
                        id={`quantity_${sectionLetter}`}
                        placeholder="Enter the no of questions"
                        type="number"
                    />
                </GridItem>
                <GridItem>
                    <Input
                        label="Total Score"
                        id={`sectionScore_${sectionLetter}`}
                        placeholder="Enter the total score"
                        type="number"
                    />
                </GridItem>
            </Grid>

            <Box>
                <Text fontSize="14px" fontWeight="500" color="#4A5568" marginBottom="12px">
                    Difficulty distribution
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    {/* Mock sliders using static styles for now or custom component */}
                    <Box>
                        <Flex justifyContent="space-between" marginBottom="8px">
                            <Text fontSize="12px" color="#A0AEC0">Easy</Text>
                            <Text fontSize="12px" color="#A0AEC0">40%</Text>
                        </Flex>
                        <Box height="6px" bg="#E6FFFA" borderRadius="full" position="relative">
                            <Box position="absolute" left="40%" top="50%" transform="translate(-50%, -50%)" width="12px" height="12px" bg="#38A169" borderRadius="full" />
                        </Box>
                    </Box>
                    <Box>
                        <Flex justifyContent="space-between" marginBottom="8px">
                            <Text fontSize="12px" color="#A0AEC0">Medium</Text>
                            <Text fontSize="12px" color="#A0AEC0">30%</Text>
                        </Flex>
                        <Box height="6px" bg="#FEFCBF" borderRadius="full" position="relative">
                            <Box position="absolute" left="30%" top="50%" transform="translate(-50%, -50%)" width="12px" height="12px" bg="#D69E2E" borderRadius="full" />
                        </Box>
                    </Box>
                    <Box>
                        <Flex justifyContent="space-between" marginBottom="8px">
                            <Text fontSize="12px" color="#A0AEC0">Hard</Text>
                            <Text fontSize="12px" color="#A0AEC0">30%</Text>
                        </Flex>
                        <Box height="6px" bg="#FED7D7" borderRadius="full" position="relative">
                            <Box position="absolute" left="30%" top="50%" transform="translate(-50%, -50%)" width="12px" height="12px" bg="#E53E3E" borderRadius="full" />
                        </Box>
                    </Box>
                </Grid>
            </Box>
        </Box>
    );
};

const TemplateStandalone = () => {
    const { push } = useHistory();
    const examinationId = useQueryParams().get("examination");
    const handleCancel = useGoBack();

    const [sections, setSections] = useState([{ id: 1, letter: 'A' }, { id: 2, letter: 'B' }, { id: 3, letter: 'C' }]);

    const addSection = () => {
        const nextLetter = String.fromCharCode(65 + sections.length);
        setSections([...sections, { id: Date.now(), letter: nextLetter }]);
    };

    const deleteSection = (id) => {
        setSections(sections.filter(s => s.id !== id).map((s, idx) => ({ ...s, letter: String.fromCharCode(65 + idx) })));
    };

    return (
        <Box marginY="20px" marginX="22px">
            <Grid templateColumns="1fr 350px" gap="30px" alignItems="start">

                {/* Left Column: Template Details */}
                <Box>
                    <Box backgroundColor="white" padding="40px" borderRadius="8px" shadow="sm" marginBottom="30px">
                        <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
                            Template/Marking Scheme Details
                        </Heading>

                        <Grid templateColumns="repeat(2, 1fr)" gap={6} marginBottom="30px">
                            <GridItem>
                                <Input label="Total Score" id="totalScore" placeholder="Enter the total score" type="number" />
                            </GridItem>
                            <GridItem>
                                <Input label="Highest Mark" id="highestMark" placeholder="Enter the highest score" type="number" />
                            </GridItem>
                            <GridItem>
                                <Input label="Average Score" id="averageScore" placeholder="Enter the average score" type="number" />
                            </GridItem>
                            <GridItem>
                                <Input label="Lowest Score" id="lowestScore" placeholder="Enter the lowest score" type="number" />
                            </GridItem>
                        </Grid>

                        {sections.map(section => (
                            <SectionCard
                                key={section.id}
                                sectionLetter={section.letter}
                                onDelete={() => deleteSection(section.id)}
                            />
                        ))}

                        <Button
                            variant="unstyled"
                            color="#6b006b"
                            fontWeight="600"
                            display="flex"
                            alignItems="center"
                            gap="8px"
                            onClick={addSection}
                            marginTop="10px"
                            _hover={{ textDecoration: "none", color: "#520052" }}
                        >
                            <FaPlusCircle size="20px" /> Add new section
                        </Button>
                    </Box>

                    <Flex justifyContent="center" gap="16px">
                        <Button
                            secondary
                            onClick={handleCancel}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="8px"
                            border="1px solid #E2E8F0"
                            color="#6b006b"
                            _hover={{ bg: "gray.50" }}
                        >
                            <FaRegSave />
                            Cancel
                        </Button>
                        <Button
                            onClick={() => push(`/admin/standalone-exams/questions/?examination=${examinationId}`)}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="8px"
                            style={{ backgroundColor: "#6b006b", color: "white" }}
                            _hover={{ bg: "#520052" }}
                        >
                            <FaFileAlt />
                            Next: Questions
                        </Button>
                    </Flex>
                </Box>

                {/* Right Column: Advance Settings */}
                <Box backgroundColor="white" padding="30px" borderRadius="8px" shadow="sm">
                    <Heading as="h3" size="md" marginBottom="24px" color="#1A202C">
                        Advance Settings
                    </Heading>

                    <Text fontSize="14px" fontWeight="600" color="#4A5568" marginBottom="16px">
                        Display and Navigation
                    </Text>

                    <Flex flexDirection="column" gap="20px" marginBottom="30px">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Question per page</Text>
                            <Box width="100px">
                                <Select id="questionPerPage" options={[{ label: "Single", value: "single" }]} />
                            </Box>
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Allow Backtracking</Text>
                            <Switch colorScheme="gray" />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Randomize Questions</Text>
                            <Box width="100px">
                                <Select id="randomize" options={[{ label: "Partial", value: "partial" }]} />
                            </Box>
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Theme Colour</Text>
                            <HStack spacing="12px">
                                <Circle size="24px" bg="#6b006b" border="2px solid white" outline="2px solid #6b006b" cursor="pointer" />
                                <Circle size="24px" bg="#1A202C" cursor="pointer" />
                                <Circle size="24px" bg="#A0AEC0" cursor="pointer" />
                            </HStack>
                        </Flex>
                    </Flex>

                    <Divider borderColor="#E2E8F0" marginBottom="20px" />

                    <Text fontSize="14px" fontWeight="600" color="#4A5568" marginBottom="16px">
                        Student Tools and Multimedia
                    </Text>

                    <Flex flexDirection="column" gap="20px">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">On-Screen Calculator</Text>
                            <Switch colorScheme="gray" />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Spell Checker</Text>
                            <Switch colorScheme="gray" />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Time Waiver</Text>
                            <Switch colorScheme="purple" isChecked={true} />
                        </Flex>

                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="14px" color="#1A202C">Multimedia</Text>
                            <Switch colorScheme="purple" isChecked={true} />
                        </Flex>
                    </Flex>

                </Box>
            </Grid>
        </Box>
    );
};

export default TemplateStandalone;
