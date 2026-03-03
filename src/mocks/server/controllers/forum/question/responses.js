import { requestMyDataRes } from "../../auth/me_response";

export const userForumPublishQuestionRes = {
  message: "question published successfully",
};

export const userForumEditQuestionRes = {
  message: "question updated successfully",
};

export const userForumDeleteQuestionRes = {
  message: "question deleted successfully",
};

export const userForumGetCategoriesRes = {
  data: [
    {
      id: "forumCategoryId_1",
      title: "science and technology",
    },
    {
      id: "forumCategoryId_2",
      title: "business",
    },
    {
      id: "forumCategoryId_3",
      title: "look, this is just mock please",
    },
  ],
};

export const userForumGetQuestionsRes = {
  data: {
    count: 2,
    rows: [
      {
        id: "questionId_1",
        title: "File uploadrgo",
        question: "How to upload files to cloudinary",
        active: true,
        createdAt: "2021-10-19T23:37:54.484Z",
        userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f",
        tags: [
          { id: "forumTagId_1", name: "javascript" },
          { id: "forumTagId_2", name: "dart" },
        ],
        user: {
          id: requestMyDataRes.data.id,
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: requestMyDataRes.data.firstName,
          lastName: requestMyDataRes.data.lastName,
        },
        forumComments: [{}, {}],
      },
      {
        id: "questionId_2",
        title: "File uploaders",
        question: "How to upload files to cloudinary",
        active: true,
        createdAt: "2021-10-20T05:16:51.057Z",
        userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f",
        tags: [
          { id: "forumTagId_1", name: "javascript" },
          { id: "forumTagId_2", name: "dart" },
        ],
        user: {
          id: "userId_2",
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: "jane",
          lastName: "bar",
        },
        forumComments: [{}, {}],
      },
      {
        id: "questionId_3",
        title: "CORS issues",
        question: "How to resolve ...",
        active: false,
        createdAt: "2021-10-20T05:16:51.057Z",
        userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f",
        tags: [{ id: "forumTagId_1", name: "javascript" }],
        user: {
          id: requestMyDataRes.data.id,
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: requestMyDataRes.data.firstName,
          lastName: requestMyDataRes.data.lastName,
        },
        forumComments: [{}, {}],
      },
    ],
  },
};

export const userForumGetQuestionDetailsRes_questionId_1 = {
  data: {
    categoryId: "forumCategoryId_1",
    id: "questionId_1",
    title: "File uploaders",
    question: "How to upload files to cloudinary",
    active: true,
    createdAt: "2021-10-20T05:16:51.057Z",
    user: {
      id: requestMyDataRes.data.id,
      profilePics:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
      firstName: requestMyDataRes.data.firstName,
      lastName: requestMyDataRes.data.lastName,
    },
    // TODO: propose to backend team to replace this with `forumComments`
    tags: [
      {
        id: "1546bbaf-d4fb-4be5-9b7f-477e2c06ddd4",
        title: "Computer Engineering",
      },
    ],
  },
};

export const userForumGetQuestionDetailsRes_questionId_2 = {
  data: {
    categoryId: "forumCategoryId_2",
    id: "questionId_2",
    title: "File uploaders",
    question: "How to upload files to cloudinary",
    active: true,
    createdAt: "2021-10-20T05:16:51.057Z",
    userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f", // TODO: won't take this
    // TODO: propose to the backend team
    user: {
      id: "userId_2",
      profilePics:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
      firstName: "jane",
      lastName: "bar",
    },
    tags: [
      {
        id: "8a0e19a6-011d-4db6-af31-6e9c296c20fc",
        title: "Computer Science",
      },
      {
        id: "1546bbaf-d4fb-4be5-9b7f-477e2c06ddd4",
        title: "Computer Engineering",
      },
    ],
  },
};

export const userForumGetQuestionDetailsRes_questionId_3 = {
  data: {
    categoryId: "forumCategoryId_3",
    id: "questionId_3",
    title: "CORS issues",
    question: "How to resolve ...",
    active: false,
    createdAt: "2021-10-20T05:16:51.057Z",
    userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f", // TODO: won't take this
    // TODO: propose to the backend team
    user: {
      id: requestMyDataRes.data.id,
      profilePics:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
      firstName: requestMyDataRes.data.firstName,
      lastName: requestMyDataRes.data.lastName,
    },
    tags: [
      {
        id: "8a0e19a6-011d-4db6-af31-6e9c296c20fc",
        title: "Computer Science",
      },
      {
        id: "1546bbaf-d4fb-4be5-9b7f-477e2c06ddd4",
        title: "Computer Engineering",
      },
    ],
  },
};

export const userForumGetQuestionsByTagRes = {
  data: {
    count: 2,
    rows: [
      {
        id: "questionId_1",
        title: "File uploadrgo",
        question: "How to upload files to cloudinary",
        createdAt: "2021-10-19T23:37:54.484Z",
        userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f",
        tags: [
          { id: "forumTagId_1", name: "javascript" },
          { id: "forumTagId_2", name: "dart" },
        ],
        user: {
          id: "userId_2",
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: "jane",
          lastName: "bar",
        },
        forumComments: [{}, {}],
      },
      {
        id: "questionId_2",
        title: "File uploaders",
        question: "How to upload files to cloudinary",
        createdAt: "2021-10-20T05:16:51.057Z",
        userId: "29f4ece6-a5ba-421f-ac00-6fb9d3a70e0f",
        tags: [
          { id: "forumTagId_1", name: "javascript" },
          { id: "forumTagId_2", name: "dart" },
        ],
        user: {
          id: "userId_2",
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: "jane",
          lastName: "bar",
        },
        forumComments: [{}, {}],
      },
    ],
  },
};
