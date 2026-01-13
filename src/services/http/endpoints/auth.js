import { http } from "../http";

/**
 * Endpoint to request for the current loggedIn user - (auth)
 *
 * @returns {Promise<{ data: User }>}
 */
export const requestMyData = async () => {
  const path = "/me";

  const {
    data: { data },
  } = await http.get(path);

  return { data };
};


/**
 * Endpoint for user to update his information - (auth)
 * @param {{ password: string, firstName: string, lastName: string, email: string, phone: string}} body
 * @returns {Promise<{  message: string }>}
 */
export const requestUpdateDetails = async (body) => {
  const path = "/user/edit-details";

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};
export const updatePassword = async (body) => {
  const path = "/password/create/new";

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};
/**
 * Endpoint for user to create new password - (auth)
 * @param {{ password: string }} body
 * @returns {Promise<{  message: string }>}
 */
export const userCreateNewPassword = async (body) => {
  const path = "/password/create/new";

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

/**
 * Endpoint to request a reset password - (auth)
 * @param {{ email: string }} body
 * @returns {Promise<{ message: string }>}
 */
export const userForgetPassword = async (body) => {
  const path = "/forgot/password";

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

/**
 * Endpoint to actually reset password - (auth)
 * @param {{ password: string }} body
 * @returns {Promise<{ message: string }>}
 */
export const userResetPassword = async (body, token) => {
  const path = "/password/reset";

  const {
    data: { message },
  } = await http.patch(path, body, {token});

  return { message };
};

/**
 * Endpoint for user signin - (auth)
 * @param {{email: string, password: string}} body
 * @returns {Promise<{ user: `Object`, token: `string`, message: string }>}
 */
export const requestSignin = async (body) => {
  const path = "/login";

  const {
    data: {
      data: { user, token },
      message,
    },
  } = await http.post(path, body);

  return { user, token, message };
};
