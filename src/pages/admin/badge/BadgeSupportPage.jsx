import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  NumberInput,
  NumberInputField,
  useDisclosure,
  useToast,
  Spinner,
  Image,
  IconButton,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { FaSearch, FaFilter, FaRegCalendarAlt } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import {
  adminCreateBadge,
  adminDeleteBadge,
  adminGetBadgeStatistics,
  userGetAllBadges,
} from "../../../services";

const getCategoryLabel = (category) =>
  String(category || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRequiredValue = (criteria = {}) => {
  const firstNumber = Object.values(criteria).find(
    (value) => typeof value === "number",
  );
  return firstNumber ?? "—";
};

const getStatusBadge = (isActive) => {
  if (isActive) {
    return (
      <Badge bg="#E6F4EA" color="#38A169" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
        Active
      </Badge>
    );
  }

  return (
    <Badge bg="#FED7D7" color="#E53E3E" px="12px" py="4px" borderRadius="12px" textTransform="none" fontWeight="500">
      Inactive
    </Badge>
  );
};

const getCriteriaKey = (category) => {
  switch (category) {
    case "course_completion":
      return "coursesCompleted";
    case "assessment_score":
      return "perfectAssessments";
    case "participation":
      return "activitiesCompleted";
    case "time_based":
      return "hoursSpent";
    default:
      return "milestone";
  }
};

const CreateBadgeModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "course_completion",
    required: 1,
    points: 50,
    expiryDays: "",
  });

  const update = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  const resetFile = () => {
    setImageFile(null);
    setImagePreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "course_completion",
      required: 1,
      points: 50,
      expiryDays: "",
    });
    resetFile();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetFile();
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Please select an image file",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      resetFile();
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const getMockUploadedImageUrl = (file) => {
    const safeName = String(file?.name || "badge.png")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    return `https://storage.example.com/badges/${Date.now()}-${safeName}`;
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Badge name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Badge image is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const criteriaKey = getCriteriaKey(form.category);
      const imageUrl = getMockUploadedImageUrl(imageFile);

      const { message } = await adminCreateBadge({
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl,
        category: form.category,
        criteria: { [criteriaKey]: Number(form.required || 0) },
        points: Number(form.points || 0),
        expiryDays: form.expiryDays === "" ? null : Number(form.expiryDays),
      });

      toast({
        title: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: error.message || "Failed to create badge",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      isCentered
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Badge</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="12px">
            <FormControl isRequired>
              <FormLabel>Badge Name</FormLabel>
              <Input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Course Champion"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Awarded for completing 10 courses"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Category</FormLabel>
              <ChakraSelect
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
              >
                <option value="course_completion">Course Completion</option>
                <option value="assessment_score">Assessment Score</option>
                <option value="participation">Participation</option>
                <option value="time_based">Time Based</option>
                <option value="special">Special</option>
              </ChakraSelect>
            </FormControl>

            <Flex gap="10px">
              <FormControl>
                <FormLabel>Required Count</FormLabel>
                <NumberInput
                  value={form.required}
                  min={1}
                  onChange={(valueString) => update("required", valueString)}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Points</FormLabel>
                <NumberInput
                  value={form.points}
                  min={0}
                  onChange={(valueString) => update("points", valueString)}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </Flex>

            <Flex gap="10px">
              <FormControl>
                <FormLabel>Expiry Days</FormLabel>
                <NumberInput
                  value={form.expiryDays}
                  min={1}
                  onChange={(valueString) => update("expiryDays", valueString)}
                >
                  <NumberInputField placeholder="Empty = no expiry" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Badge Image</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageFile ? "Change Image" : "Pick Image"}
                </Button>
                <Text fontSize="12px" color="gray.500" mt={2}>
                  {imageFile ? imageFile.name : "No image selected"}
                </Text>
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt="Badge preview"
                    mt={2}
                    borderRadius="6px"
                    boxSize="56px"
                    objectFit="cover"
                  />
                ) : null}
              </FormControl>
            </Flex>
          </Flex>
        </ModalBody>

        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Save Badge
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const BadgeSupportPage = () => {
  const toast = useToast();
  const createModal = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    totalBadges: 0,
    totalAwarded: 0,
    completionRate: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [badgesResponse, statsResponse] = await Promise.all([
        userGetAllBadges({ page: 1, limit: 50 }),
        adminGetBadgeStatistics(),
      ]);

      setBadges(badgesResponse.rows || []);
      setStats({
        totalBadges: statsResponse.totalBadges || 0,
        totalAwarded: statsResponse.totalAwarded || 0,
        completionRate:
          statsResponse.totalBadges > 0
            ? Math.round((statsResponse.totalAwarded / statsResponse.totalBadges) * 100)
            : 0,
      });
    } catch (error) {
      toast({
        title: error.message || "Failed to fetch badges",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (badgeId) => {
    try {
      const { message } = await adminDeleteBadge(badgeId);
      toast({ title: message, status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch (error) {
      toast({
        title: error.message || "Failed to delete badge",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredBadges = badges.filter((badge) => {
    if (!searchTerm.trim()) return true;
    const needle = searchTerm.trim().toLowerCase();
    return [badge.id, badge.name, badge.description, badge.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  const handleEdit = () => {
    toast({
      title: "Edit flow is coming next",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <CreateBadgeModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={fetchData}
      />

      <AdminMainAreaWrapper>
        <Box marginX="22px" marginY="24px">
          <Flex justifyContent="space-between" alignItems="center" mb="20px">
            <Heading as="h2" fontSize="24px" fontWeight="600">
              Badge Support
            </Heading>
            <Button onClick={createModal.onOpen}>Create new badge</Button>
          </Flex>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="16px" mb="20px">
            <Box bg="white" p="16px" borderRadius="8px" border="1px solid #E2E8F0">
              <Text fontSize="12px" color="gray.500">Total Badges</Text>
              <Text fontSize="24px" fontWeight="700">{stats.totalBadges}</Text>
            </Box>
            <Box bg="white" p="16px" borderRadius="8px" border="1px solid #E2E8F0">
              <Text fontSize="12px" color="gray.500">Total Awarded</Text>
              <Text fontSize="24px" fontWeight="700">{stats.totalAwarded}</Text>
            </Box>
            <Box bg="white" p="16px" borderRadius="8px" border="1px solid #E2E8F0">
              <Text fontSize="12px" color="gray.500">Award Rate</Text>
              <Text fontSize="24px" fontWeight="700">{stats.completionRate}%</Text>
            </Box>
          </Grid>

          <Box bg="white" borderRadius="10px" border="1px solid #E2E8F0" overflow="hidden">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              padding="16px 24px"
              borderBottom="1px solid #E2E8F0"
              flexWrap="wrap"
              gap={4}
            >
              <Flex gap="12px" flex="1" minW="280px">
                <InputGroup maxW="320px">
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="#A0AEC0" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search here..."
                    fontSize="14px"
                    borderRadius="6px"
                    borderColor="#E2E8F0"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    _focus={{ borderColor: "#6b006b", boxShadow: "none" }}
                  />
                </InputGroup>

                <Button
                  variant="outline"
                  leftIcon={<FaFilter color="#4A5568" />}
                  borderColor="#E2E8F0"
                  color="#4A5568"
                  fontSize="14px"
                  fontWeight="500"
                  bg="white"
                >
                  Filter
                </Button>
              </Flex>

              <Button
                variant="outline"
                leftIcon={<FaRegCalendarAlt color="#4A5568" />}
                borderColor="#E2E8F0"
                color="#4A5568"
                fontSize="14px"
                fontWeight="500"
                bg="white"
              >
                Select dates
              </Button>
            </Flex>

            {loading ? (
              <Flex justifyContent="center" py="40px"><Spinner /></Flex>
            ) : (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Badge ID</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Badge Title</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Category</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Required Count</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Points</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Status</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568">Remark</Th>
                      <Th textTransform="none" fontSize="13px" fontWeight="600" color="#4A5568" width="120px">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredBadges.map((badge) => (
                      <Tr key={badge.id}>
                        <Td color="#4A5568" fontSize="14px">{badge.id}</Td>
                        <Td>
                          <Text fontWeight="600" color="#1A202C" fontSize="14px">{badge.name}</Text>
                        </Td>
                        <Td color="#1A202C" fontSize="14px">{getCategoryLabel(badge.category)}</Td>
                        <Td color="#1A202C" fontSize="14px">{getRequiredValue(badge.criteria)}</Td>
                        <Td color="#1A202C" fontSize="14px">{badge.points}</Td>
                        <Td>{getStatusBadge(badge.isActive)}</Td>
                        <Td color="#1A202C" fontSize="14px" maxW="220px" whiteSpace="normal">
                          {badge.description || "—"}
                        </Td>
                        <Td>
                          <Flex gap="6px">
                            <IconButton
                              aria-label="Edit Badge"
                              icon={<FiEdit2 />}
                              variant="outline"
                              size="sm"
                              borderColor="#E2E8F0"
                              onClick={handleEdit}
                            />
                            <IconButton
                              aria-label="Delete Badge"
                              icon={<MdDeleteOutline />}
                              variant="outline"
                              size="sm"
                              borderColor="#E2E8F0"
                              color="red.500"
                              onClick={() => handleDelete(badge.id)}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}

            <Flex justifyContent="space-between" alignItems="center" padding="14px 24px" borderTop="1px solid #E2E8F0">
              <Text fontSize="14px" color="#4A5568">
                Showing {filteredBadges.length} out of {badges.length} items
              </Text>
              <Text fontSize="14px" color="#6B006B" fontWeight="600">
                Page 1
              </Text>
            </Flex>
          </Box>
        </Box>
      </AdminMainAreaWrapper>
    </>
  );
};

export const BadgeSupportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeSupportPage {...props} />} />
);

export default BadgeSupportPageRoute;
