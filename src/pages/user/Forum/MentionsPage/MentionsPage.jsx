import { Route } from "react-router-dom";
import Comments from "../Comments/Comments";
import CommentList from "../Comments/CommentList";
import useMentionsPage from "./hooks/useMentionsPage";
import { useApp } from "../../../../contexts";

const MentionsPage = () => {
  const { commentsManager } = useMentionsPage();
  const {
    state: { user },
  } = useApp();

  return (
    <Comments commentsManager={commentsManager}>
      {({
        comments,
        questions,
        handleFetch,
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
          <CommentList
            data={comments.data}
            questions={questions}
            handleFetch={handleFetch}
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
            commentCardProps={{
              noBorder: true,
              mentionedUser: user,
            }}
          />
        </>
      )}
    </Comments>
  );
};

export const MentionsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <MentionsPage {...props} />} />;
};
