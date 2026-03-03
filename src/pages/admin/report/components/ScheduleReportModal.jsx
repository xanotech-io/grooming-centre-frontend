import React from "react";
import { useHistory } from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";

const ScheduleReportModal = ({ isOpen, onClose }) => {
  const history = useHistory();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader fontSize="lg" fontWeight="700" color="#101928">
          Schedule Report
        </ModalHeader>
        <ModalCloseButton mt={3} mr={2} />

        <ModalBody>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                mb={2}
              >
                Schedule Frequency
              </FormLabel>
              <Select
                placeholder="Select schedule frequency"
                size="md"
                borderRadius="md"
                fontSize="14px"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                mb={2}
              >
                Frequency Day
              </FormLabel>
              <Select
                placeholder="Every monday"
                size="md"
                borderRadius="md"
                fontSize="14px"
              >
                <option value="monday">Every monday</option>
                <option value="tuesday">Every tuesday</option>
                <option value="wednesday">Every wednesday</option>
                <option value="thursday">Every thursday</option>
                <option value="friday">Every friday</option>
                <option value="saturday">Every saturday</option>
                <option value="sunday">Every sunday</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                mb={2}
              >
                Time
              </FormLabel>
              <HStack
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                px={3}
                py={2}
                justify="space-between"
              >
                <Text fontSize="14px" color="#101928">
                  10:00 AM
                </Text>
                <Icon as={FiClock} color="gray.400" />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="#344054"
                mb={2}
              >
                Delivery Method
              </FormLabel>
              <Select
                placeholder="Dashboard"
                size="md"
                borderRadius="md"
                fontSize="14px"
              >
                <option value="dashboard">Dashboard</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} pt={6} pb={4}>
          <Button
            variant="outline"
            flex={1}
            borderColor="#D0D5DD"
            color="#344054"
            fontSize="14px"
            fontWeight="600"
            onClick={onClose}
            borderRadius="md"
            h="44px"
          >
            Cancel
          </Button>
          <Button
            bg="#660066"
            flex={1}
            color="white"
            _hover={{ bg: "#550055" }}
            fontSize="14px"
            fontWeight="600"
            borderRadius="md"
            h="44px"
            onClick={() => {
              onClose();
              history.push("/admin/report/custom");
            }}
          >
            Save schedule
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleReportModal;
