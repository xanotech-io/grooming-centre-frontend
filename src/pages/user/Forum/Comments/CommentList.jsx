import { useState } from 'react';
import {
  CommentListCard,
  QuestionListCard,
  ReplyListCard,
} from '../../../../components';

const CommentList = ({
  data,
  questions,
  commentCardHandlers,
  replyCardHandlers,
  commentCardProps,
  deleteStatusIsLoading,
  expStatusIsLoading,
  handleFetch,
}) => {
  let mixedList = [...data];

  if (questions) {
    mixedList = [...mixedList, ...questions];

    mixedList.sort((a, b) => {
      if (new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime())
        return -1;
      if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime())
        return 1;

      return -1;
    });
  }

  return mixedList.map((comment) => {
    const isQuestion = comment.title;
    const isReply = comment.commentId;

    if (isQuestion)
      return (
        <QuestionListCard
          key={comment.id}
          onDeleteSuccess={handleFetch}
          mentionedUser={commentCardProps.mentionedUser}
          {...comment}
        />
      );

    if (isReply)
      return (
        <ReplyListCard
          key={comment.id}
          commentId={comment.commentId}
          viewQuestion
          deleteStatusIsLoading={deleteStatusIsLoading}
          mentionedUser={commentCardProps.mentionedUser}
          {...replyCardHandlers}
          {...comment}
        />
      );

    return (
      <CommentListItem
        key={comment.id}
        commentCardHandlers={commentCardHandlers}
        replyCardHandlers={replyCardHandlers}
        deleteStatusIsLoading={deleteStatusIsLoading}
        expStatusIsLoading={expStatusIsLoading}
        comment={{ ...comment, ...commentCardProps }}
      />
    );
  });
};

const CommentListItem = ({
  comment,
  commentCardHandlers,
  replyCardHandlers,
  deleteStatusIsLoading,
  expStatusIsLoading,
}) => {
  const [displayReplies, setDisplayReplies] = useState(false);

  const handleDisplayRepliesToggle = () => setDisplayReplies((prev) => !prev);
  const renderReplies = () =>
    displayReplies &&
    comment.replies
      .filter(({ active }) => active)
      .map((reply) => (
        <ReplyListCard
          key={reply.id}
          commentId={comment.id}
          deleteStatusIsLoading={deleteStatusIsLoading}
          {...replyCardHandlers}
          {...reply}
        />
      ));

  return (
    <>
      <CommentListCard
        key={comment.id}
        {...commentCardHandlers}
        onReplyToggle={handleDisplayRepliesToggle}
        displayReplies={displayReplies}
        deleteStatusIsLoading={deleteStatusIsLoading}
        expStatusIsLoading={expStatusIsLoading}
        {...comment}
      />
      {renderReplies()}
    </>
  );
};

export default CommentList;
