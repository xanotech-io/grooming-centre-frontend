import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  adminCreateDepartmentRes,
  adminGetDepartmentListingRes,
  adminGetDepartmentUsersListingRes_departmentId_1,
  adminGetDepartmentUsersListingRes_departmentId_2,
  adminGetDepartmentUsersListingRes_departmentId_3,
} from "./responses";

const adminGetDepartmentListing = rest.get(
  getUrl("/department/all"),
  handleSuccessResponse(adminGetDepartmentListingRes)
);

const adminCreateDepartment = rest.post(
  getUrl("/department/create"),
  handleSuccessResponse(adminCreateDepartmentRes)
);

const adminGetDepartmentUsersListing = [
  rest.get(
    getUrl("/department/users/departmentId_1"),
    handleSuccessResponse(adminGetDepartmentUsersListingRes_departmentId_1)
  ),
  rest.get(
    getUrl("/department/users/departmentId_2"),
    handleSuccessResponse(adminGetDepartmentUsersListingRes_departmentId_2)
  ),
  rest.get(
    getUrl("/department/users/departmentId_3"),
    handleSuccessResponse(adminGetDepartmentUsersListingRes_departmentId_3)
  ),
];

const department = [
  adminGetDepartmentListing,
  adminCreateDepartment,
  ...adminGetDepartmentUsersListing,
];

export default department;
