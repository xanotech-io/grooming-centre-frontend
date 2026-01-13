import React, { useState } from 'react';
import AnswersListCard from './AnswersListCard';

const AnswersList = ({
  data,
  commentCardHandlers,
  replyCardHandlers,
  deleteStatusIsLoading,
  expStatusIsLoading,
}) => {
  return (
    <div>
      {data?.map((comment) => (
        <AnswerListItem
          key={comment.id}
          commentCardHandlers={commentCardHandlers}
          replyCardHandlers={replyCardHandlers}
          deleteStatusIsLoading={deleteStatusIsLoading}
          expStatusIsLoading={expStatusIsLoading}
          comment={{ ...comment }}
        />
      ))}
    </div>
  );
};

const AnswerListItem = ({
  comment,
  commentCardHandlers,
  deleteStatusIsLoading,
  expStatusIsLoading,
}) => {
  const [displayReplies, setDisplayReplies] = useState(false);
  console.log(comment);

  const handleDisplayRepliesToggle = () => setDisplayReplies((prev) => !prev);

  return (
    <>
      <AnswersListCard
        key={comment.id}
        {...commentCardHandlers}
        onReplyToggle={handleDisplayRepliesToggle}
        displayReplies={displayReplies}
        deleteStatusIsLoading={deleteStatusIsLoading}
        expStatusIsLoading={expStatusIsLoading}
        {...comment}
      />
    </>
  );
};

export default AnswersList;
