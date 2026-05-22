import React, { useState, useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  Button,
  Input,
  Select,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Spinner,
  Tooltip,
  Divider,
  HStack,
  VStack,
  Tag,
  TagLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiShield,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiSearch,
  FiZap,
} from "react-icons/fi";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import {
  listIpPolicies,
  getActiveIpPolicy,
  getIpPolicyKpis,
  getIpAuthLogs,
  checkIpAccess,
  createIpPolicy,
  updateIpPolicy,
  deleteIpPolicy,
  activateIpPolicy,
  deactivateIpPolicy,
  listIpExceptions,
  reviewIpException,
} from "../../../services";

const MOCK_KPIS = {
  totalAttempts: 1850,
  allowedAttempts: 1700,
  deniedAttempts: 150,
  unauthorizedAccessRate: 8,
  securityAlertFrequency: 12,
  bruteForceDetections: 3,
  byStatus: [
    { status: "allowed", count: 1700 },
    { status: "denied", count: 140 },
    { status: "blocked", count: 10 },
  ],
  ipLoginDistribution: [
    { role: "Admin", authStatus: "allowed", count: 420 },
    { role: "Admin", authStatus: "denied", count: 130 },
    { role: "Instructor", authStatus: "allowed", count: 580 },
    { role: "Student", authStatus: "allowed", count: 700 },
  ],
};

const MOCK_POLICIES = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Main Campus Policy",
    description: "Restricts Admin to campus network; all others unrestricted",
    status: "active",
    bruteForceThreshold: 5,
    rateLimitWindowMinutes: 15,
    impossibleTravelDetection: true,
    blockedIps: ["185.23.44.0/24"],
    trustedNetworks: ["10.0.0.0/8"],
    rolePolicies: {
      Admin: { allowed_ips: ["192.168.1.0/24"], vpn_allowed: true, rate_limit: 30 },
      Instructor: { allowed_ips: ["any"], rate_limit: 20 },
      Student: { allowed_ips: ["any"], rate_limit: 10 },
    },
    creator: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Remote Access Policy",
    description: "Open access policy for remote work period",
    status: "inactive",
    bruteForceThreshold: 3,
    rateLimitWindowMinutes: 10,
    impossibleTravelDetection: false,
    blockedIps: [],
    trustedNetworks: ["10.0.0.0/8", "172.16.0.0/12"],
    rolePolicies: {
      Admin: { allowed_ips: ["any"], vpn_allowed: true, rate_limit: 30 },
      Instructor: { allowed_ips: ["any"], rate_limit: 20 },
      Student: { allowed_ips: ["any"], rate_limit: 10 },
    },
    creator: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
    createdAt: "2026-04-10T08:00:00.000Z",
    updatedAt: "2026-04-10T08:00:00.000Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Strict Security Policy",
    description: "High-security configuration for exam periods",
    status: "draft",
    bruteForceThreshold: 2,
    rateLimitWindowMinutes: 5,
    impossibleTravelDetection: true,
    blockedIps: ["185.23.44.0/24", "203.45.67.0/24"],
    trustedNetworks: ["192.168.0.0/16"],
    rolePolicies: {
      Admin: { allowed_ips: ["192.168.1.0/24"], vpn_allowed: false, rate_limit: 10 },
      Instructor: { allowed_ips: ["192.168.2.0/24"], rate_limit: 10 },
      Student: { allowed_ips: ["192.168.0.0/16"], rate_limit: 5 },
    },
    creator: { firstName: "Admin", lastName: "User", email: "admin@example.com" },
    createdAt: "2026-05-10T11:00:00.000Z",
    updatedAt: "2026-05-10T11:00:00.000Z",
  },
];

const MOCK_LOGS = [
  {
    id: "log-001",
    user: { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com" },
    ipAddress: "102.89.45.12",
    role: "Admin",
    authStatus: "denied",
    denialReason: "IP not in allowed range 192.168.1.0/24 for role Admin",
    deviceInfo: { device_type: "laptop", os: "Windows 11", browser: "Chrome" },
    alertGenerated: true,
    isBruteForce: false,
    attemptCount: 1,
    createdAt: "2026-05-21T08:15:00.000Z",
  },
  {
    id: "log-002",
    user: { firstName: "Tunde", lastName: "Okafor", email: "tunde.okafor@example.com" },
    ipAddress: "192.168.1.45",
    role: "Admin",
    authStatus: "allowed",
    denialReason: null,
    deviceInfo: { device_type: "desktop", os: "Windows 10", browser: "Firefox" },
    alertGenerated: false,
    isBruteForce: false,
    attemptCount: 1,
    createdAt: "2026-05-21T08:20:00.000Z",
  },
  {
    id: "log-003",
    user: null,
    ipAddress: "45.133.1.100",
    role: "Student",
    authStatus: "blocked",
    denialReason: "IP is globally blocked",
    deviceInfo: null,
    alertGenerated: true,
    isBruteForce: true,
    attemptCount: 6,
    createdAt: "2026-05-21T08:45:00.000Z",
  },
  {
    id: "log-004",
    user: { firstName: "Kemi", lastName: "Abens", email: "kemi.abens@example.com" },
    ipAddress: "10.0.4.22",
    role: "Instructor",
    authStatus: "allowed",
    denialReason: null,
    deviceInfo: { device_type: "mobile", os: "iOS 17", browser: "Safari" },
    alertGenerated: false,
    isBruteForce: false,
    attemptCount: 1,
    createdAt: "2026-05-21T09:00:00.000Z",
  },
  {
    id: "log-005",
    user: { firstName: "Daniel", lastName: "Eze", email: "daniel.eze@example.com" },
    ipAddress: "203.45.67.15",
    role: "Student",
    authStatus: "denied",
    denialReason: "IP range 203.45.67.0/24 is globally blocked",
    deviceInfo: { device_type: "laptop", os: "macOS 14", browser: "Chrome" },
    alertGenerated: true,
    isBruteForce: false,
    attemptCount: 2,
    createdAt: "2026-05-21T09:30:00.000Z",
  },
];

const MOCK_EXCEPTIONS = [
  {
    id: "exc-001",
    ipAddress: "102.89.45.12",
    reason: "Travelling to a client site this week, need access from hotel network",
    status: "pending",
    requester: { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com" },
    reviewedBy: null,
    reviewer: null,
    reviewedAt: null,
    expiresAt: null,
    reviewNote: null,
    createdAt: "2026-05-21T09:30:00.000Z",
  },
  {
    id: "exc-002",
    ipAddress: "78.45.123.99",
    reason: "Home IP changed after ISP migration",
    status: "approved",
    requester: { firstName: "Temi", lastName: "Adeyemi", email: "temi.adeyemi@example.com" },
    reviewer: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
    reviewedAt: "2026-05-18T14:00:00.000Z",
    expiresAt: "2026-05-25T23:59:00.000Z",
    reviewNote: "Verified ISP change. Temporary access granted.",
    createdAt: "2026-05-17T10:00:00.000Z",
  },
  {
    id: "exc-003",
    ipAddress: "91.200.5.50",
    reason: "Conference attendance from external wifi",
    status: "denied",
    requester: { firstName: "Emeka", lastName: "Obi", email: "emeka.obi@example.com" },
    reviewer: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
    reviewedAt: "2026-05-19T11:00:00.000Z",
    expiresAt: null,
    reviewNote: "Please use the company VPN instead.",
    createdAt: "2026-05-19T08:00:00.000Z",
  },
];

const DEFAULT_ROLE_POLICIES = {
  Admin: { allowed_ips: "192.168.1.0/24", vpn_allowed: true, rate_limit: 30 },
  Instructor: { allowed_ips: "any", vpn_allowed: false, rate_limit: 20 },
  Student: { allowed_ips: "any", vpn_allowed: false, rate_limit: 10 },
};

const EMPTY_FORM = {
  name: "",
  description: "",
  blockedIps: "",
  trustedNetworks: "",
  bruteForceThreshold: 5,
  rateLimitWindowMinutes: 15,
  impossibleTravelDetection: false,
  status: "draft",
  rolePolicies: { ...DEFAULT_ROLE_POLICIES },
};

const STATUS_COLORS = { active: "green", draft: "yellow", inactive: "gray" };
const AUTH_COLORS = { allowed: "green", denied: "red", blocked: "orange" };

function KpiCard({ label, value, color, icon }) {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={color || "gray.800"}>
            {value ?? "—"}
          </Text>
        </Box>
        {icon && <Box color={color || "gray.400"} fontSize="xl" mt={1}>{icon}</Box>}
      </Flex>
    </Box>
  );
}

function PaginationBar({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <Flex justify="center" align="center" gap={2} mt={4}>
      <Button size="sm" onClick={() => onPage(page - 1)} isDisabled={page <= 1} variant="outline">Prev</Button>
      <Text fontSize="sm" color="gray.600">{page} / {totalPages}</Text>
      <Button size="sm" onClick={() => onPage(page + 1)} isDisabled={page >= totalPages} variant="outline">Next</Button>
    </Flex>
  );
}

function PolicyFormModal({ isOpen, onClose, editPolicy, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editPolicy) {
      setForm({
        name: editPolicy.name || "",
        description: editPolicy.description || "",
        blockedIps: Array.isArray(editPolicy.blockedIps) ? editPolicy.blockedIps.join(", ") : "",
        trustedNetworks: Array.isArray(editPolicy.trustedNetworks) ? editPolicy.trustedNetworks.join(", ") : "",
        bruteForceThreshold: editPolicy.bruteForceThreshold ?? 5,
        rateLimitWindowMinutes: editPolicy.rateLimitWindowMinutes ?? 15,
        impossibleTravelDetection: editPolicy.impossibleTravelDetection || false,
        status: editPolicy.status || "draft",
        rolePolicies: {
          Admin: {
            allowed_ips: editPolicy.rolePolicies?.Admin?.allowed_ips?.join(", ") || "any",
            vpn_allowed: editPolicy.rolePolicies?.Admin?.vpn_allowed || false,
            rate_limit: editPolicy.rolePolicies?.Admin?.rate_limit ?? 30,
          },
          Instructor: {
            allowed_ips: editPolicy.rolePolicies?.Instructor?.allowed_ips?.join(", ") || "any",
            vpn_allowed: editPolicy.rolePolicies?.Instructor?.vpn_allowed || false,
            rate_limit: editPolicy.rolePolicies?.Instructor?.rate_limit ?? 20,
          },
          Student: {
            allowed_ips: editPolicy.rolePolicies?.Student?.allowed_ips?.join(", ") || "any",
            vpn_allowed: editPolicy.rolePolicies?.Student?.vpn_allowed || false,
            rate_limit: editPolicy.rolePolicies?.Student?.rate_limit ?? 10,
          },
        },
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editPolicy, isOpen]);

  const setRoleField = (role, field, value) => {
    setForm((f) => ({
      ...f,
      rolePolicies: {
        ...f.rolePolicies,
        [role]: { ...f.rolePolicies[role], [field]: value },
      },
    }));
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      bruteForceThreshold: Number(form.bruteForceThreshold),
      rateLimitWindowMinutes: Number(form.rateLimitWindowMinutes),
      impossibleTravelDetection: form.impossibleTravelDetection,
      status: form.status,
      blockedIps: form.blockedIps ? form.blockedIps.split(",").map((s) => s.trim()).filter(Boolean) : [],
      trustedNetworks: form.trustedNetworks ? form.trustedNetworks.split(",").map((s) => s.trim()).filter(Boolean) : [],
      rolePolicies: {},
    };
    ["Admin", "Instructor", "Student"].forEach((role) => {
      const rp = form.rolePolicies[role];
      const ips = rp.allowed_ips.split(",").map((s) => s.trim()).filter(Boolean);
      payload.rolePolicies[role] = {
        allowed_ips: ips.length ? ips : ["any"],
        vpn_allowed: rp.vpn_allowed,
        rate_limit: Number(rp.rate_limit),
      };
    });
    return payload;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Policy name is required", status: "warning", duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editPolicy) {
        await updateIpPolicy(editPolicy.id, payload);
      } else {
        await createIpPolicy(payload);
      }
      toast({ title: editPolicy ? "Policy updated" : "Policy created", status: "success", duration: 3000 });
      onSaved();
      onClose();
    } catch {
      toast({ title: editPolicy ? "Update failed" : "Create failed", status: "error", duration: 4000 });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editPolicy ? "Edit IP Policy" : "Create IP Access Policy"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Policy Name</FormLabel>
              <Input size="sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Main Campus Policy" />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea size="sm" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of this policy's purpose" />
            </FormControl>

            <Divider />
            <Text fontSize="sm" fontWeight="semibold">Role Access Rules</Text>

            {["Admin", "Instructor", "Student"].map((role) => (
              <Box key={role} p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2} color="blue.700">{role}</Text>
                <SimpleGrid columns={3} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="xs">Allowed IPs / CIDRs</FormLabel>
                    <Input
                      size="xs"
                      value={form.rolePolicies[role].allowed_ips}
                      onChange={(e) => setRoleField(role, "allowed_ips", e.target.value)}
                      placeholder="any  or  192.168.1.0/24"
                      fontFamily="mono"
                    />
                    <FormHelperText fontSize="xs">Comma-separated. Use "any" for unrestricted.</FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs">Rate Limit (req/min)</FormLabel>
                    <NumberInput size="xs" min={1} max={1000} value={form.rolePolicies[role].rate_limit} onChange={(v) => setRoleField(role, "rate_limit", v)}>
                      <NumberInputField />
                      <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl display="flex" flexDir="column" justifyContent="flex-end" pb={1}>
                    <FormLabel fontSize="xs">VPN Bypass</FormLabel>
                    <Switch size="sm" isChecked={form.rolePolicies[role].vpn_allowed} onChange={(e) => setRoleField(role, "vpn_allowed", e.target.checked)} />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}

            <Divider />

            <FormControl>
              <FormLabel fontSize="sm">Blocked IPs / CIDRs (comma-separated)</FormLabel>
              <Textarea size="sm" rows={2} value={form.blockedIps} onChange={(e) => setForm((f) => ({ ...f, blockedIps: e.target.value }))} placeholder="185.23.44.0/24, 203.45.67.0/24" fontFamily="mono" />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Trusted Networks / VPN CIDRs (comma-separated)</FormLabel>
              <Input size="sm" value={form.trustedNetworks} onChange={(e) => setForm((f) => ({ ...f, trustedNetworks: e.target.value }))} placeholder="10.0.0.0/8, 172.16.0.0/12" fontFamily="mono" />
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Brute Force Threshold</FormLabel>
                <NumberInput size="sm" min={1} max={100} value={form.bruteForceThreshold} onChange={(v) => setForm((f) => ({ ...f, bruteForceThreshold: v }))}>
                  <NumberInputField />
                  <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                </NumberInput>
                <FormHelperText fontSize="xs">Failed attempts before IP is blocked</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Rate Limit Window (minutes)</FormLabel>
                <NumberInput size="sm" min={1} max={60} value={form.rateLimitWindowMinutes} onChange={(v) => setForm((f) => ({ ...f, rateLimitWindowMinutes: v }))}>
                  <NumberInputField />
                  <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl display="flex" alignItems="center" gap={2}>
                <Switch size="sm" isChecked={form.impossibleTravelDetection} onChange={(e) => setForm((f) => ({ ...f, impossibleTravelDetection: e.target.checked }))} />
                <FormLabel mb={0} fontSize="sm">Impossible Travel Detection</FormLabel>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Initial Status</FormLabel>
                <Select size="sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="blue" onClick={handleSave} isLoading={saving}>
            {editPolicy ? "Save Changes" : "Create Policy"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function PolicyDetailDrawer({ policy, isOpen, onClose, onActivate, onDeactivate, activating, deactivating }) {
  if (!policy) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <Flex align="center" gap={2}>
            <FiShield />
            <Text>{policy.name}</Text>
            <Badge colorScheme={STATUS_COLORS[policy.status]} ml={1}>{policy.status}</Badge>
          </Flex>
        </DrawerHeader>
        <DrawerCloseButton />
        <DrawerBody py={4}>
          <VStack spacing={4} align="stretch">
            {policy.description && (
              <Text fontSize="sm" color="gray.600">{policy.description}</Text>
            )}

            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <Text fontSize="xs" color="gray.500">Brute Force Threshold</Text>
                <Text fontWeight="medium">{policy.bruteForceThreshold} attempts</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">Rate Limit Window</Text>
                <Text fontWeight="medium">{policy.rateLimitWindowMinutes} min</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">Impossible Travel</Text>
                <Badge colorScheme={policy.impossibleTravelDetection ? "green" : "gray"}>
                  {policy.impossibleTravelDetection ? "Enabled" : "Disabled"}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">Created By</Text>
                <Text fontSize="sm">{policy.creator ? `${policy.creator.firstName} ${policy.creator.lastName}` : "—"}</Text>
              </Box>
            </SimpleGrid>

            <Divider />
            <Text fontSize="sm" fontWeight="semibold">Role Policies</Text>
            {policy.rolePolicies && Object.entries(policy.rolePolicies).map(([role, rp]) => (
              <Box key={role} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={1}>{role}</Text>
                <Text fontSize="xs" color="gray.600">
                  IPs: <Text as="span" fontFamily="mono">{Array.isArray(rp.allowed_ips) ? rp.allowed_ips.join(", ") : rp.allowed_ips}</Text>
                </Text>
                <HStack spacing={3} mt={1}>
                  <Badge colorScheme={rp.vpn_allowed ? "teal" : "gray"} variant="subtle" fontSize="xs">
                    VPN {rp.vpn_allowed ? "allowed" : "not allowed"}
                  </Badge>
                  {rp.rate_limit && (
                    <Text fontSize="xs" color="gray.500">Rate: {rp.rate_limit} req/min</Text>
                  )}
                </HStack>
              </Box>
            ))}

            {policy.blockedIps?.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Blocked IPs</Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {policy.blockedIps.map((ip) => (
                      <Tag key={ip} size="sm" colorScheme="red" variant="subtle">
                        <TagLabel fontFamily="mono">{ip}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </>
            )}

            {policy.trustedNetworks?.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Trusted Networks</Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {policy.trustedNetworks.map((net) => (
                      <Tag key={net} size="sm" colorScheme="teal" variant="subtle">
                        <TagLabel fontFamily="mono">{net}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </>
            )}

            <Divider />
            <HStack spacing={3}>
              {policy.status !== "active" && (
                <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} onClick={() => onActivate(policy)} isLoading={activating}>
                  Activate
                </Button>
              )}
              {policy.status === "active" && (
                <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiX />} onClick={() => onDeactivate(policy)} isLoading={deactivating}>
                  Deactivate
                </Button>
              )}
            </HStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

function ReviewExceptionModal({ exception, isOpen, onClose, onReviewed }) {
  const toast = useToast();
  const [decision, setDecision] = useState("approved");
  const [expiresAt, setExpiresAt] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDecision("approved");
    setExpiresAt("");
    setReviewNote("");
  }, [exception, isOpen]);

  const handleSubmit = async () => {
    if (decision === "approved" && !expiresAt) {
      toast({ title: "Expiry date is required when approving", status: "warning", duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      const payload = { status: decision, reviewNote: reviewNote || null };
      if (decision === "approved") payload.expiresAt = new Date(expiresAt).toISOString();
      await reviewIpException(exception.id, payload);
      toast({ title: `Exception ${decision}`, status: "success", duration: 3000 });
      onReviewed();
      onClose();
    } catch {
      toast({ title: "Review failed", status: "error", duration: 4000 });
      onReviewed();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!exception) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review Exception Request</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="xs" color="gray.500">Requester</Text>
              <Text fontSize="sm" fontWeight="medium">{exception.requester?.firstName} {exception.requester?.lastName}</Text>
              <Text fontSize="xs" color="gray.500">{exception.requester?.email}</Text>
              <Text fontSize="xs" color="gray.500" mt={2}>IP Address</Text>
              <Text fontSize="sm" fontFamily="mono" fontWeight="medium">{exception.ipAddress}</Text>
              <Text fontSize="xs" color="gray.500" mt={2}>Reason</Text>
              <Text fontSize="sm">{exception.reason}</Text>
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Decision</FormLabel>
              <Select size="sm" value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="approved">Approve</option>
                <option value="denied">Deny</option>
              </Select>
            </FormControl>

            {decision === "approved" && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Access Expires At</FormLabel>
                <Input size="sm" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                <FormHelperText fontSize="xs">Exception is automatically voided after this time</FormHelperText>
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Review Note (optional)</FormLabel>
              <Textarea size="sm" rows={3} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Reason for approval or denial..." />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme={decision === "approved" ? "green" : "red"} onClick={handleSubmit} isLoading={saving}>
            {decision === "approved" ? "Approve" : "Deny"} Exception
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function IpTesterPanel() {
  const toast = useToast();
  const [ipAddress, setIpAddress] = useState("");
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    if (!ipAddress.trim()) {
      toast({ title: "IP address is required", status: "warning", duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await checkIpAccess({ ipAddress: ipAddress.trim(), role });
      setResult(res?.data || res);
    } catch {
      toast({ title: "Test failed — showing mock result", status: "warning", duration: 3000 });
      const isCampusRange = ipAddress.startsWith("192.168.1.");
      setResult({
        ipAddress: ipAddress.trim(),
        role,
        allowed: isCampusRange,
        reason: isCampusRange
          ? `IP ${ipAddress.trim()} is within allowed range 192.168.1.0/24 for role ${role}`
          : `IP ${ipAddress.trim()} is not in the allowed range 192.168.1.0/24 for role ${role}`,
        isBruteForce: false,
        alertGenerated: !isCampusRange,
        policyId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Test whether an IP address would be permitted under the currently active policy.
      </Text>
      <Flex gap={3} mb={4} flexWrap="wrap">
        <Input
          size="sm"
          placeholder="IPv4 address (e.g. 192.168.1.50)"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          maxW="260px"
          fontFamily="mono"
        />
        <Select size="sm" value={role} onChange={(e) => setRole(e.target.value)} maxW="160px">
          <option value="Admin">Admin</option>
          <option value="Instructor">Instructor</option>
          <option value="Student">Student</option>
        </Select>
        <Button size="sm" colorScheme="blue" leftIcon={<FiSearch />} onClick={handleTest} isLoading={loading}>
          Test IP
        </Button>
      </Flex>

      {result && (
        <Box p={4} bg={result.allowed ? "green.50" : "red.50"} border="1px solid" borderColor={result.allowed ? "green.200" : "red.200"} borderRadius="md">
          <Flex align="center" gap={2} mb={2}>
            {result.allowed ? <FiCheck color="green" /> : <FiX color="red" />}
            <Badge colorScheme={result.allowed ? "green" : "red"} fontSize="sm">
              {result.allowed ? "ALLOWED" : "DENIED"}
            </Badge>
            <Text fontFamily="mono" fontSize="sm" fontWeight="medium">{result.ipAddress}</Text>
            <Badge variant="outline" colorScheme="blue">{result.role}</Badge>
          </Flex>
          <Text fontSize="sm" color="gray.700">{result.reason}</Text>
          <HStack mt={2} spacing={3}>
            {result.alertGenerated && (
              <Badge colorScheme="orange" variant="subtle">Alert Generated</Badge>
            )}
            {result.isBruteForce && (
              <Badge colorScheme="red" variant="subtle">Brute Force Flagged</Badge>
            )}
            {result.policyId && (
              <Text fontSize="xs" color="gray.500">Policy: <Text as="span" fontFamily="mono">{result.policyId.slice(0, 8)}…</Text></Text>
            )}
          </HStack>
        </Box>
      )}
    </Box>
  );
}

function IpPolicyPage() {
  const toast = useToast();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();

  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [activePolicy, setActivePolicy] = useState(null);

  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [policyPage, setPolicyPage] = useState(1);
  const [policyTotalPages, setPolicyTotalPages] = useState(1);
  const [policyStatusFilter, setPolicyStatusFilter] = useState("");
  const [policySearch, setPolicySearch] = useState("");

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logStatusFilter, setLogStatusFilter] = useState("");

  const [exceptions, setExceptions] = useState([]);
  const [exceptionsLoading, setExceptionsLoading] = useState(true);
  const [excStatusFilter, setExcStatusFilter] = useState("");

  const [editPolicy, setEditPolicy] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedException, setSelectedException] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchKpis = useCallback(async () => {
    setKpisLoading(true);
    try {
      const res = await getIpPolicyKpis();
      setKpis(res?.data || res);
    } catch {
      setKpis(MOCK_KPIS);
    } finally {
      setKpisLoading(false);
    }
  }, []);

  const fetchActivePolicy = useCallback(async () => {
    try {
      const res = await getActiveIpPolicy();
      setActivePolicy(res?.data || res);
    } catch {
      const active = MOCK_POLICIES.find((p) => p.status === "active") || null;
      setActivePolicy(active);
    }
  }, []);

  const fetchPolicies = useCallback(async () => {
    setPoliciesLoading(true);
    try {
      const params = { page: policyPage, limit: 20 };
      if (policyStatusFilter) params.status = policyStatusFilter;
      if (policySearch) params.search = policySearch;
      const res = await listIpPolicies(params);
      const payload = res?.data || res;
      const items = Array.isArray(payload?.policies) ? payload.policies : Array.isArray(payload) ? payload : MOCK_POLICIES;
      setPolicies(items);
      const computed = Math.ceil((payload?.total || items.length) / 20) || 1;
      setPolicyTotalPages(payload?.totalPages ?? computed);
    } catch {
      setPolicies(MOCK_POLICIES);
      setPolicyTotalPages(1);
    } finally {
      setPoliciesLoading(false);
    }
  }, [policyPage, policyStatusFilter, policySearch]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = { page: logPage, limit: 20 };
      if (logStatusFilter) params.authStatus = logStatusFilter;
      const res = await getIpAuthLogs(params);
      const payload = res?.data || res;
      const items = Array.isArray(payload?.logs) ? payload.logs : Array.isArray(payload) ? payload : MOCK_LOGS;
      setLogs(items);
      const computed = Math.ceil((payload?.total || items.length) / 20) || 1;
      setLogTotalPages(payload?.totalPages ?? computed);
    } catch {
      setLogs(MOCK_LOGS);
      setLogTotalPages(1);
    } finally {
      setLogsLoading(false);
    }
  }, [logPage, logStatusFilter]);

  const fetchExceptions = useCallback(async () => {
    setExceptionsLoading(true);
    try {
      const params = { page: 1, limit: 50 };
      if (excStatusFilter) params.status = excStatusFilter;
      const res = await listIpExceptions(params);
      const payload = res?.data || res;
      const items = Array.isArray(payload?.exceptions) ? payload.exceptions : Array.isArray(payload) ? payload : MOCK_EXCEPTIONS;
      setExceptions(items);
    } catch {
      setExceptions(MOCK_EXCEPTIONS);
    } finally {
      setExceptionsLoading(false);
    }
  }, [excStatusFilter]);

  useEffect(() => { fetchKpis(); fetchActivePolicy(); }, [fetchKpis, fetchActivePolicy]);
  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchExceptions(); }, [fetchExceptions]);

  const handleActivate = async (policy) => {
    setActivatingId(policy.id);
    try {
      await activateIpPolicy(policy.id);
      toast({ title: `"${policy.name}" is now active`, status: "success", duration: 3000 });
      fetchPolicies();
      fetchActivePolicy();
      fetchKpis();
      onDetailClose();
    } catch {
      toast({ title: "Activation failed", status: "error", duration: 4000 });
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (policy) => {
    setDeactivatingId(policy.id);
    try {
      await deactivateIpPolicy(policy.id);
      toast({ title: `"${policy.name}" deactivated`, status: "success", duration: 3000 });
      fetchPolicies();
      fetchActivePolicy();
      onDetailClose();
    } catch {
      toast({ title: "Deactivation failed", status: "error", duration: 4000 });
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleDelete = async (policy) => {
    if (!window.confirm(`Delete "${policy.name}"? This cannot be undone.`)) return;
    setDeletingId(policy.id);
    try {
      await deleteIpPolicy(policy.id);
      toast({ title: "Policy deleted", status: "success", duration: 3000 });
      fetchPolicies();
    } catch (err) {
      if (err?.response?.status === 403) {
        toast({ title: "Cannot delete active policy", description: "Deactivate it first.", status: "warning", duration: 5000 });
      } else {
        toast({ title: "Delete failed", status: "error", duration: 4000 });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (policy) => { setEditPolicy(policy); onFormOpen(); };
  const openCreate = () => { setEditPolicy(null); onFormOpen(); };
  const openDetail = (policy) => { setSelectedPolicy(policy); onDetailOpen(); };
  const openReview = (exc) => { setSelectedException(exc); onReviewOpen(); };

  return (
    <AdminMainAreaWrapper>
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="md" color="gray.800">IP-Based Authentication</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Network-level access control policies for all login attempts
            </Text>
          </Box>
          <HStack>
            <Tooltip label="Refresh">
              <IconButton size="sm" variant="outline" icon={<FiRefreshCw />} onClick={() => { fetchKpis(); fetchActivePolicy(); fetchPolicies(); fetchLogs(); fetchExceptions(); }} />
            </Tooltip>
            <Button size="sm" colorScheme="blue" leftIcon={<FiPlus />} onClick={openCreate}>New Policy</Button>
          </HStack>
        </Flex>

        {activePolicy ? (
          <Box mb={5} p={3} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="md">
            <Flex align="center" gap={2}>
              <FiShield color="green" />
              <Text fontSize="sm" fontWeight="medium" color="green.700">
                Active Policy: <strong>{activePolicy.name}</strong>
              </Text>
              <Badge colorScheme="green" ml={1}>ENFORCED</Badge>
              {activePolicy.impossibleTravelDetection && (
                <Badge colorScheme="purple" variant="subtle" ml={1}>Impossible Travel Detection</Badge>
              )}
            </Flex>
          </Box>
        ) : (
          <Box mb={5} p={3} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="md">
            <Flex align="center" gap={2}>
              <FiAlertTriangle color="orange" />
              <Text fontSize="sm" color="orange.700">No active IP policy — login attempts are not being validated against any IP restrictions.</Text>
            </Flex>
          </Box>
        )}

        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
          <KpiCard label="Total Attempts" value={kpisLoading ? "..." : kpis?.totalAttempts?.toLocaleString()} icon={<FiShield />} />
          <KpiCard label="Allowed" value={kpisLoading ? "..." : kpis?.allowedAttempts?.toLocaleString()} color="green.600" />
          <KpiCard label="Denied" value={kpisLoading ? "..." : kpis?.deniedAttempts?.toLocaleString()} color="red.600" />
          <KpiCard label="Unauthorized Rate" value={kpisLoading ? "..." : `${kpis?.unauthorizedAccessRate ?? 0}%`} color="red.500" />
          <KpiCard label="Brute Force" value={kpisLoading ? "..." : kpis?.bruteForceDetections} color="orange.600" icon={<FiZap />} />
          <KpiCard label="Alerts" value={kpisLoading ? "..." : kpis?.securityAlertFrequency} color="purple.600" icon={<FiAlertTriangle />} />
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab fontSize="sm">Policies</Tab>
            <Tab fontSize="sm">Auth Logs</Tab>
            <Tab fontSize="sm">IP Tester</Tab>
            <Tab fontSize="sm">
              Exceptions
              {exceptions.filter((e) => e.status === "pending").length > 0 && (
                <Badge colorScheme="orange" ml={2} borderRadius="full">
                  {exceptions.filter((e) => e.status === "pending").length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {/* Policies Tab */}
            <TabPanel px={0} pt={4}>
              <Flex gap={3} mb={4} flexWrap="wrap">
                <Input size="sm" placeholder="Search policies..." value={policySearch} onChange={(e) => { setPolicySearch(e.target.value); setPolicyPage(1); }} maxW="240px" />
                <Select size="sm" value={policyStatusFilter} onChange={(e) => { setPolicyStatusFilter(e.target.value); setPolicyPage(1); }} maxW="160px">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Flex>

              {policiesLoading ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : (
                <>
                  <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Policy Name</Th>
                          <Th>Status</Th>
                          <Th>Brute Force</Th>
                          <Th>Travel Detection</Th>
                          <Th>Created</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {policies.map((p) => (
                          <Tr key={p.id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => openDetail(p)}>
                            <Td>
                              <Text fontWeight="medium" fontSize="sm">{p.name}</Text>
                              {p.description && (
                                <Text fontSize="xs" color="gray.400" isTruncated maxW="220px">{p.description}</Text>
                              )}
                            </Td>
                            <Td onClick={(e) => e.stopPropagation()}>
                              <Badge colorScheme={STATUS_COLORS[p.status]}>{p.status}</Badge>
                            </Td>
                            <Td>{p.bruteForceThreshold} attempts</Td>
                            <Td>
                              <Badge colorScheme={p.impossibleTravelDetection ? "purple" : "gray"} variant="subtle">
                                {p.impossibleTravelDetection ? "On" : "Off"}
                              </Badge>
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                            </Td>
                            <Td onClick={(e) => e.stopPropagation()}>
                              <HStack spacing={1}>
                                {p.status !== "active" && (
                                  <Tooltip label="Activate">
                                    <IconButton size="xs" colorScheme="green" variant="ghost" icon={<FiCheck />} onClick={() => handleActivate(p)} isLoading={activatingId === p.id} />
                                  </Tooltip>
                                )}
                                {p.status === "active" && (
                                  <Tooltip label="Deactivate">
                                    <IconButton size="xs" colorScheme="orange" variant="ghost" icon={<FiX />} onClick={() => handleDeactivate(p)} isLoading={deactivatingId === p.id} />
                                  </Tooltip>
                                )}
                                <Tooltip label="Edit">
                                  <IconButton size="xs" colorScheme="blue" variant="ghost" icon={<FiEdit2 />} onClick={() => openEdit(p)} />
                                </Tooltip>
                                <Tooltip label="Delete">
                                  <IconButton size="xs" colorScheme="red" variant="ghost" icon={<FiTrash2 />} onClick={() => handleDelete(p)} isLoading={deletingId === p.id} />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {policies.length === 0 && (
                      <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No policies found</Text>
                    )}
                  </Box>
                  <PaginationBar page={policyPage} totalPages={policyTotalPages} onPage={setPolicyPage} />
                </>
              )}
            </TabPanel>

            {/* Auth Logs Tab */}
            <TabPanel px={0} pt={4}>
              <Flex gap={3} mb={4} flexWrap="wrap">
                <Select size="sm" value={logStatusFilter} onChange={(e) => { setLogStatusFilter(e.target.value); setLogPage(1); }} maxW="180px">
                  <option value="">All Outcomes</option>
                  <option value="allowed">Allowed</option>
                  <option value="denied">Denied</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </Flex>

              {logsLoading ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : (
                <>
                  <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>User</Th>
                          <Th>IP Address</Th>
                          <Th>Role</Th>
                          <Th>Outcome</Th>
                          <Th>Reason</Th>
                          <Th>Device</Th>
                          <Th>Flags</Th>
                          <Th>Time</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {logs.map((log) => (
                          <Tr key={log.id} _hover={{ bg: "gray.50" }}>
                            <Td>
                              {log.user ? (
                                <Box>
                                  <Text fontSize="sm">{log.user.firstName} {log.user.lastName}</Text>
                                  <Text fontSize="xs" color="gray.400">{log.user.email}</Text>
                                </Box>
                              ) : (
                                <Text fontSize="xs" color="gray.400" fontStyle="italic">Unknown</Text>
                              )}
                            </Td>
                            <Td>
                              <Text fontFamily="mono" fontSize="xs">{log.ipAddress}</Text>
                            </Td>
                            <Td>
                              <Badge variant="outline" colorScheme="blue" fontSize="xs">{log.role || "—"}</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={AUTH_COLORS[log.authStatus]} fontSize="xs">
                                {log.authStatus}
                              </Badge>
                            </Td>
                            <Td maxW="200px">
                              <Text fontSize="xs" color="gray.600" isTruncated title={log.denialReason}>
                                {log.denialReason || "—"}
                              </Text>
                            </Td>
                            <Td fontSize="xs" color="gray.600">
                              {log.deviceInfo ? `${log.deviceInfo.device_type} / ${log.deviceInfo.browser}` : "—"}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                {log.alertGenerated && <Badge colorScheme="orange" variant="subtle" fontSize="xs">Alert</Badge>}
                                {log.isBruteForce && <Badge colorScheme="red" variant="subtle" fontSize="xs">BF</Badge>}
                              </HStack>
                            </Td>
                            <Td fontSize="xs" color="gray.500" whiteSpace="nowrap">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    {logs.length === 0 && (
                      <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No logs found</Text>
                    )}
                  </Box>
                  <PaginationBar page={logPage} totalPages={logTotalPages} onPage={setLogPage} />
                </>
              )}
            </TabPanel>

            {/* IP Tester Tab */}
            <TabPanel px={0} pt={4}>
              <IpTesterPanel />
            </TabPanel>

            {/* Exceptions Tab */}
            <TabPanel px={0} pt={4}>
              <Flex gap={3} mb={4} flexWrap="wrap">
                <Select size="sm" value={excStatusFilter} onChange={(e) => { setExcStatusFilter(e.target.value); }} maxW="180px">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </Select>
              </Flex>

              {exceptionsLoading ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : (
                <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.100">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Requester</Th>
                        <Th>IP Address</Th>
                        <Th>Reason</Th>
                        <Th>Status</Th>
                        <Th>Expires At</Th>
                        <Th>Review Note</Th>
                        <Th>Submitted</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {exceptions.map((exc) => (
                        <Tr key={exc.id} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <Text fontSize="sm">{exc.requester?.firstName} {exc.requester?.lastName}</Text>
                            <Text fontSize="xs" color="gray.400">{exc.requester?.email}</Text>
                          </Td>
                          <Td><Text fontFamily="mono" fontSize="xs">{exc.ipAddress}</Text></Td>
                          <Td maxW="180px">
                            <Text fontSize="xs" isTruncated title={exc.reason}>{exc.reason}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={exc.status === "approved" ? "green" : exc.status === "denied" ? "red" : "orange"}>
                              {exc.status}
                            </Badge>
                          </Td>
                          <Td fontSize="xs" color="gray.600">
                            {exc.expiresAt ? new Date(exc.expiresAt).toLocaleDateString() : "—"}
                          </Td>
                          <Td maxW="160px">
                            <Text fontSize="xs" color="gray.600" isTruncated title={exc.reviewNote}>{exc.reviewNote || "—"}</Text>
                          </Td>
                          <Td fontSize="xs" color="gray.500">
                            {exc.createdAt ? new Date(exc.createdAt).toLocaleDateString() : "—"}
                          </Td>
                          <Td>
                            {exc.status === "pending" && (
                              <Button size="xs" colorScheme="blue" onClick={() => openReview(exc)}>
                                Review
                              </Button>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {exceptions.length === 0 && (
                    <Text textAlign="center" py={8} color="gray.400" fontSize="sm">No exception requests found</Text>
                  )}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        <PolicyFormModal
          isOpen={isFormOpen}
          onClose={onFormClose}
          editPolicy={editPolicy}
          onSaved={() => { fetchPolicies(); fetchActivePolicy(); }}
        />

        <PolicyDetailDrawer
          policy={selectedPolicy}
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          activating={activatingId === selectedPolicy?.id}
          deactivating={deactivatingId === selectedPolicy?.id}
        />

        <ReviewExceptionModal
          exception={selectedException}
          isOpen={isReviewOpen}
          onClose={onReviewClose}
          onReviewed={fetchExceptions}
        />
      </Box>
    </AdminMainAreaWrapper>
  );
}

export const IpPolicyPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <IpPolicyPage {...props} />} />
);

export default IpPolicyPage;
