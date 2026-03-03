import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useApp } from "../contexts";

export const useBlockSuperAdminFromUserScreens = () => {
  const appManager = useApp();

  const { replace } = useHistory();

  useEffect(() => {
    if (appManager.state.user) {
      const role = appManager.getOneMetadata(
        "userRoles",
        appManager.state.user.userRoleId
      );

      if (/super/i.test(role?.name)) {
        return replace("/admin");
      }
    }
  }, [appManager, appManager.state.user, replace]);
};

export const useRedirectNonAuthUserToSigninPage = () => {
  const appManager = useApp();

  const { replace } = useHistory();

  useEffect(() => {
    if (!appManager.isAuthenticated) {
      replace("/auth/signin");
    }
  }, [appManager.isAuthenticated, replace]);
};

const handleRedirectUserToRoleScreen = (appManager, replace) => {
  if (appManager.state.user && appManager.state.metadata) {
    const {
      userRoleId,
      // departmentId
    } = appManager.state.user;
    const role = appManager.getOneMetadata("userRoles", userRoleId);

    console.log(
      !/admin/i.test(role?.name),
      role?.name,
      appManager.state.user,
      appManager.state
    );

    if (!/admin/i.test(role?.name) && !/instructor/i.test(role?.name)) {
      return replace("/");
    }

    // FOr normal admins to redirect to user screen
    // if (departmentId) {
    //   return replace("/");
    // }

    replace("/admin");
  }
};

export const useRedirectAuthUserToRoleScreens = (timeout = 0) => {
  useRedirectNonAuthUserToSigninPage();

  const appManager = useApp();
  const { replace } = useHistory();

  useEffect(() => {
    const handleRedirect = () => {
      handleRedirectUserToRoleScreen(appManager, replace);
    };

    const timeoutId = setTimeout(handleRedirect, timeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    appManager,
    appManager.state.user,
    appManager.isAuthenticated,
    appManager.state.metadata,
    replace,
    timeout,
  ]);
};

// export const useRedirectNewUserToNewPasswordPage = () => {
//   const appManager = useApp();
//   const { replace } = useHistory();

//   useEffect(() => {
//     if (appManager.state.user?.isInviteActive) {
//       replace("/auth/new-password");
//     }
//   }, [appManager.state.user?.isInviteActive, replace]);
// };

export const useBlockAuthenticatedUserFromPage = () =>
  // { pardonNewUser }
  {
    const { replace } = useHistory();

    const appManager = useApp();

    // pardonNewUser =
    //   pardonNewUser &&
    //   appManager.isAuthenticated &&
    //   appManager.state.user.isInviteActive;

    useEffect(() => {
      // if (pardonNewUser) {
      //   return;
      // }

      if (appManager.isAuthenticated) {
        handleRedirectUserToRoleScreen(appManager, replace);
      }
    }, [
      replace,
      appManager,
      appManager.isAuthenticated,
      appManager.state.user,
      appManager.state.metadata,
    ]);
  };
