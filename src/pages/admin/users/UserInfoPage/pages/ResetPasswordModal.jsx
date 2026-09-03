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
  FormErrorMessage,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { RiLockPasswordLine } from "react-icons/ri";
import { Button, PasswordInput } from "../../../../../components";
import { adminResetUserPassword } from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";

export const ResetPasswordModal = ({ isOpen, onClose, targetUser }) => {
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState(null);

  const handleClose = () => {
    setCurrentPassword("");
    setError("");
    setNewPassword(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentPassword) {
      setError("Please enter your current password to confirm.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { newPassword: generatedPassword } = await adminResetUserPassword(
        targetUser.id,
        currentPassword
      );
      setNewPassword(generatedPassword);
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(
          err.message ?? "Something went wrong."
        ),
        position: "top",
        status: "error",
      });
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
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={3}>
            <Box
              bg="#F7F0FF"
              p="8px"
              borderRadius="8px"
              display="flex"
              alignItems="center"
            >
              <RiLockPasswordLine color="#6b006b" size="18px" />
            </Box>
            <Box>
              <Text fontSize="17px" fontWeight="700" color="#1A202C">
                Reset Password
              </Text>
              <Text fontSize="13px" fontWeight="400" color="#718096">
                {targetUser?.firstName} {targetUser?.lastName} ({targetUser?.email})
              </Text>
            </Box>
          </Flex>
        </ModalHeader>

        <ModalBody>
          {newPassword ? (
            <Alert
              status="success"
              borderRadius="8px"
              flexDirection="column"
              alignItems="flex-start"
              gap={2}
              py={4}
            >
              <AlertIcon />
              <AlertDescription fontSize="14px">
                Password reset successfully. Share this new password with the
                user securely — it will not be shown again.
              </AlertDescription>
              <Box
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="6px"
                px={3}
                py={2}
                w="full"
                fontFamily="mono"
                fontWeight="600"
                fontSize="15px"
                userSelect="all"
              >
                {newPassword}
              </Box>
            </Alert>
          ) : (
            <>
              <Alert
                status="warning"
                borderRadius="8px"
                mb={5}
                bg="#FFFBEB"
                border="1px solid #F6E05E"
                py={2}
              >
                <AlertIcon color="#D69E2E" boxSize="16px" />
                <AlertDescription fontSize="13px" color="#744210">
                  This will generate a new random password for this user and
                  cannot be undone. Confirm your own current password to
                  continue.
                </AlertDescription>
              </Alert>

              <FormControl isRequired isInvalid={!!error}>
                <FormLabel fontSize="14px" fontWeight="600" color="#1A202C" mb={2}>
                  Your Current Password
                </FormLabel>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
            </>
          )}
        </ModalBody>

        <ModalFooter gap={3}>
          {newPassword ? (
            <Button
              style={{ backgroundColor: "#6b006b", color: "white" }}
              onClick={handleClose}
            >
              Done
            </Button>
          ) : (
            <>
              <Button secondary onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                style={{ backgroundColor: "#6b006b", color: "white" }}
                isLoading={isSubmitting}
                onClick={handleSubmit}
              >
                Reset Password
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResetPasswordModal;
