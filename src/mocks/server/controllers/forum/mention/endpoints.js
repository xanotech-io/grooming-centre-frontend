import { rest } from "msw";
import { getUrl } from "../../../http";
import { handleSuccessResponse } from "../../helpers";
import { userForumGetMentionsRes, userForumGetUsernamesRes } from "./responses";

const userForumGetUsernames = rest.get(
  // TODO: change `method`
  getUrl("/forum/usernames"), // TODO: change `path`
  handleSuccessResponse(userForumGetUsernamesRes)
);

const userForumGetMentions = rest.get(
  // TODO: change `method`
  getUrl("/forum/mentions"), // TODO: change `path`
  handleSuccessResponse(userForumGetMentionsRes)
);

const forumMentions = [userForumGetUsernames, userForumGetMentions];

export default forumMentions;
