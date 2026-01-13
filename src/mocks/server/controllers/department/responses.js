export const adminGetDepartmentListingRes = {
  message: "Departments fetched successfully",
  data: {
    rows: [
      {
        active: true,
        createdAt: "2021-09-17T12:48:01.319Z",
        id: "departmentId_1",
        name: "Accounting",
        updatedAt: "2021-09-17T12:48:01.319Z",
        noOfusers: 1,
      },
      {
        active: true,
        createdAt: "2021-09-17T12:48:01.319Z",
        id: "departmentId_2",
        name: "Software development",
        updatedAt: "2021-09-17T12:48:01.319Z",
        noOfusers: 2,
      },
      {
        active: true,
        createdAt: "2021-09-20T10:29:27.158Z",
        id: "departmentId_3",
        name: "Computer science",
        updatedAt: "2021-09-20T10:29:27.158Z",
        noOfusers: 2,
      },
    ],
  },
};

export const adminCreateDepartmentRes = {
  message: "Department created successfully",
  data: {
    id: "departmentId_1",
  },
};

export const adminGetDepartmentUsersListingRes_departmentId_1 = {
  data: {
    count: 2,
    rows: [
      {
        id: "userId_1",
        firstName: "Sonia",
        lastName: "Johnson",
        email: "thebigolayinka@gmail.com",
        userRoleId: "userRoleId_1",
        departmentId: "departmentId_1",
        userRole: {
          id: "userRoleId_1",
          name: "staff",
        },
      },
    ],
  },
};

export const adminGetDepartmentUsersListingRes_departmentId_2 = {
  data: {
    count: 2,
    rows: [
      {
        id: "userId_1",
        firstName: "Sarah",
        lastName: "Gabriel",
        email: "thebigolayinka@gmail.com",
        userRoleId: "userRoleId_2",
        departmentId: "departmentId_2",
        userRole: {
          id: "userRoleId_2",
          name: "user",
        },
      },
      {
        id: "userId_2",
        firstName: "Shalom",
        lastName: "Brain",
        email: "omolola@gmail.com",
        userRoleId: "userRoleId_2",
        departmentId: "departmentId_2",
        userRole: {
          id: "userRoleId_2",
          name: "staff",
        },
      },
    ],
  },
};

export const adminGetDepartmentUsersListingRes_departmentId_3 = {
  data: {
    count: 2,
    rows: [
      {
        id: "userId_1",
        firstName: "Yinka",
        lastName: "Joseph",
        email: "thebigolayinka@gmail.com",
        userRoleId: "userRoleId_3",
        departmentId: "departmentId_3",
        userRole: {
          id: "userRoleId_3",
          name: "user",
        },
      },
      {
        id: "userId_2",
        firstName: "omolola",
        lastName: "olaosebiikan",
        email: "omolola@gmail.com",
        userRoleId: "userRoleId_3",
        departmentId: "departmentId_3",
        userRole: {
          id: "userRoleId_3",
          name: "staff",
        },
      },
    ],
  },
};