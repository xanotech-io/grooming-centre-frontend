import { Route } from 'react-router-dom';
import Comments from '../Comments/Comments';
import CommentList from '../Comments/CommentList';
import useYourAnswersPage from './hooks/useYourAnswersPage';
import AnswersList from './hooks/AnswersList';

const YourAnswersPage = () => {
  const { commentsManager } = useYourAnswersPage();

  return (
    <Comments commentsManager={commentsManager}>
      {({
        comments,
        handleAddReply,
        handleDeleteComment,
        handleEditComment,
        handleDeleteReply,
        handleEditReply,
        handleCommentExpression,
        deleteStatusIsLoading,
        expStatusIsLoading,
      }) => (
        <>
          <AnswersList
            data={comments.data}
            deleteStatusIsLoading={deleteStatusIsLoading}
            expStatusIsLoading={expStatusIsLoading}
            commentCardHandlers={{
              onCommentEditSuccess: handleEditComment,
              onCommentDelete: handleDeleteComment,
              onReplySuccess: handleAddReply,
              onReplyDeleteSuccess: handleDeleteReply,
              onReplyEditSuccess: handleEditReply,
              onCommentExpression: handleCommentExpression,
            }}
            replyCardHandlers={{
              onReplyDeleteSuccess: handleDeleteReply,
              onReplyEditSuccess: handleEditReply,
            }}
          />
          {/* <CommentList
            data={comments.data}
            commentCardProps={{ noBorder: true }}
            deleteStatusIsLoading={deleteStatusIsLoading}
            expStatusIsLoading={expStatusIsLoading}
            commentCardHandlers={{
              onCommentEditSuccess: handleEditComment,
              onCommentDelete: handleDeleteComment,
              onReplySuccess: handleAddReply,
              onReplyDeleteSuccess: handleDeleteReply,
              onReplyEditSuccess: handleEditReply,
              onCommentExpression: handleCommentExpression,
            }}
            replyCardHandlers={{
              onReplyDeleteSuccess: handleDeleteReply,
              onReplyEditSuccess: handleEditReply,
            }}
          /> */}
        </>
      )}
    </Comments>
  );
};

export const YourAnswersPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <YourAnswersPage {...props} />} />;
};
