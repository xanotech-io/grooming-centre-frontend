import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import {
  Box,
  BreadcrumbItem,
  Flex,
  Spinner,
  Text,
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
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb, Button, Heading, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetPendingBadgeApprovals,
  adminApproveBadge,
} from "../../../services";
import { capitalizeFirstLetter } from "../../../utils";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { FaMedal } from "react-icons/fa";

const ApproveModal = ({ isOpen, onClose, record, onSuccess }) => {
  const toast = useToast();
  const [validationDetails, setValidationDetails] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setValidationDetails("");
  }, [isOpen]);

  const handleApprove = async () => {
    if (!validationDetails.trim()) {
      toast({
        title: "Validation details are required",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setSaving(true);
    try {
      await adminApproveBadge(record.badgeId, record.userId, {
        validationDetails: validationDetails.trim(),
      });
      toast({
        title: `Badge approved and issued to ${record.studentName || "student"}`,
        status: "success",
        duration: 3000,
      });
      onSuccess(record.id);
      onClose();
    } catch (err) {
      toast({
        title: capitalizeFirstLetter(
          err?.response?.data?.message || err.message || "Failed to approve",
        ),
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Approve Badge</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600" mb="16px">
            Approving badge <strong>{record?.badgeTitle}</strong> for{" "}
            <strong>{record?.studentName}</strong>.
          </Text>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Validation Details</FormLabel>
            <Textarea
              value={validationDetails}
              onChange={(e) => setValidationDetails(e.target.value)}
              placeholder="e.g. Manually verified by instructor — all required courses completed"
              rows={4}
              size="sm"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button secondary onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button isLoading={saving} onClick={handleApprove}>
            Approve & Issue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const PendingApprovalsPage = () => {
  const history = useHistory();
  const approveModal = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    adminGetPendingBadgeApprovals()
      .then((res) => setRecords(res?.data || res?.pendingApprovals || []))
      .catch((err) =>
        setError(
          capitalizeFirstLetter(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load pending approvals",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const openApprove = (rec) => {
    setSelectedRecord(rec);
    approveModal.onOpen();
  };

  const handleApproved = (recordId) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  return (
    <AdminMainAreaWrapper>
      {selectedRecord && (
        <ApproveModal
          isOpen={approveModal.isOpen}
          onClose={approveModal.onClose}
          record={selectedRecord}
          onSuccess={handleApproved}
        />
      )}

      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/badge-support">Badge Support</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Pending Approvals</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>

      <Box marginX="22px" marginY="20px">
        <Flex alignItems="center" gap="16px" mb="28px">
          <Flex
            as="button"
            alignItems="center"
            gap="6px"
            color="#6b006b"
            onClick={() => history.push("/admin/badge-support")}
            _hover={{ opacity: 0.8 }}
          >
            <FiArrowLeft size={14} />
            <Text fontSize="13px" fontWeight="600">
              Badges
            </Text>
          </Flex>
          <Box w="1px" h="20px" bg="#E2E8F0" />
          <Box>
            <Heading fontSize="22px" fontWeight="600">
              Pending Badge Approvals
            </Heading>
            <Text fontSize="13px" color="gray.500" mt="2px">
              Students awaiting manual badge review
            </Text>
          </Box>
        </Flex>

        {loading && (
          <Flex justifyContent="center" alignItems="center" minH="300px">
            <Spinner size="xl" color="#6b006b" />
          </Flex>
        )}

        {error && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="8px"
            p="16px"
          >
            <Text color="red.600" fontSize="14px">
              {error}
            </Text>
          </Box>
        )}

        {!loading && !error && (
          <Box
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="8px"
            overflow="hidden"
          >
            {records.length === 0 ? (
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
                  bg="#E6F4EA"
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiCheck color="#38A169" size={22} />
                </Box>
                <Text fontSize="15px" fontWeight="600" color="#1A202C">
                  No pending approvals
                </Text>
                <Text fontSize="13px" color="gray.500">
                  All badge requests have been reviewed.
                </Text>
              </Flex>
            ) : (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="#F7FAFC">
                    <Tr>
                      <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                        Student Name
                      </Th>
                      <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                        Badge Title
                      </Th>
                      <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568" isNumeric>
                        Courses Completed
                      </Th>
                      <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                        Submitted
                      </Th>
                      <Th textTransform="none" fontSize="12px" fontWeight="600" color="#4A5568">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {records.map((rec) => (
                      <Tr key={rec.id} _hover={{ bg: "#FAFAFA" }}>
                        <Td>
                          <Text fontSize="13px" fontWeight="600" color="#1A202C">
                            {rec.studentName || "—"}
                          </Text>
                          <Text fontSize="11px" color="gray.400">
                            {rec.studentEmail}
                          </Text>
                        </Td>
                        <Td>
                          <Flex alignItems="center" gap="8px">
                            <FaMedal color="#6b006b" size={13} />
                            <Text fontSize="13px" color="#1A202C">
                              {rec.badgeTitle}
                            </Text>
                          </Flex>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="13px" fontWeight="600">
                            {rec.coursesCompletedSoFar ?? "—"} /{" "}
                            {rec.requiredCoursesCount ?? "—"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="12px" color="gray.500">
                            {rec.submittedAt
                              ? new Date(rec.submittedAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </Text>
                        </Td>
                        <Td>
                          <Flex gap="6px">
                            <Box
                              as="button"
                              px="10px"
                              py="4px"
                              fontSize="11px"
                              fontWeight="600"
                              bg="#E6F4EA"
                              color="#38A169"
                              borderRadius="6px"
                              _hover={{ bg: "#c6e8d1" }}
                              onClick={() => openApprove(rec)}
                            >
                              Approve
                            </Box>
                            {rec.badgeId && (
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
                                onClick={() =>
                                  history.push(`/admin/badges/${rec.badgeId}`)
                                }
                              >
                                View Badge
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
        )}
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const PendingApprovalsPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <PendingApprovalsPage {...props} />} />
);

export default PendingApprovalsPageRoute;
