import { useApp } from '../contexts';

export const useIsSuperAdmin = () => {
  const {
    state: { user },
    getOneMetadata,
  } = useApp();

  const roleName = getOneMetadata('userRoles', user?.userRoleId)?.name;

  return /super admin/i.test(roleName ?? '');
};
