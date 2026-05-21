import React, { useState } from "react";
import {
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
  Text,
  useToast,
} from "@chakra-ui/react";
import { Button } from "../../../../../components";
import { adminRejectDocument } from "../../../../../services";

const RejectDocumentModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast({
        title: "Rejection reason is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!document) return;
    setLoading(true);
    try {
      const { message } = await adminRejectDocument(document.uploadId, {
        rejectionReason: reason.trim(),
      });
      toast({
        title: message || "Document rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setReason("");
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to reject document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Reject Document
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600" mb="16px">
            Rejecting{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.fileName}
            </Text>
            . Please provide a reason so the uploader can correct and
            re-submit.
          </Text>
          <FormControl isRequired>
            <FormLabel fontSize="13px" fontWeight="500" color="gray.600">
              Rejection Reason
            </FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Document is blurry and unreadable. Please upload a clearer copy."
              rows={3}
              size="sm"
              borderRadius="6px"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleReject}
            isLoading={loading}
            isDisabled={!reason.trim()}
            loadingText="Rejecting…"
          >
            Reject Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RejectDocumentModal;
