import { useState } from 'react';
import { Route } from 'react-router-dom';
import { QuestionsPageErrorState } from '../..';
import { Heading, QuestionListCard, Text } from '../../../../components';
import { PageLoaderLayout } from '../../../../layouts';
import { AskAQuestionButton } from '../../../../layouts/user/Forum/Header/Header';
import useYourQuestionsPage from './hooks/useYourQuestionsPage';

const YourQuestionsPage = () => {
  const { questions } = useYourQuestionsPage();

  // const [shuffleQuestion, setShuffleQuestion] = useState(
  //   questions.splice()?.sort(() => Math.random() - 0.5)
  // );

  const questionsIsEmpty =
    !questions.loading && !questions.err && !questions.data?.length
      ? true
      : false;

  return (
    <>
      {questions.loading && <PageLoaderLayout height="70%" width="100%" />}

      {questionsIsEmpty && (
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

      {questions.data?.map((question) => (
        <QuestionListCard key={question.id} {...question} />
      ))}

      {/* {shuffleQuestion.data?.map((question) => (
        <QuestionListCard
          key={question.id}
          onDeleteSuccess={handleFetch}
          {...question}
        />
      ))} */}
    </>
  );
};

export const YourQuestionsPageRoute = ({ ...rest }) => {
  return (
    <Route {...rest} render={(props) => <YourQuestionsPage {...props} />} />
  );
};
