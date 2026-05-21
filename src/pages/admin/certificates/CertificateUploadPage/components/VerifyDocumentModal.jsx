import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Button } from "../../../../../components";
import { adminVerifyDocument } from "../../../../../services";

const VerifyDocumentModal = ({ isOpen, onClose, document, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const { message } = await adminVerifyDocument(document.uploadId);
      toast({
        title: message || "Document verified successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch {
      toast({
        title: "Failed to verify document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">
          Verify Document
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="14px" color="gray.600">
            Are you sure you want to verify{" "}
            <Text as="span" fontWeight="600" color="gray.800">
              {document?.fileName}
            </Text>
            {document?.userName || document?.userId ? (
              <>
                {" "}submitted by{" "}
                <Text as="span" fontWeight="600" color="gray.800">
                  {document.userName || document.userId}
                </Text>
              </>
            ) : null}
            ? The document status will be updated to{" "}
            <Text as="span" fontWeight="600" color="#38A169">
              Verified
            </Text>
            .
          </Text>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="outline" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleVerify}
            isLoading={loading}
            loadingText="Verifying…"
          >
            Verify Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VerifyDocumentModal;
