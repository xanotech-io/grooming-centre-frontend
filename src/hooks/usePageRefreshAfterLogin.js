import { useCallback } from 'react';
import { useEffect } from 'react';
import { useApp } from '../contexts';

/**
 * Refresh the page after first login
 * Use this hook in pages that the signin page redirects to after successful login.
 *
 * @return { '1' | null }
 */
export const usePageRefreshAfterLogin = () => {
  const appManager = useApp();

  const hasInitRefreshed = window.localStorage.getItem('refresh');

  const handler = useCallback(() => {
    if (hasInitRefreshed === null) {
      window.location.reload();
      window.localStorage.setItem('refresh', '1');
    }
  }, [hasInitRefreshed]);

  useEffect(() => {
    if (appManager.isAuthenticated) {
      handler();
    }
  }, [appManager.isAuthenticated, handler]);

  return hasInitRefreshed;
};

export const useRemoveRefresh = () => {
  const appManager = useApp();

  useEffect(() => {
    if (!appManager.isAuthenticated) {
      localStorage.removeItem('refresh');
    }
  }, [appManager.isAuthenticated]);
};
