import { useEffect } from 'react';
import { useCallback } from 'react';
import { useFetch } from '../../../../../hooks';
import { userForumGetYourQuestions } from '../../../../../services';

const useQuestionsPage = () => {
  const { resource: questions, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { questions } = await userForumGetYourQuestions();

    return questions;
  }, []);

  // Handle fetch category
  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    questions,
  };
};

export default useQuestionsPage;
