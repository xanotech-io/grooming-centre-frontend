import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Textarea,
  Button,
  Badge,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FiMessageSquare, FiCheck, FiCornerUpLeft, FiTrash2 } from "react-icons/fi";
import {
  getComments,
  addComment,
  addReply,
  resolveComment,
  deleteComment,
  findOverlappingComment,
} from "../../services";

/**
 * Selects the character range of the current DOM selection relative to `containerEl`'s
 * full text content — works across the segment <span>s rendered inside it because
 * Range#toString() concatenates text nodes regardless of element boundaries.
 */
const getSelectionOffsetsWithinContainer = (containerEl) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  if (
    !containerEl.contains(range.startContainer) ||
    !containerEl.contains(range.endContainer)
  ) {
    return null;
  }

  const preRange = document.createRange();
  preRange.selectNodeContents(containerEl);
  preRange.setEnd(range.startContainer, range.startOffset);
  const startIndex = preRange.toString().length;
  const anchorText = range.toString();
  if (!anchorText.trim()) return null;

  return { startIndex, endIndex: startIndex + anchorText.length, anchorText, rect: range.getBoundingClientRect() };
};

const fmtTime = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
};

const HighlightedText = ({ text, anchoredComments, activeId, onSelectComment }) => {
  const segments = useMemo(() => {
    const sorted = [...anchoredComments].sort((a, b) => a.anchor.startIndex - b.anchor.startIndex);
    const parts = [];
    let cursor = 0;
    sorted.forEach((c) => {
      const { startIndex, endIndex } = c.anchor;
      if (startIndex > cursor) parts.push({ plain: text.slice(cursor, startIndex) });
      parts.push({ commentId: c.id, resolved: c.resolved, plain: text.slice(startIndex, endIndex) });
      cursor = Math.max(cursor, endIndex);
    });
    if (cursor < text.length) parts.push({ plain: text.slice(cursor) });
    return parts;
  }, [text, anchoredComments]);

  return (
    <Text as="div" fontSize="14px" whiteSpace="pre-wrap" lineHeight="1.7" color="#1A202C">
      {segments.map((seg, i) =>
        seg.commentId ? (
          <Box
            as="mark"
            key={i}
            id={`comment-anchor-${seg.commentId}`}
            bg={activeId === seg.commentId ? "yellow.300" : seg.resolved ? "gray.200" : "yellow.100"}
            borderBottom="2px solid"
            borderColor={seg.resolved ? "gray.400" : "yellow.500"}
            cursor="pointer"
            onClick={() => onSelectComment(seg.commentId)}
          >
            {seg.plain}
          </Box>
        ) : (
          <Box as="span" key={i}>
            {seg.plain}
          </Box>
        ),
      )}
    </Text>
  );
};

const CommentThread = ({ comment, viewer, onReply, onResolve, onDelete, isActive }) => {
  const [replyText, setReplyText] = useState("");

  return (
    <Box
      id={`comment-thread-${comment.id}`}
      p={3}
      borderRadius="8px"
      border="1px solid"
      borderColor={isActive ? "yellow.400" : "#E2E8F0"}
      bg={isActive ? "yellow.50" : "white"}
      mb={2}
    >
      <Flex justify="space-between" align="flex-start" mb={1} gap={2}>
        <Box>
          {comment.anchor ? (
            <Text fontSize="11px" color="gray.500" fontStyle="italic" mb={1} noOfLines={2}>
              &ldquo;{comment.anchor.anchorText}&rdquo;
            </Text>
          ) : (
            <Badge colorScheme="purple" fontSize="9px" mb={1}>
              General comment
            </Badge>
          )}
          <Text fontSize="13px" fontWeight="600">
            {comment.authorName}{" "}
            <Text as="span" fontWeight="400" color="gray.400">
              · {fmtTime(comment.createdAt)}
            </Text>
          </Text>
        </Box>
        <Flex gap={1} flexShrink={0}>
          {comment.authorId === viewer.id && (
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Delete comment"
              icon={<FiTrash2 />}
              onClick={() => onDelete(comment.id)}
            />
          )}
          <IconButton
            size="xs"
            variant="ghost"
            colorScheme={comment.resolved ? "green" : "gray"}
            aria-label={comment.resolved ? "Re-open" : "Mark resolved"}
            icon={<FiCheck />}
            onClick={() => onResolve(comment.id, !comment.resolved)}
          />
        </Flex>
      </Flex>

      <Text fontSize="14px" mb={2} whiteSpace="pre-wrap">
        {comment.body}
      </Text>

      {comment.replies.length > 0 && (
        <Box borderLeft="2px solid #E2E8F0" pl={3} mb={2}>
          {comment.replies.map((r) => (
            <Box key={r.id} mb={2}>
              <Text fontSize="12px" fontWeight="600">
                {r.authorName}{" "}
                <Text as="span" fontWeight="400" color="gray.400">
                  · {fmtTime(r.createdAt)}
                </Text>
              </Text>
              <Text fontSize="13px">{r.body}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Flex gap={2}>
        <Textarea
          size="sm"
          rows={1}
          placeholder="Reply…"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <IconButton
          size="sm"
          aria-label="Send reply"
          icon={<FiCornerUpLeft />}
          isDisabled={!replyText.trim()}
          onClick={() => {
            onReply(comment.id, replyText.trim());
            setReplyText("");
          }}
        />
      </Flex>
    </Box>
  );
};

/**
 * Read-only-context summary of every comment on a submission, grouped by question —
 * for surfaces (like a student's result page) that don't render each question's answer
 * text and so can't anchor into a specific AnnotatableText instance per question. Each
 * comment already carries its own quoted anchor snippet, so no answer text is needed here.
 */
export const SubmissionCommentsSummary = ({ submissionId, viewerId, viewerName, viewerRole }) => {
  const [comments, setComments] = useState([]);

  const refresh = () => setComments(getComments(submissionId));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const groups = useMemo(() => {
    const byLabel = new Map();
    comments.forEach((c) => {
      const label = c.questionLabel || "General";
      if (!byLabel.has(label)) byLabel.set(label, []);
      byLabel.get(label).push(c);
    });
    return Array.from(byLabel.entries());
  }, [comments]);

  if (comments.length === 0) return null;

  const handleReply = (commentId, body) => {
    addReply(submissionId, commentId, { body, authorId: viewerId, authorName: viewerName, authorRole: viewerRole });
    refresh();
  };
  const handleResolve = (commentId, resolved) => {
    resolveComment(submissionId, commentId, resolved);
    refresh();
  };
  const handleDelete = (commentId) => {
    deleteComment(submissionId, commentId);
    refresh();
  };

  return (
    <Box bg="white" border="1px solid #E2E8F0" borderRadius="12px" p={5} mb={5}>
      <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={3}>
        Comments
      </Text>
      {groups.map(([label, groupComments]) => (
        <Box key={label} mb={4}>
          <Badge colorScheme="purple" fontSize="10px" mb={2}>
            {label}
          </Badge>
          {groupComments.map((c) => (
            <CommentThread
              key={c.id}
              comment={c}
              viewer={{ id: viewerId, name: viewerName }}
              isActive={false}
              onReply={handleReply}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

/**
 * Renders a plain-text student answer with Google-Docs-style highlight commenting,
 * plus a thread list and a composer for general (unanchored) comments.
 *
 * Pass `text={null}` for submission types with no inline text to annotate (e.g. project
 * file uploads) — only the general-comment thread renders in that case.
 */
export const AnnotatableText = ({
  submissionId,
  questionId = null,
  questionLabel = null,
  text = null,
  viewerId,
  viewerName,
  viewerRole,
}) => {
  const toast = useToast();
  const containerRef = useRef(null);
  const viewer = { id: viewerId, name: viewerName };

  const [comments, setComments] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);
  const [pendingBody, setPendingBody] = useState("");
  const [generalBody, setGeneralBody] = useState("");

  const refresh = () => {
    const all = getComments(submissionId).filter((c) => c.questionId === questionId);
    setComments(all);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, questionId]);

  const anchoredComments = comments.filter((c) => c.anchor);
  const generalComments = comments.filter((c) => !c.anchor);

  const handleMouseUp = () => {
    if (!containerRef.current || !text) return;
    const result = getSelectionOffsetsWithinContainer(containerRef.current);
    if (!result) {
      setPendingSelection(null);
      return;
    }
    const overlap = findOverlappingComment(submissionId, questionId, result.startIndex, result.endIndex);
    if (overlap) {
      toast({
        description: "That range overlaps an existing comment — resolve or edit it instead.",
        status: "warning",
        duration: 3000,
      });
      window.getSelection()?.removeAllRanges();
      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    setPendingSelection({
      ...result,
      top: result.rect.top - containerRect.top - 40,
      left: Math.max(0, result.rect.left - containerRect.left),
    });
  };

  const saveAnchoredComment = () => {
    if (!pendingSelection || !pendingBody.trim()) return;
    addComment({
      submissionId,
      questionId,
      questionLabel,
      anchor: {
        startIndex: pendingSelection.startIndex,
        endIndex: pendingSelection.endIndex,
        anchorText: pendingSelection.anchorText,
      },
      body: pendingBody.trim(),
      authorId: viewerId,
      authorName: viewerName,
      authorRole: viewerRole,
    });
    setPendingSelection(null);
    setPendingBody("");
    window.getSelection()?.removeAllRanges();
    refresh();
  };

  const saveGeneralComment = () => {
    if (!generalBody.trim()) return;
    addComment({
      submissionId,
      questionId,
      questionLabel,
      anchor: null,
      body: generalBody.trim(),
      authorId: viewerId,
      authorName: viewerName,
      authorRole: viewerRole,
    });
    setGeneralBody("");
    refresh();
  };

  const handleReply = (commentId, body) => {
    addReply(submissionId, commentId, {
      body,
      authorId: viewerId,
      authorName: viewerName,
      authorRole: viewerRole,
    });
    refresh();
  };

  const handleResolve = (commentId, resolved) => {
    resolveComment(submissionId, commentId, resolved);
    refresh();
  };

  const handleDelete = (commentId) => {
    deleteComment(submissionId, commentId);
    refresh();
  };

  const selectComment = (commentId) => {
    setActiveId(commentId);
    document
      .getElementById(`comment-thread-${commentId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <Box>
      {text && (
        <Box position="relative" mb={4}>
          <Box ref={containerRef} onMouseUp={handleMouseUp}>
            <HighlightedText
              text={text}
              anchoredComments={anchoredComments}
              activeId={activeId}
              onSelectComment={selectComment}
            />
          </Box>

          {pendingSelection && (
            <Box
              position="absolute"
              top={`${Math.max(0, pendingSelection.top)}px`}
              left={`${pendingSelection.left}px`}
              zIndex={2}
              bg="white"
              boxShadow="md"
              borderRadius="8px"
              border="1px solid #E2E8F0"
              p={2}
              w="260px"
            >
              <Text fontSize="11px" color="gray.500" mb={1} noOfLines={1}>
                On: &ldquo;{pendingSelection.anchorText}&rdquo;
              </Text>
              <Textarea
                size="sm"
                rows={2}
                autoFocus
                placeholder="Add a comment…"
                value={pendingBody}
                onChange={(e) => setPendingBody(e.target.value)}
              />
              <Flex gap={2} mt={2} justify="flex-end">
                <Button size="xs" variant="ghost" onClick={() => setPendingSelection(null)}>
                  Cancel
                </Button>
                <Button size="xs" colorScheme="blue" onClick={saveAnchoredComment} isDisabled={!pendingBody.trim()}>
                  Comment
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      )}

      {(anchoredComments.length > 0 || generalComments.length > 0) && (
        <Box mb={3}>
          <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" mb={2}>
            <FiMessageSquare style={{ display: "inline", marginRight: 4 }} />
            Comments ({comments.length})
          </Text>
          {comments.map((c) => (
            <CommentThread
              key={c.id}
              comment={c}
              viewer={viewer}
              isActive={activeId === c.id}
              onReply={handleReply}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}

      <Flex gap={2}>
        <Textarea
          size="sm"
          rows={2}
          placeholder={text ? "Add a general comment for this answer…" : "Add a comment…"}
          value={generalBody}
          onChange={(e) => setGeneralBody(e.target.value)}
        />
        <Button size="sm" onClick={saveGeneralComment} isDisabled={!generalBody.trim()}>
          Comment
        </Button>
      </Flex>
    </Box>
  );
};
