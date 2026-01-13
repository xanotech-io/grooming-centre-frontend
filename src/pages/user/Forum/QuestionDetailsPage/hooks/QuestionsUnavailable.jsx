import React from 'react';
import { useHistory } from 'react-router';
import { Button } from '../../../../../components';
import { EmptyState } from '../../../../../layouts';

const QuestionsUnavailable = () => {
  const { push } = useHistory();

  const handleGoToQuestions = () => {
    push('/forum/questions');
  };
  return (
    <EmptyState
      cta={<Button onClick={() => handleGoToQuestions()}>Go Back</Button>}
      heading="Oops An Error Occurred"
      description="Question is unavailable or has been deleted"
    />
  );
};

export default QuestionsUnavailable;
