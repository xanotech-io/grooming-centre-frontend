import { useEffect } from 'react';
import { useCallback } from 'react';
import { useParams } from 'react-router';
import { useFetch } from '../../../../../hooks';
import {
  userForumGetComments,
  userForumGetQuestionDetails,
} from '../../../../../services';
import useComments from '../../Comments/hooks/useComments';

const useQuestionDetailsPage = () => {
  const { resource: question, handleFetchResource } = useFetch();
  const { id } = useParams();

  const fetcher = useCallback(async () => {
    const { question } = await userForumGetQuestionDetails(id);

    return question;
  }, [id]);

  const commentsFetcher = useCallback(
    async () => await userForumGetComments(id),
    [id]
  );

  // Handle fetch category
  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const commentsManager = useComments(commentsFetcher);

  return {
    question,
    commentsManager,
  };
};

export default useQuestionDetailsPage;
