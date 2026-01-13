import { useCallback } from "react";
import { userForumGetMentions } from "../../../../../services";
import useComments from "../../Comments/hooks/useComments";

const useMentionsPage = () => {
  const fetcher = useCallback(async () => await userForumGetMentions(), []);

  const commentsManager = useComments(fetcher);

  return {
    commentsManager,
  };
};

export default useMentionsPage;
