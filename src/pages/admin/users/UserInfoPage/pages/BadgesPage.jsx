import { useCallback, useEffect, useState } from "react";
import { Route, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
} from "@chakra-ui/react";
import { AdminMainAreaWrapper } from "../../../../../layouts/admin/MainArea/Wrapper";
import {
  adminGetBadgeProgressByUserId,
  userGetMyBadges,
  userGetMyRank,
} from "../../../../../services";

const BadgesPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [rank, setRank] = useState({ rank: 0, totalPoints: 0, totalUsers: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [badgesResponse, progressResponse, rankResponse] = await Promise.all([
        userGetMyBadges({ userId: id, page: 1, limit: 20 }),
        adminGetBadgeProgressByUserId(id),
        userGetMyRank({ userId: id }),
      ]);

      setBadges(badgesResponse.rows || []);
      setProgress(progressResponse.badgeProgress || []);
      setRank(rankResponse || { rank: 0, totalPoints: 0, totalUsers: 0 });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminMainAreaWrapper>
      <Box p={6}>
        <Text fontSize="24px" fontWeight="700" mb={4}>
          Badges
        </Text>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p={4}>
            <Text fontSize="12px" color="gray.500">Current Rank</Text>
            <Text fontSize="24px" fontWeight="700">#{rank.rank || "—"}</Text>
          </Box>
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p={4}>
            <Text fontSize="12px" color="gray.500">Total Points</Text>
            <Text fontSize="24px" fontWeight="700">{rank.totalPoints || 0}</Text>
          </Box>
          <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" p={4}>
            <Text fontSize="12px" color="gray.500">Badges Earned</Text>
            <Text fontSize="24px" fontWeight="700">{badges.length}</Text>
          </Box>
        </Grid>

        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px" mb={6}>
          <Text fontWeight="600" p={4} borderBottom="1px solid #E2E8F0">
            Earned Badges
          </Text>
          {loading ? (
            <Flex py={8} justifyContent="center"><Spinner /></Flex>
          ) : (
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th>Points</Th>
                    <Th>Awarded At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {badges.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.badge?.name || "—"}</Td>
                      <Td>{item.badge?.category || "—"}</Td>
                      <Td>{item.badge?.points ?? "—"}</Td>
                      <Td>
                        {item.awardedAt ? new Date(item.awardedAt).toLocaleString() : "—"}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Box bg="white" border="1px solid #E2E8F0" borderRadius="8px">
          <Text fontWeight="600" p={4} borderBottom="1px solid #E2E8F0">
            Badge Progress
          </Text>
          {progress.length === 0 ? (
            <Text p={4} color="gray.500">No progress records found.</Text>
          ) : (
            <Flex direction="column" gap={4} p={4}>
              {progress.map((item) => (
                <Box key={item.badgeId}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="14px" fontWeight="600">{item.badgeName}</Text>
                    <Text fontSize="12px" color="gray.500">{item.progress?.percentage || 0}%</Text>
                  </Flex>
                  <Progress value={item.progress?.percentage || 0} borderRadius="6px" />
                </Box>
              ))}
            </Flex>
          )}
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

const BadgesPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <BadgesPage {...props} />} />
);

export default BadgesPageRoute;
