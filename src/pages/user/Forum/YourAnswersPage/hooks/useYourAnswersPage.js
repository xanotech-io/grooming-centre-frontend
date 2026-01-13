import { useCallback } from 'react';
import { userForumGetYourAnswers } from '../../../../../services';
import useComments from '../../Comments/hooks/useComments';

const useMentionsPage = () => {
  const fetcher = useCallback(async () => await userForumGetYourAnswers(), []);

  const commentsManager = useComments(fetcher);

  return {
    commentsManager,
  };
};

export default useMentionsPage;
