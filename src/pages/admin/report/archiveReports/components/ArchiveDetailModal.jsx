import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text,
    Box,
    Flex,
    Badge,
    Divider,
    Button,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import { FiArchive, FiRotateCcw } from 'react-icons/fi';

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const DetailRow = ({ label, value, mono }) => (
    <GridItem>
        <Text fontSize="11px" fontWeight="600" color="#718096" textTransform="uppercase" mb="4px">
            {label}
        </Text>
        <Text
            fontSize="14px"
            color="#1A202C"
            fontFamily={mono ? 'mono' : 'inherit'}
            wordBreak="break-all"
        >
            {value ?? '—'}
        </Text>
    </GridItem>
);

const ArchiveDetailModal = ({ isOpen, onClose, archive, onRetrieve, isRetrieving }) => {
    if (!archive) return null;

    const isArchived = archive.status === 'Archived';

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
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
                            <FiArchive size={18} color="#6b006b" />
                        </Box>
                        <Box>
                            <Text fontSize="17px" fontWeight="700" color="#101928">Archive Record</Text>
                            <Text fontSize="13px" color="#6b006b" fontFamily="mono" fontWeight="600">
                                {archive.archiveId}
                            </Text>
                        </Box>
                        <Box ml="auto">
                            <Badge
                                px={3} py={1}
                                borderRadius="full"
                                fontSize="12px"
                                fontWeight="600"
                                colorScheme={isArchived ? 'orange' : 'green'}
                            >
                                {archive.status}
                            </Badge>
                        </Box>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton top={4} right={4} />

                <ModalBody pb={4}>
                    {/* Report Details */}
                    <Text fontSize="13px" fontWeight="700" color="#475467" textTransform="uppercase" letterSpacing="0.5px" mb={3}>
                        Report Info
                    </Text>
                    <Box bg="#F9FAFB" border="1px solid #E2E8F0" borderRadius="8px" p={4} mb={4}>
                        <Grid templateColumns="1fr 1fr" gap={4}>
                            <DetailRow label="Report ID" value={archive.report?.reportId} mono />
                            <DetailRow label="Report Name" value={archive.report?.reportName} />
                            <DetailRow label="Category" value={archive.report?.reportCategory} />
                            <DetailRow label="Format" value={archive.report?.reportFormat} />
                            <DetailRow label="Record Count" value={archive.report?.recordCount != null ? archive.report.recordCount.toLocaleString() : null} />
                            <DetailRow label="Generated Date" value={formatDate(archive.report?.generatedDate)} />
                        </Grid>
                    </Box>

                    {/* Archive Details */}
                    <Text fontSize="13px" fontWeight="700" color="#475467" textTransform="uppercase" letterSpacing="0.5px" mb={3}>
                        Archive Details
                    </Text>
                    <Box bg="#F9FAFB" border="1px solid #E2E8F0" borderRadius="8px" p={4} mb={4}>
                        <Grid templateColumns="1fr 1fr" gap={4}>
                            <DetailRow label="Archive ID" value={archive.archiveId} mono />
                            <DetailRow label="Archive Date" value={formatDate(archive.archiveDate)} />
                            <DetailRow
                                label="Archived By"
                                value={archive.archiver ? `${archive.archiver.firstName} ${archive.archiver.lastName}` : null}
                            />
                            <DetailRow label="Archiver Email" value={archive.archiver?.email} />
                        </Grid>
                        <Divider my={3} />
                        <DetailRow label="Storage Location" value={archive.storageLocation} mono />
                        {archive.notes && (
                            <>
                                <Divider my={3} />
                                <DetailRow label="Notes" value={archive.notes} />
                            </>
                        )}
                    </Box>

                    {/* Retrieval Details */}
                    {!isArchived && (
                        <>
                            <Text fontSize="13px" fontWeight="700" color="#475467" textTransform="uppercase" letterSpacing="0.5px" mb={3}>
                                Retrieval Details
                            </Text>
                            <Box bg="#F0FFF4" border="1px solid #C6F6D5" borderRadius="8px" p={4} mb={4}>
                                <Grid templateColumns="1fr 1fr" gap={4}>
                                    <DetailRow label="Retrieval Date" value={formatDate(archive.retrievalDate)} />
                                    <DetailRow
                                        label="Retrieved By"
                                        value={archive.retriever ? `${archive.retriever.firstName} ${archive.retriever.lastName}` : null}
                                    />
                                    <DetailRow
                                        label="Processing Time"
                                        value={archive.retrievalProcessingMs != null
                                            ? archive.retrievalProcessingMs >= 1000
                                                ? `${(archive.retrievalProcessingMs / 1000).toFixed(2)}s`
                                                : `${archive.retrievalProcessingMs}ms`
                                            : null
                                        }
                                    />
                                    <DetailRow label="Retriever Email" value={archive.retriever?.email} />
                                </Grid>
                            </Box>
                        </>
                    )}

                    {/* Actions */}
                    {isArchived && (
                        <Flex justify="flex-end" mt={2}>
                            <Button
                                bg="#6b006b"
                                color="white"
                                _hover={{ bg: '#550055' }}
                                fontSize="14px"
                                height="40px"
                                px={5}
                                borderRadius="8px"
                                leftIcon={<FiRotateCcw size={14} />}
                                isLoading={isRetrieving}
                                loadingText="Retrieving..."
                                onClick={() => onRetrieve(archive)}
                            >
                                Retrieve Report
                            </Button>
                        </Flex>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ArchiveDetailModal;
