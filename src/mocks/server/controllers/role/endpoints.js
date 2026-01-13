import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import { adminGetRoleListingRes } from "./responses";

const adminGetRoleListing = rest.get(
  getUrl("/admin/roles"),
  handleSuccessResponse(adminGetRoleListingRes)
);

const role = [adminGetRoleListing];

export default role;
