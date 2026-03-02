import { Box } from '@chakra-ui/layout';
import { Route } from 'react-router-dom';
import {
  Button,
  Heading,
  QuestionListCard,
  Text,
} from '../../../../components';
import { useQueryParams } from '../../../../hooks';
import { PageLoaderLayout, EmptyState } from '../../../../layouts';
import { AskAQuestionButton } from '../../../../layouts/user/Forum/Header/Header';
import useQuestionsPage from './hooks/useQuestionsPage';

const QuestionsPage = () => {
  const { questions, handleFetch } = useQuestionsPage();

  const questionsIsEmpty =
    !questions.loading && !questions.err && !questions.data?.length
      ? true
      : false;

  const query = useQueryParams().get('q');

  return (
    <>
      {questions.loading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && !query && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Asked Yet
          </Heading>
          <Text as="level3" marginBottom={7}>
            Be the first to ask a question.
          </Text>

          <AskAQuestionButton sm />
        </PageLoaderLayout>
      )}

      {questions.err && <QuestionsPageErrorState />}

      {query && questions.data && (
        <Box position="absolute" transform="translateY(-60px)">
          <Heading as="h4">
            <Box as="span" color="primary.base">
              <q>{query}</q>
            </Box>{' '}
            {questions.data.length} Questions Found
          </Heading>
        </Box>
      )}

      {questions.data?.map((question) => (
        <Box p={1} key={question.id} position="relative">
          <QuestionListCard onDeleteSuccess={handleFetch} {...question} />
        </Box>
      ))}
    </>
  );
};

export const QuestionsPageErrorState = () => (
  <EmptyState
    cta={<Button onClick={() => window.location.reload()}>Try again</Button>}
    heading="Oops An Error Occurred"
    description="You are are not allowed to view this lesson"
  />
);

export const QuestionsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <QuestionsPage {...props} />} />;
};
