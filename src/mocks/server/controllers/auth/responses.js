import { requestMyDataRes } from "./me_response";

export const superAdminInviteAdminRes = {
  message: "Admin invited successfully",
};

export const adminInviteUserRes = {
  message: "User invited successfully",
};

export const requestSigninRes = {
  message: "Logged in successfully",
  data: { user: requestMyDataRes.data, token: "mock_token" },
};

export const userResetPasswordRes = {
  message: "password changed",
};

export const userForgetPasswordRes = {
  message: "email sent please check your mail",
};

export const requestUpdateDetailsRes = {
  message: "details updated successfully",
};
