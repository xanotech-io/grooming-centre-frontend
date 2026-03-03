import { useToast } from '@chakra-ui/toast';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { useApp } from '../../../../../contexts';
import {
  useFetch,
  useFetchAndCache,
  useQueryParams,
} from '../../../../../hooks';
import {
  userForumEditQuestion,
  userForumGetCategories,
  userForumGetQuestionDetails,
  userForumPublishQuestion,
} from '../../../../../services';
import { capitalizeFirstLetter } from '../../../../../utils/formatString';

/**
 * Manages AddQuestionPage state
 * @param {{ selectedTags: Array<{ id: string, label: string }>, handleClearAllSelectedTags: () => }} props
 *
 * @returns {{ formManager: ReactHookForm, categories: { data: ?Array<{ value: string, label: string }>, loading: boolean, err: ?string }, handleSubmit: () => Promise<void> }}
 */
const useAddQuestionPage = ({ selectedTags, handleClearAllSelectedTags }) => {
  const toast = useToast();
  const { resource: categories, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { categories } = await userForumGetCategories();
    return categories;
  }, []);

  // Handle fetch category
  useEffect(() => {
    handleFetchResource({ cacheKey: 'forum-categories', fetcher });
  }, [handleFetchResource, fetcher]);

  // Handle category error
  useEffect(() => {
    if (categories.err) {
      toast({
        description: capitalizeFirstLetter(categories.err),
        position: 'top',
        status: 'error',
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.err]);

  const formManager = useForm();
  const {
    state: { user },
  } = useApp();

  const { resource: question, handleFetchResource: handleFetchQuestion } =
    useFetch();
  const questionId = useQueryParams().get('questionId');
  const redirectTo = useQueryParams().get('redirectTo');
  const { push } = useHistory();

  const questionFetcher = useCallback(async () => {
    const { question } = await userForumGetQuestionDetails(questionId);
    return question;
  }, [questionId]);

  // Handle fetch category
  useEffect(() => {
    if (questionId) handleFetchQuestion({ fetcher: questionFetcher });
  }, [handleFetchQuestion, questionFetcher, questionId]);

  // Init `Category` value
  useEffect(() => {
    if (question.data) {
      console.log(question.data);
      formManager.setValue('categoryId', question.data.categoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.data]);

  // Init `Title` value
  useEffect(() => {
    if (question.data) {
      console.log(question.data);
      formManager.setValue('title', question.data.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.data]);

  // Init `Question` value
  useEffect(() => {
    if (question.data) {
      console.log(question.data);
      formManager.setValue('question', question.data.body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.data]);

  const handlePublishQuestion = async (question) => {
    console.log(question);
    try {
      if (!selectedTags.length)
        throw new Error('Please select at least one tag');

      const body = {
        title: question.title,
        question: question.question,
        categoryId: question.categoryId,
        tagId: selectedTags.reduce((prev, tag) => [...prev, tag.id], []),
        userId: user?.id,
      };

      const { message } = await (questionId
        ? userForumEditQuestion(questionId, body)
        : userForumPublishQuestion(body));

      toast({
        description: capitalizeFirstLetter(message),
        position: 'top',
        status: 'success',
      });

      formManager.reset();
      handleClearAllSelectedTags();

      if (redirectTo) push(redirectTo);
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: 'top',
        status: 'error',
      });
    }
  };

  const handleSubmit = () => formManager.handleSubmit(handlePublishQuestion);

  const disableForm = formManager.formState.isSubmitting || !user;

  return {
    categories,
    formManager,
    handleSubmit,
    disableForm,
    isEditMode: questionId ? true : false,
    questionIsLoading: question.loading,
    questionData: question.data,
  };
};

export default useAddQuestionPage;
