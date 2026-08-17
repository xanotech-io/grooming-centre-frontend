import { useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { useApp } from "../contexts";
import { userGetMyBadges } from "../services";

const getCacheKey = (userId) => `earned-badge-ids:${userId}`;

/**
 * Badges are now awarded server-side the instant a student qualifies,
 * rather than being checked/created only when the Badges page is opened.
 * This hook diffs `my-badges` against a locally cached snapshot so a
 * "badge earned" toast can be shown right after any action that might
 * have triggered an award (e.g. finishing a lesson).
 */
const useBadgeEarnedNotifier = () => {
  const toast = useToast();
  const { state } = useApp();
  const userId = state?.user?.id;

  const checkForNewlyEarnedBadges = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await userGetMyBadges();
      const records = res?.data || res?.badges || [];
      const currentIds = records.map((record) => record.id);

      const cacheKey = getCacheKey(userId);
      const cached = localStorage.getItem(cacheKey);

      if (cached === null) {
        localStorage.setItem(cacheKey, JSON.stringify(currentIds));
        return;
      }

      const previousIds = JSON.parse(cached);
      const newlyEarned = records.filter(
        (record) => !previousIds.includes(record.id)
      );

      localStorage.setItem(cacheKey, JSON.stringify(currentIds));

      newlyEarned.forEach((record) => {
        const badge = record.badge || record;
        toast({
          title: "Badge earned!",
          description: badge?.title
            ? `You've earned the "${badge.title}" badge.`
            : "You've earned a new badge.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      });
    } catch (err) {
      console.error(err);
    }
  }, [userId, toast]);

  return { checkForNewlyEarnedBadges };
};

export default useBadgeEarnedNotifier;
