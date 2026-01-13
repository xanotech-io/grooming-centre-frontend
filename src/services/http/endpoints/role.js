import { http } from "../..";

/**
 * Endpoint to get `role-listing`
 *
 * @returns {Promise<{ data: roleListArray }>}
 */
export const adminGetRoleListing = async () => {
  const path = `/admin/roles`;

  const {
    data: { data },
  } = await http.get(path);

   const roles = data.userRoles.map((role) => ({
     id: role.id,
     name: role.name,
     noOfUsers: role.noOfUsers,
   }));

   return { roles };
};
