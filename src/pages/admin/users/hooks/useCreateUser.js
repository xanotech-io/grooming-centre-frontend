import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useApp } from "../../../../contexts";

/**
 * Create User state manager
 *
 * @returns Object { formManager: `ReactHookForm`, departmentIsRequired: `boolean`, handleResetDepartmentIsRequired: () => `void` }
 */
const useCreateUser = () => {
  const formManager = useForm();
  const { getOneMetadata } = useApp();
  const [departmentIsRequired, setDepartmentIsRequired] = useState(true);
  const [status, setStatus] = useState({
    success: "",
    err: "",
  });

  useEffect(() => {
    const subscription = formManager.watch((data, { name }) => {
      if (name === "roleId") {
        const roleName = getOneMetadata("userRoles", data.roleId)?.name;

        if (roleName === "admin") {
          setDepartmentIsRequired(false);
        } else {
          setDepartmentIsRequired(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [formManager, getOneMetadata]);

  const handleResetDepartmentIsRequired = () => setDepartmentIsRequired(true);

  return {
    formManager,
    departmentIsRequired,
    handleResetDepartmentIsRequired,
    status,
    setStatus,
  };
};

export default useCreateUser;
