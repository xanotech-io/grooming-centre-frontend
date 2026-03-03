import { useToast } from '@chakra-ui/toast';
import { useEffect, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useFetch } from '../../../../../hooks';
import {
  userForumCreateExpression,
  userForumDeleteComment,
} from '../../../../../services';

const useComments = (fetcher) => {
  const {
    resource: comments,
    setResource: setComments,
    handleFetchResource,
  } = useFetch();

  const [questions, setQuestions] = useState(null);

  const handleFetch = useCallback(() => {
    handleFetchResource({
      fetcher: async () => {
        const { comments, questions } = await fetcher();
        setQuestions(questions);

        return comments;
      },
    });
  }, [fetcher, handleFetchResource]);

  const { location } = useHistory();

  const handleUpdateUI = (cb) => {
    if (!/\/forum\/questions\/details\//.test(location.pathname))
      return handleFetch();

    cb();
  };

  const toast = useToast();

  const [deleteStatus, setDeleteStatus] = useState({
    success: false,
    error: null,
    loading: false,
  });

  const [expStatus, setExpStatus] = useState({
    error: null,
    loading: false,
  });

  useEffect(() => {
    let isMount = true;

    if (deleteStatus.success && isMount) {
      toast({
        description: 'Deleted Successfully!',
        position: 'top',
        duration: 1000,
        status: 'success',
      });
      setDeleteStatus({});
    }
    if ((deleteStatus.error || expStatus.error) && isMount) {
      console.error(deleteStatus.error || expStatus.error);
      toast({
        description: (deleteStatus.error || expStatus.error).message,
        position: 'top',
        duration: 1000,
        status: 'error',
      });
      setDeleteStatus({});
      setExpStatus({});
    }

    return () => {
      isMount = false;
    };
  }, [deleteStatus.error, deleteStatus.success, expStatus.error, toast]);

  const handleAddReply = (commentId, reply) => {
    handleUpdateUI(() => {
      const newComments = [...comments.data];
      const comment = newComments.find(({ id }) => id === commentId);

      if (comment?.replies) {
        comment.replies = [reply, ...comment.replies];
        comment.replyCount = comment.replies.length;
      }

      setComments((prev) => ({ ...prev, data: newComments }));
    });
  };

  const handleAddComment = (comment) => {
    const newComments = [comment, ...comments.data];

    setComments((prev) => ({ ...prev, data: newComments }));
  };

  const handleEditComment = (comment) => {
    handleUpdateUI(() => {
      const newComments = [...comments.data];
      const commentIndex = newComments.findIndex((c) => c.id === comment.id);
      newComments.splice(commentIndex, 1, comment);

      setComments((prev) => ({ ...prev, data: newComments }));
    });
  };

  const handleCommentExpression = async (commentId, expression) => {
    const UIHandler = () => {
      const newComments = [...comments.data];
      const comment = newComments.find((c) => c.id === commentId);
      console.log(comment.expressions);

      const expressionIndex = comment.expressions.findIndex(
        (e) => e.userId === expression.userId
      );

      const expressionNotFound = expressionIndex === -1;

      const isSwitchExpression =
        !expressionNotFound &&
        comment.expressions[expressionIndex].expression !==
          expression.expression;

      if (expressionNotFound) {
        if (expression.expression === 'like') comment.likes += 1;
        else comment.dislikes += 1;

        comment.expressions = [expression, ...comment.expressions];
      } else {
        if (!isSwitchExpression) {
          if (expression.expression === 'like') comment.likes -= 1;
          else comment.dislikes -= 1;
        }

        comment.expressions.splice(expressionIndex, 1);
        if (isSwitchExpression) {
          if (expression.expression === 'like') {
            comment.likes += 1;
            comment.dislikes -= 1;
          } else {
            comment.dislikes += 1;
            comment.likes -= 1;
          }

          comment.expressions = [expression, ...comment.expressions];
        }
      }

      console.log(comment.expressions);

      setComments((prev) => ({ ...prev, data: newComments }));
    };

    try {
      setExpStatus({ loading: commentId });

      await userForumCreateExpression({
        expression: expression.expression,
        commentId: expression.commentId,
      });

      UIHandler();
    } catch (error) {
      setExpStatus({ error });
    } finally {
      setExpStatus({ loading: false });
    }
  };

  const handleEditReply = (commentId, reply) => {
    handleUpdateUI(() => {
      const newComments = [...comments.data];
      const comment = newComments.find((c) => c.id === commentId);
      const replyIndex = comment?.replies.findIndex((r) => r.id === reply.id);
      comment?.replies.splice(replyIndex, 1, reply);

      setComments((prev) => ({ ...prev, data: newComments }));
    });
  };

  const handleDeleteComment = async (commentId) => {
    const UIHandler = () => {
      const newComments = [...comments.data];
      const comment = newComments.find((c) => c.id === commentId);
      comment.active = false;

      setComments((prev) => ({ ...prev, data: newComments }));
    };

    try {
      setDeleteStatus({ loading: commentId });
      await userForumDeleteComment(commentId);
      handleUpdateUI(UIHandler);

      setDeleteStatus({ success: true });
    } catch (error) {
      setDeleteStatus({ error });
    } finally {
      setDeleteStatus({ loading: false });
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const UIHandler = () => {
      const newComments = [...comments.data];
      const comment = newComments.find((c) => c.id === commentId);

      if (comment?.replies)
        comment.replies = comment.replies.filter((r) => r.id !== replyId);

      setComments((prev) => ({ ...prev, data: newComments }));
    };

    try {
      setDeleteStatus({ loading: replyId });
      await userForumDeleteComment(replyId);
      handleUpdateUI(UIHandler);
      setDeleteStatus({ success: true });
    } catch (error) {
      setDeleteStatus({ error });
    } finally {
      setDeleteStatus({ loading: false });
    }
  };

  // Handle fetch category
  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return {
    comments,
    questions,
    handleFetch,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    handleAddReply,
    handleDeleteReply,
    handleEditReply,
    handleCommentExpression,
    deleteStatusIsLoading: deleteStatus.loading,
    expStatusIsLoading: expStatus.loading,
  };
};

export default useComments;
