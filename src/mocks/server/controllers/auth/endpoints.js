import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  adminInviteUserRes,
  superAdminInviteAdminRes,
  userForgetPasswordRes,
  userResetPasswordRes,
  requestUpdateDetailsRes,
  requestSigninRes,
} from "./responses";

import { requestMyDataRes } from "./me_response";

const superAdminInviteAdmin = rest.post(
  getUrl("/superadmin/invite/admin"),
  handleSuccessResponse(superAdminInviteAdminRes)
);
const adminInviteUser = rest.post(
  getUrl("/admin/invite/user"),
  handleSuccessResponse(adminInviteUserRes)
);

const requestSignin = rest.post(
  getUrl("/login"),
  handleSuccessResponse(requestSigninRes)
);

const userResetPassword = rest.patch(
  getUrl("/password/reset"),
  handleSuccessResponse(userResetPasswordRes)
);
const userForgetPassword = rest.post(
  getUrl("/forgot/password"),
  handleSuccessResponse(userForgetPasswordRes)
);

const requestUpdateDetails = rest.patch(
  getUrl("/user/edit-details"),
  handleSuccessResponse(requestUpdateDetailsRes)
);

const requestMyData = rest.get(
  getUrl("/me"), //TODO: might change
  handleSuccessResponse(requestMyDataRes)
);

export const userForgetPasswordError = rest.post(
  getUrl("/forgot/password"),
  (_req, res, ctx) => res(ctx.status(500))
);
export const requestUpdateDetailsError = rest.post(
  getUrl("/update-details"),
  (_req, res, ctx) => res(ctx.status(500))
);

const auth = [
  requestSignin,
  superAdminInviteAdmin,
  adminInviteUser,
  userResetPassword,
  userForgetPassword,
  requestUpdateDetails,
  requestMyData,
];

export default auth;
