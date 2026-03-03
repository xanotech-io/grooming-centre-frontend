export const user = {
  data: {
    id: "userId_1",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@gmail.com",
    phone: "08012345678",
    userRole: {
      id: "userRoleId_1",
      name: "super admin",
    },
    department: {
      id: "departmentId_1",
      name: "Accounting",
    },
    gender: "male",
  },
};

export const adminGetUserListingRes = {
  data: {
    count: 102,
    rows: [
      {
        ...user.data,
        overallGrade: {
          averageGradeScore: "35",
        },
        noOfCertificate: 1,
      },
      {
        id: "userId_2",
        firstName: "Victoria",
        lastName: "Vivian :)",
        email: "admin@admin.io",
        userRole: {
          id: "userRoleId_2",
          name: "admin",
        },
        department: {
          id: "departmentId_2",
          name: "Software development",
        },
        overallGrade: {
          averageGradeScore: "85",
        },
        noOfCertificate: 2,
      },
      {
        id: "userId_3",
        firstName: "Micheal",
        lastName: "Scofield",
        email: "michealscofield@gmail.com",
        userRole: {
          id: "userRoleId_3",
          name: "user",
        },
        department: {
          id: "departmentId_3",
          name: "computer science",
        },
        overallGrade: {
          averageGradeScore: "70",
        },
        noOfCertificate: 5,
      },
    ],
  },
};

export const userGetUserListingRes = {
  data: [
    {
      id: "userId_2",
      firstName: "Victoria",
      lastName: "Vivian :)",
      email: "admin@admin.io",
    },
    {
      id: "userId_3",
      firstName: "Micheal",
      lastName: "Scofield",
      email: "michealscofield@gmail.com",
    },
    {
      id: "userId_4",
      firstName: "John",
      lastName: "Doe",
      email: "john_doe@gmial.xom",
    },
    {
      id: "userId_AS4",
      firstName: "John",
      lastName: "Doe",
      email: "john_doe@gmial.xom",
    },
    {
      id: "user23Id_4",
      firstName: "John",
      lastName: "Doe",
      email: "john_doe@gmial.xom",
    },
    {
      id: "us1erId_4",
      firstName: "John",
      lastName: "Doe",
      email: "john_doe@gmial.xom",
    },
    {
      id: "u3432serId_4",
      firstName: "John",
      lastName: "Doe",
      email: "john_doe@gmial.xom",
    },
    {
      id: "userId56_4",
      firstName: "John",
      lastName: "Doe",
      email: "john_doe@gmial.xom",
    },
  ],
};

export const userDetailsRes_userId_1 = {
  data: {
    ...user.data,
    certificate: [
      {
        id: "f3596e22-a60d-4ca8-be1c-f238445441b6",
      },
      {
        id: "f3596e22-a60d-4ca8-be1c-f23844544144",
      },
    ],

    averageGradeScore: "80",

    courseTrackingProgress: [
      {
        id: "ab501a42-4c14-44af-b394-13b63e1830fe",
      },
      {
        id: "83b96982-90d0-4e7c-b680-3b7811edb2cb",
      },
    ],
    assessmentScoreSheets: [
      {
        id: "13c2e3a0-d0fa-4d3a-a6e4-d0431feeee48",
        assessmentId: "38c95e8d-04d1-4c79-b2d9-d32261c6c702",
        courseId: "f3596e22-a60d-4ca8-be1c-f238445441b6",
        score: 25,
      },
      {
        id: "99ae9e87-39e3-49f7-9edc-3900ac9ece8d",
        assessmentId: "2abb8de8-422f-4f8e-a8dd-93de1ad895b5",
        courseId: "f3596e22-a60d-4ca8-be1c-f238445441b6",
        score: 22,
      },
    ],
    profilePics:
      "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
    isInviteActive: false,
  },
};

export const userDetailsRes_userId_2 = {
  data: {
    id: "userId_2",
    firstName: "Victoria",
    lastName: "Vivian :)",
    email: "admin@admin.io",
    userRole: { id: "userRoleId_2", name: "admin" },
    department: { id: "departmentId_2", name: "Software development" },
    gender: "female",
    certificate: [
      {
        id: "f3596e22-a60d-4ca8-be1c-f238445441b6",
      },
      {
        id: "f3596e22-a60d-4ca8-be1c-f23844544144",
      },
    ],

    averageGradeScore: "80",

    courseTrackingProgress: [
      {
        id: "ab501a42-4c14-44af-b394-13b63e1830fe",
      },
      {
        id: "83b96982-90d0-4e7c-b680-3b7811edb2cb",
      },
    ],
    assessmentScoreSheets: [
      {
        id: "13c2e3a0-d0fa-4d3a-a6e4-d0431feeee48",
        assessmentId: "38c95e8d-04d1-4c79-b2d9-d32261c6c702",
        courseId: "f3596e22-a60d-4ca8-be1c-f238445441b6",
        score: 25,
      },
      {
        id: "99ae9e87-39e3-49f7-9edc-3900ac9ece8d",
        assessmentId: "2abb8de8-422f-4f8e-a8dd-93de1ad895b5",
        courseId: "f3596e22-a60d-4ca8-be1c-f238445441b6",
        score: 22,
      },
    ],
    phone: "08012345678",
    profilePics:
      "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
    isInviteActive: false,
  },
};

export const userDetailsRes_userId_3 = {
  data: {
    id: "userId_3",
    firstName: "Micheal",
    lastName: "Scofield",
    email: "michealscofield@gmail.com",
    userRole: {
      id: "userRoleId_3",
      name: "user",
    },
    department: {
      id: "departmentId_3",
      name: "computer science",
    },
    gender: "male",
    certificate: [
      {
        id: "f3596e22-a60d-4ca8-be1c-f238445441b6",
      },
      {
        id: "f3596e22-a60d-4ca8-be1c-f23844544144",
      },
    ],

    averageGradeScore: "80",

    courseTrackingProgress: [
      {
        id: "ab501a42-4c14-44af-b394-13b63e1830fe",
      },
      {
        id: "83b96982-90d0-4e7c-b680-3b7811edb2cb",
      },
    ],
    assessmentScoreSheets: [
      {
        id: "13c2e3a0-d0fa-4d3a-a6e4-d0431feeee48",
        assessmentId: "38c95e8d-04d1-4c79-b2d9-d32261c6c702",
        courseId: "f3596e22-a60d-4ca8-be1c-f238445441b6",
        score: 25,
      },
      {
        id: "99ae9e87-39e3-49f7-9edc-3900ac9ece8d",
        assessmentId: "2abb8de8-422f-4f8e-a8dd-93de1ad895b5",
        courseId: "f3596e22-a60d-4ca8-be1c-f238445441b6",
        score: 22,
      },
    ],
    noOfCertificate: 5,
    phone: "08012345678",
    profilePics:
      "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
    isInviteActive: true,
  },
};

export const adminEditUserRes_userId_1 = {
  message: "user updated successfully",
  data: [
    {
      id: "userId_1",
    },
  ],
};

export const adminEditUserRes_userId_2 = {
  message: "user updated successfully",
  data: [
    {
      id: "userId_2",
    },
  ],
};

export const adminEditUserRes_userId_3 = {
  message: "user updated successfully",
  data: [
    {
      id: "userId_3",
    },
  ],
};

export const adminDeleteUserRes = {
  message: "user deleted successfully",
};
