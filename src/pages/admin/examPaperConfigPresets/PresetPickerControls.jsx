import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input as ChakraInput,
  Text,
} from "@chakra-ui/react";
import { Button, Select } from "../../../components";

// "Load Preset" dropdown for the top of the Template/Marking Scheme step —
// selecting an entry hands the preset id up to the caller, which is
// responsible for fetching its full details and hydrating the form.
export const LoadPresetSelect = ({ presets, presetsLoading, value, onSelect, isLoading }) => (
  <Select
    label="Load Exam Template"
    placeholder={presetsLoading ? "Loading exam templates…" : "Select a saved exam template (optional)"}
    isDisabled={presetsLoading || isLoading}
    value={value || ""}
    onChange={(e) => onSelect(e.target.value)}
    options={presets.map((p) => ({ label: p.name, value: p.id }))}
  />
);

// "Save Configuration as Preset" modal — collects just the name; the
// caller supplies onSave(name) and already knows how to assemble the rest
// of the current form state into a preset payload.
export const SaveAsPresetModal = ({ isOpen, onClose, onSave, isSaving }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px" fontWeight="600">Save Configuration as Exam Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="13px" color="gray.600" mb="12px">
            Saves the current randomization settings (and sections) as a reusable
            exam template in the Exam Template Library.
          </Text>
          <Text fontSize="13px" fontWeight="600" color="gray.600" mb="6px">Name *</Text>
          <ChakraInput
            size="sm"
            borderRadius="6px"
            placeholder="e.g. Standard 60-Minute MCQ Paper"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </ModalBody>
        <ModalFooter gap="8px">
          <Button secondary onClick={onClose}>Cancel</Button>
          <Button isLoading={isSaving} isDisabled={!name.trim()} onClick={() => onSave(name.trim())}>
            Save Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
