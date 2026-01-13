import { useApp } from '../contexts';

/**
 *
 * @param {{id: string} | null} user - if `null`, `true` will be automatically returned.
 * @returns
 */
export const useLoggedInUserIsTheCreator = (user) => {
  const {
    state: { user: loggedInUser },
  } = useApp();

  const loggedInUserIsCreator = user ? loggedInUser?.id === user.id : true;

  return loggedInUserIsCreator;
};
