import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    Box,
    Flex,
    Badge,
} from '@chakra-ui/react';
import { FiRotateCcw } from 'react-icons/fi';

const RetrieveConfirmModal = ({ isOpen, onClose, archive, onConfirm, isLoading }) => {
    if (!archive) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
            <ModalContent borderRadius="12px" p={2}>
                <ModalHeader>
                    <Flex align="center" gap={3}>
                        <Box
                            w="40px" h="40px"
                            bg="#F3E8FF"
                            borderRadius="full"
                            display="flex" alignItems="center" justifyContent="center"
                            flexShrink={0}
                        >
                            <FiRotateCcw size={18} color="#6b006b" />
                        </Box>
                        <Text fontSize="17px" fontWeight="700" color="#101928">
                            Retrieve Archived Report
                        </Text>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton top={4} right={4} />

                <ModalBody pb={2}>
                    <Text fontSize="14px" color="#4A5568" mb={4}>
                        This will restore the report back to active status. The archive record will be updated to <Badge colorScheme="green" fontSize="12px">Retrieved</Badge>.
                    </Text>

                    <Box bg="#F9FAFB" border="1px solid #E2E8F0" borderRadius="8px" p={4}>
                        <Flex justify="space-between" mb={3}>
                            <Text fontSize="12px" color="#718096" fontWeight="600">Archive ID</Text>
                            <Text fontSize="13px" color="#6b006b" fontFamily="mono" fontWeight="600">
                                {archive.archiveId}
                            </Text>
                        </Flex>
                        <Flex justify="space-between" mb={3}>
                            <Text fontSize="12px" color="#718096" fontWeight="600">Report ID</Text>
                            <Text fontSize="13px" color="#4A5568" fontFamily="mono">
                                {archive.report?.reportId ?? '—'}
                            </Text>
                        </Flex>
                        <Flex justify="space-between" mb={3}>
                            <Text fontSize="12px" color="#718096" fontWeight="600">Report Name</Text>
                            <Text fontSize="13px" color="#1A202C" maxW="200px" textAlign="right">
                                {archive.report?.reportName ?? '—'}
                            </Text>
                        </Flex>
                        <Flex justify="space-between">
                            <Text fontSize="12px" color="#718096" fontWeight="600">Storage Location</Text>
                            <Text fontSize="12px" color="#4A5568" fontFamily="mono" maxW="200px" textAlign="right" noOfLines={2}>
                                {archive.storageLocation ?? '—'}
                            </Text>
                        </Flex>
                    </Box>
                </ModalBody>

                <ModalFooter gap={3} pt={4}>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        isDisabled={isLoading}
                        borderColor="#E2E8F0"
                        color="#4A5568"
                        fontSize="14px"
                        height="40px"
                        px={5}
                        borderRadius="8px"
                    >
                        Cancel
                    </Button>
                    <Button
                        bg="#6b006b"
                        color="white"
                        _hover={{ bg: '#550055' }}
                        fontSize="14px"
                        height="40px"
                        px={5}
                        borderRadius="8px"
                        leftIcon={<FiRotateCcw size={14} />}
                        isLoading={isLoading}
                        loadingText="Retrieving..."
                        onClick={() => onConfirm(archive.archiveId)}
                    >
                        Retrieve Report
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RetrieveConfirmModal;
