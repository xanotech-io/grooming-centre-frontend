import { useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory, useParams } from "react-router-dom";
import { Box, Flex, Spinner, keyframes } from "@chakra-ui/react";
import { Heading, Text, Button } from "../../../components";
import { getStudentOwnResult } from "../../../services";
import { isSubmissionGraded } from "../../../utils";
import { FiClock } from "react-icons/fi";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const POLL_INTERVAL = 30000;

const AwaitingGradePage = () => {
  const { courseId, assessmentId } = useParams();
  const { push } = useHistory();

  const [, setResult] = useState(null);
  const [autoScore, setAutoScore] = useState(null);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef(null);

  const check = useCallback(() => {
    setChecking(true);
    getStudentOwnResult(assessmentId)
      .then(({ result: data }) => {
        setResult(data);
        if (data?.autoScore != null) setAutoScore(parseFloat(data.autoScore));
        if (isSubmissionGraded(data?.status)) {
          clearInterval(intervalRef.current);
          push(`/courses/take/${courseId}/assessment/${assessmentId}/result`);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [assessmentId, courseId, push]);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [check]);

  return (
    <Box
      minH="100vh"
      bg="#F7F9FC"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box maxW="480px" w="100%" textAlign="center">
        {/* Icon */}
        <Flex justifyContent="center" mb={6}>
          <Box
            w="96px"
            h="96px"
            bg="#F0E6FF"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            animation={`${pulse} 2.5s ease-in-out infinite`}
          >
            <FiClock color="#6b006b" size={40} />
          </Box>
        </Flex>

        {/* Copy */}
        <Heading fontSize="heading.h3" color="#1A202C" mb={3}>
          Awaiting Grading
        </Heading>
        <Text fontSize="15px" color="gray.500" lineHeight="1.7" mb={6}>
          Your submission has been received. An instructor will review and grade
          your answers shortly. This page checks automatically every 30 seconds.
        </Text>

        {/* Auto score preview */}
        {autoScore != null && (
          <Box
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="12px"
            px={6}
            py={4}
            mb={6}
            textAlign="left"
          >
            <Text
              fontSize="11px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              Auto-graded Score
            </Text>
            <Flex alignItems="baseline" gap={2}>
              <Text
                fontSize="32px"
                fontWeight="900"
                color="#3182CE"
                lineHeight="1"
              >
                {autoScore.toFixed(1)}
              </Text>
              <Text fontSize="14px" color="gray.400">
                / 100
              </Text>
            </Flex>
            <Text fontSize="12px" color="gray.400" mt={1}>
              Objective questions graded. Manual questions pending.
            </Text>
          </Box>
        )}

        {/* Status pill */}
        <Flex justifyContent="center" alignItems="center" gap={2} mb={8}>
          {checking ? (
            <Spinner size="xs" color="#6b006b" />
          ) : (
            <Box w="8px" h="8px" borderRadius="50%" bg="#ECC94B" />
          )}
          <Text fontSize="13px" color="gray.500">
            {checking ? "Checking status…" : "Waiting for instructor to grade"}
          </Text>
        </Flex>

        {/* Actions */}
        <Flex gap={3} justifyContent="center" flexWrap="wrap">
          <Button
            secondary
            onClick={() => push(`/courses/details/${courseId}`)}
          >
            Back to Course
          </Button>
          <Button onClick={check} disabled={checking}>
            {checking ? "Checking…" : "Check Now"}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export const AwaitingGradePageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <AwaitingGradePage {...props} />} />
);

export default AwaitingGradePageRoute;
