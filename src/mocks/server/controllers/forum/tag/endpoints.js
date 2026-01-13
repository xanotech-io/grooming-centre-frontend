import { rest } from "msw";
import { getUrl } from "../../../http";
import { handleSuccessResponse } from "../../helpers";
import { userForumGetTagsRes, userForumCreateTagRes } from "./responses";

const userForumGetTags = rest.get(
  getUrl("/forum/tag"),
  handleSuccessResponse(userForumGetTagsRes)
);

const userForumCreateTag = rest.post(
  getUrl("/forum/tag/create"),
  handleSuccessResponse(userForumCreateTagRes)
);

const forumTag = [userForumGetTags, userForumCreateTag];

export default forumTag;
