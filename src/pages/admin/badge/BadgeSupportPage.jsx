import React, { useCallback, useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input as ChakraInput,
  Select as ChakraSelect,
  Textarea,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Checkbox,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Button, Heading } from "../../../components";
import {
  adminGetBadges,
  adminCreateBadge,
  adminUpdateBadge,
  adminDeactivateBadge,
  adminAddBadgeCourses,
  adminRemoveBadgeCourses,
} from "../../../services";
import { userGetCourseListing } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FaPlus, FaMedal } from "react-icons/fa";

const BADGE_TYPES = ["Open Badge", "Mozilla Badge", "Custom Badge"];
const VALIDATION_METHODS = ["automatic", "manual"];

const statusBadge = (status) => {
  const active = (status || "").toLowerCase() === "active";
  return (
    <Badge
      bg={active ? "#E6F4EA" : "#FED7D7"}
      color={active ? "#38A169" : "#E53E3E"}
      px="10px"
      py="3px"
      borderRadius="10px"
      textTransform="none"
      fontWeight="500"
      fontSize="11px"
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
};

/* ─── Create / Edit Modal ─────────────────────────────────────── */
const BadgeFormModal = ({ isOpen, onClose, onSuccess, badge = null }) => {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    badgeType: "Open Badge",
    description: "",
    issuingAuthority: "",
    validationMethod: "automatic",
    badgeFile: "",
    courseIds: [],
  });

  const isEdit = !!badge;

  useEffect(() => {
    if (isOpen) {
      if (badge) {
        setForm({
          title: badge.title || "",
          badgeType: badge.badgeType || "Open Badge",
          description: badge.description || "",
          issuingAuthority: badge.issuingAuthority || "",
          validationMethod: badge.validationMethod || "automatic",
          badgeFile: badge.badgeFile || "",
          courseIds: (badge.requiredCourseList || []).map((c) => c.id),
        });
      } else {
        setForm({
          title: "",
          badgeType: "Open Badge",
          description: "",
          issuingAuthority: "",
          validationMethod: "automatic",
          badgeFile: "",
          courseIds: [],
        });
      }
      setCourseSearch("");
      userGetCourseListing()
        .then(({ courses: list }) => setCourses(list || []))
        .catch(() => setCourses([]));
    }
  }, [isOpen, badge]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleCourse = (id) =>
    set(
      "courseIds",
      form.courseIds.includes(id)
        ? form.courseIds.filter((c) => c !== id)
        : [...form.courseIds, id],
    );

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", status: "warning", duration: 2000 });
      return;
    }
    if (!form.description.trim()) {
      toast({
        title: "Description is required",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    if (!form.issuingAuthority.trim()) {
      toast({
        title: "Issuing authority is required",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    if (form.courseIds.length === 0) {
      toast({
        title: "Select at least one course",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        badgeType: form.badgeType,
        description: form.description.trim(),
        issuingAuthority: form.issuingAuthority.trim(),
        validationMethod: form.validationMethod,
        badgeFile: form.badgeFile.trim() || undefined,
        courseIds: form.courseIds,
      };
      if (isEdit) {
        await adminUpdateBadge(badge.id, body);
        toast({
          title: "Badge updated",
          status: "success",
          duration: 2000,
        });
      } else {
        await adminCreateBadge(body);
        toast({ title: "Badge created", status: "success", duration: 2000 });
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed to save badge",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!courseSearch.trim()) return true;
    return (c.title || c.name || "")
      .toLowerCase()
      .includes(courseSearch.toLowerCase());
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? "Edit Badge" : "Create Badge"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Title</FormLabel>
              <ChakraInput
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Course Champion"
                size="sm"
              />
            </FormControl>

            <Flex gap="12px">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="sm">Badge Type</FormLabel>
                <ChakraSelect
                  value={form.badgeType}
                  onChange={(e) => set("badgeType", e.target.value)}
                  size="sm"
                >
                  {BADGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="sm">Validation Method</FormLabel>
                <ChakraSelect
                  value={form.validationMethod}
                  onChange={(e) => set("validationMethod", e.target.value)}
                  size="sm"
                >
                  {VALIDATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {capitalizeFirstLetter(m)}
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>
            </Flex>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What is this badge for?"
                size="sm"
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Issuing Authority</FormLabel>
              <ChakraInput
                value={form.issuingAuthority}
                onChange={(e) => set("issuingAuthority", e.target.value)}
                placeholder="e.g. Automated System"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Badge Image URL</FormLabel>
              <ChakraInput
                value={form.badgeFile}
                onChange={(e) => set("badgeFile", e.target.value)}
                placeholder="https://cdn.example.com/badge.png"
                size="sm"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">
                Required Courses
                <Box
                  as="span"
                  ml="8px"
                  bg="#F0E6FF"
                  color="#6b006b"
                  px="8px"
                  py="1px"
                  borderRadius="8px"
                  fontSize="11px"
                  fontWeight="700"
                >
                  {form.courseIds.length} selected (requiredCoursesCount ={" "}
                  {form.courseIds.length})
                </Box>
              </FormLabel>
              <ChakraInput
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search courses…"
                size="sm"
                mb="8px"
              />
              <Box
                border="1px solid #E2E8F0"
                borderRadius="6px"
                maxH="180px"
                overflowY="auto"
                p="8px"
              >
                {filteredCourses.length === 0 && (
                  <Text fontSize="12px" color="gray.400" textAlign="center" py="8px">
                    No courses found
                  </Text>
                )}
                {filteredCourses.map((c) => {
                  const id = c.id || c._id;
                  return (
                    <Checkbox
                      key={id}
                      isChecked={form.courseIds.includes(id)}
                      onChange={() => toggleCourse(id)}
                      size="sm"
                      display="flex"
                      mb="4px"
                      colorScheme="purple"
                    >
                      <Text fontSize="12px">{c.title || c.name}</Text>
                    </Checkbox>
                  );
                })}
              </Box>
            </FormControl>
          </Flex>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button secondary onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button isLoading={saving} onClick={handleSubmit}>
            {isEdit ? "Update Badge" : "Create Badge"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

/* ─── Course Assignment Drawer ─────────────────────────────────── */
const CourseAssignmentDrawer = ({ isOpen, onClose, badge, onDone }) => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);

  const currentIds = (badge?.requiredCourseList || []).map((c) => c.id);

  useEffect(() => {
    if (isOpen) {
      setSelected([]);
      setSearch("");
      userGetCourseListing()
        .then(({ courses: list }) => setCourses(list || []))
        .catch(() => setCourses([]));
    }
  }, [isOpen]);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleAdd = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await adminAddBadgeCourses(badge.id, { courseIds: selected });
      toast({ title: "Courses added", status: "success", duration: 2000 });
      setSelected([]);
      onDone();
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (courseId) => {
    setSaving(true);
    try {
      await adminRemoveBadgeCourses(badge.id, { courseIds: [courseId] });
      toast({ title: "Course removed", status: "success", duration: 2000 });
      onDone();
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const addable = courses.filter(
    (c) =>
      !currentIds.includes(c.id || c._id) &&
      (c.title || c.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Manage Courses — {badge?.title}
        </DrawerHeader>
        <DrawerBody>
          {/* Current required courses */}
          <Text fontSize="12px" fontWeight="700" color="gray.500" mb="8px" textTransform="uppercase">
            Current Required Courses ({currentIds.length})
          </Text>
          {currentIds.length === 0 && (
            <Text fontSize="13px" color="gray.400" mb="16px">
              No courses assigned yet.
            </Text>
          )}
          {(badge?.requiredCourseList || []).map((c) => (
            <Flex
              key={c.id}
              justifyContent="space-between"
              alignItems="center"
              p="10px 12px"
              mb="6px"
              bg="#F7F9FC"
              borderRadius="6px"
              border="1px solid #E2E8F0"
            >
              <Text fontSize="13px" fontWeight="500">
                {c.title || c.name}
              </Text>
              <Button
                secondary
                onClick={() => handleRemove(c.id)}
                disabled={saving}
                size="xs"
              >
                Remove
              </Button>
            </Flex>
          ))}

          <Box h="1px" bg="#E2E8F0" my="16px" />

          {/* Add new courses */}
          <Text fontSize="12px" fontWeight="700" color="gray.500" mb="8px" textTransform="uppercase">
            Add Courses
          </Text>
          <ChakraInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            size="sm"
            mb="8px"
          />
          <Box maxH="260px" overflowY="auto">
            {addable.map((c) => {
              const id = c.id || c._id;
              return (
                <Checkbox
                  key={id}
                  isChecked={selected.includes(id)}
                  onChange={() => toggle(id)}
                  size="sm"
                  display="flex"
                  mb="6px"
                  colorScheme="purple"
                >
                  <Text fontSize="13px">{c.title || c.name}</Text>
                </Checkbox>
              );
            })}
            {addable.length === 0 && (
              <Text fontSize="12px" color="gray.400">
                No courses to add.
              </Text>
            )}
          </Box>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px" gap="10px">
          <Button secondary onClick={onClose}>
            Close
          </Button>
          <Button
            isLoading={saving}
            onClick={handleAdd}
            disabled={!selected.length}
          >
            Add Selected ({selected.length})
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* ─── Deactivate Confirm Modal ─────────────────────────────────── */
const DeactivateModal = ({ isOpen, onClose, badge, onSuccess }) => {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await adminDeactivateBadge(badge.id);
      toast({ title: "Badge deactivated", status: "success", duration: 2000 });
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Deactivate Badge</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            This will deactivate <strong>{badge?.title}</strong>. Existing
            awards will not be affected.
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button secondary onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            isLoading={saving}
            onClick={handleConfirm}
            style={{ background: "#E53E3E" }}
          >
            Deactivate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

/* ─── Main page ────────────────────────────────────────────────── */
const BadgeSupportPage = () => {
  const history = useHistory();
  const toast = useToast();
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const courseDrawer = useDisclosure();
  const deactivateModal = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetBadges();
      setBadges(res?.data || res?.badges || []);
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed to load badges",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const openEdit = (badge) => {
    setSelectedBadge(badge);
    editModal.onOpen();
  };

  const openCourses = (badge) => {
    setSelectedBadge(badge);
    courseDrawer.onOpen();
  };

  const openDeactivate = (badge) => {
    setSelectedBadge(badge);
    deactivateModal.onOpen();
  };

  const filtered =
    activeTab === "all"
      ? badges
      : badges.filter((b) =>
          activeTab === "active"
            ? (b.status || "").toLowerCase() === "active"
            : (b.status || "").toLowerCase() === "inactive",
        );

  const tabs = [
    { key: "all", label: `All (${badges.length})` },
    {
      key: "active",
      label: `Active (${badges.filter((b) => (b.status || "").toLowerCase() === "active").length})`,
    },
    {
      key: "inactive",
      label: `Inactive (${badges.filter((b) => (b.status || "").toLowerCase() === "inactive").length})`,
    },
  ];

  return (
    <>
      <BadgeFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={fetchBadges}
      />
      <BadgeFormModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        onSuccess={fetchBadges}
        badge={selectedBadge}
      />
      <CourseAssignmentDrawer
        isOpen={courseDrawer.isOpen}
        onClose={courseDrawer.onClose}
        badge={selectedBadge}
        onDone={fetchBadges}
      />
      {selectedBadge && (
        <DeactivateModal
          isOpen={deactivateModal.isOpen}
          onClose={deactivateModal.onClose}
          badge={selectedBadge}
          onSuccess={fetchBadges}
        />
      )}

      <Box marginX="22px" marginY="20px">
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Box>
            <Heading fontSize="22px" fontWeight="600">
              Badge Management
            </Heading>
            <Text fontSize="13px" color="gray.500" mt="2px">
              Create, manage and track digital badges
            </Text>
          </Box>
          <Flex gap="10px">
            <Button
              secondary
              onClick={() => history.push("/admin/badges/pending-approvals")}
            >
              Pending Approvals
            </Button>
            <Button
              secondary
              onClick={() => history.push("/admin/badges/kpis")}
            >
              KPI Dashboard
            </Button>
            <Button
              secondary
              onClick={() => history.push("/admin/badges/report")}
            >
              Report
            </Button>
            <Button leftIcon={<FaPlus />} onClick={createModal.onOpen}>
              Create Badge
            </Button>
          </Flex>
        </Flex>

        {/* Tabs */}
        <Flex mb="20px" gap="4px" borderBottom="2px solid #E2E8F0" pb="0">
          {tabs.map((tab) => (
            <Box
              key={tab.key}
              as="button"
              px="16px"
              py="10px"
              fontSize="13px"
              fontWeight={activeTab === tab.key ? "700" : "500"}
              color={activeTab === tab.key ? "#6b006b" : "gray.500"}
              borderBottom={activeTab === tab.key ? "2px solid #6b006b" : "2px solid transparent"}
              mb="-2px"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Box>
          ))}
        </Flex>

        {/* Table */}
        <Box
          bg="white"
          border="1px solid #E2E8F0"
          borderRadius="8px"
          overflow="hidden"
        >
          {loading ? (
            <Flex justifyContent="center" alignItems="center" py="60px">
              <Spinner size="xl" color="#6b006b" />
            </Flex>
          ) : filtered.length === 0 ? (
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              py="60px"
              gap="12px"
            >
              <Box
                w="56px"
                h="56px"
                bg="#F0E6FF"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaMedal color="#6b006b" size="22px" />
              </Box>
              <Text fontSize="15px" fontWeight="600" color="#1A202C">
                No badges found
              </Text>
              <Text fontSize="13px" color="gray.500">
                Create your first badge to get started.
              </Text>
            </Flex>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="#F7FAFC">
                  <Tr>
                    <Th
                      textTransform="none"
                      fontSize="12px"
                      fontWeight="600"
                      color="#4A5568"
                    >
                      Title
                    </Th>
                    <Th
                      textTransform="none"
                      fontSize="12px"
                      fontWeight="600"
                      color="#4A5568"
                    >
                      Type
                    </Th>
                    <Th
                      textTransform="none"
                      fontSize="12px"
                      fontWeight="600"
                      color="#4A5568"
                      isNumeric
                    >
                      Required Courses
                    </Th>
                    <Th
                      textTransform="none"
                      fontSize="12px"
                      fontWeight="600"
                      color="#4A5568"
                    >
                      Validation
                    </Th>
                    <Th
                      textTransform="none"
                      fontSize="12px"
                      fontWeight="600"
                      color="#4A5568"
                    >
                      Status
                    </Th>
                    <Th
                      textTransform="none"
                      fontSize="12px"
                      fontWeight="600"
                      color="#4A5568"
                    >
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((badge) => (
                    <Tr key={badge.id} _hover={{ bg: "#FAFAFA" }}>
                      <Td>
                        <Flex alignItems="center" gap="10px">
                          {badge.badgeFile && (
                            <Box
                              w="32px"
                              h="32px"
                              borderRadius="6px"
                              overflow="hidden"
                              flexShrink={0}
                            >
                              <img
                                src={badge.badgeFile}
                                alt={badge.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          )}
                          <Box>
                            <Text
                              fontSize="13px"
                              fontWeight="600"
                              color="#1A202C"
                            >
                              {badge.title}
                            </Text>
                            <Text
                              fontSize="11px"
                              color="gray.400"
                              noOfLines={1}
                              maxW="200px"
                            >
                              {badge.description}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Badge
                          bg="#F0E6FF"
                          color="#6b006b"
                          px="8px"
                          py="2px"
                          borderRadius="8px"
                          textTransform="none"
                          fontSize="11px"
                          fontWeight="500"
                        >
                          {badge.badgeType}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Text
                          fontSize="13px"
                          fontWeight="700"
                          color="#6b006b"
                        >
                          {badge.requiredCoursesCount ?? 0}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          fontSize="12px"
                          color="gray.600"
                          textTransform="capitalize"
                        >
                          {badge.validationMethod}
                        </Text>
                      </Td>
                      <Td>{statusBadge(badge.status)}</Td>
                      <Td>
                        <Flex gap="6px">
                          <Box
                            as="button"
                            px="10px"
                            py="4px"
                            fontSize="11px"
                            fontWeight="600"
                            bg="#F0E6FF"
                            color="#6b006b"
                            borderRadius="6px"
                            _hover={{ bg: "#e0c9e0" }}
                            onClick={() => openEdit(badge)}
                          >
                            Edit
                          </Box>
                          <Box
                            as="button"
                            px="10px"
                            py="4px"
                            fontSize="11px"
                            fontWeight="600"
                            bg="#EBF4FF"
                            color="#3182CE"
                            borderRadius="6px"
                            _hover={{ bg: "#d0e8ff" }}
                            onClick={() => openCourses(badge)}
                          >
                            Courses
                          </Box>
                          {(badge.status || "").toLowerCase() === "active" && (
                            <Box
                              as="button"
                              px="10px"
                              py="4px"
                              fontSize="11px"
                              fontWeight="600"
                              bg="#FED7D7"
                              color="#E53E3E"
                              borderRadius="6px"
                              _hover={{ bg: "#feb2b2" }}
                              onClick={() => openDeactivate(badge)}
                            >
                              Deactivate
                            </Box>
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </>
  );
};

export const BadgeSupportPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgeSupportPage {...props} />} />
);

export default BadgeSupportPageRoute;
