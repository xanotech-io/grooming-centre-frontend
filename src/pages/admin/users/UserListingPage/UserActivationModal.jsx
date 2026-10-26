import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  Flex,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { FiUserCheck, FiUserX } from "react-icons/fi";
import { Button } from "../../../../components";
import { adminActivateUser, adminDeactivateUser } from "../../../../services";
import { capitalizeFirstLetter } from "../../../../utils";

const getErrorMessage = (err) => {
  switch (err.statusCode) {
    case 401:
      return "Only a super admin can change a user's account status.";
    case 404:
      return "This user could not be found. They may have been deleted.";
    // 400 covers both "can't deactivate your own account" and "already in that state"; the server message distinguishes them
    case 400:
      return capitalizeFirstLetter(
        err.message ?? "This account status change is not allowed."
      );
    default:
      return capitalizeFirstLetter(err.message ?? "Something went wrong.");
  }
};

export const UserActivationModal = ({ isOpen, onClose, targetUser, onSuccess }) => {
  const toast = useToast();

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDeactivating = !!targetUser?.active;
  const actionText = isDeactivating ? "Deactivate" : "Activate";
  const fullName = `${targetUser?.firstName ?? ""} ${targetUser?.lastName ?? ""}`.trim();

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const { active } = isDeactivating
        ? await adminDeactivateUser(targetUser.id, reason.trim())
        : await adminActivateUser(targetUser.id);

      onSuccess?.(targetUser.id, active);
      toast({
        description: `${fullName || "User"} has been ${
          active ? "activated" : "deactivated"
        }.`,
        position: "top",
        status: "success",
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      isCentered
      closeOnOverlayClick={!isSubmitting}
      closeOnEsc={!isSubmitting}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={3}>
            <Box
              bg={isDeactivating ? "#FEF3F2" : "#ECFDF3"}
              p="8px"
              borderRadius="8px"
              display="flex"
              alignItems="center"
            >
              {isDeactivating ? (
                <FiUserX color="#F04438" size="18px" />
              ) : (
                <FiUserCheck color="#12B76A" size="18px" />
              )}
            </Box>
            <Box>
              <Text fontSize="17px" fontWeight="700" color="#1A202C">
                {actionText} User
              </Text>
              <Text fontSize="13px" fontWeight="400" color="#718096">
                {fullName} ({targetUser?.email})
              </Text>
            </Box>
          </Flex>
        </ModalHeader>

        <ModalBody>
          <Alert
            status="warning"
            borderRadius="8px"
            mb={isDeactivating ? 5 : 0}
            bg="#FFFBEB"
            border="1px solid #F6E05E"
            py={2}
          >
            <AlertIcon color="#D69E2E" boxSize="16px" />
            <AlertDescription fontSize="13px" color="#744210">
              {isDeactivating
                ? "This user will be blocked from logging in until their account is activated again."
                : "This user will be able to log in again."}
            </AlertDescription>
          </Alert>

          {isDeactivating && (
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
                Reason (optional)
              </FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a note for the audit log"
                resize="vertical"
              />
            </FormControl>
          )}

          {error && (
            <Alert status="error" borderRadius="8px" mt={4} py={2}>
              <AlertIcon boxSize="16px" />
              <AlertDescription fontSize="13px">{error}</AlertDescription>
            </Alert>
          )}
        </ModalBody>

        <ModalFooter gap={3}>
          <Button secondary onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: isDeactivating ? "#F04438" : "#6b006b",
              color: "white",
            }}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            {actionText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserActivationModal;
