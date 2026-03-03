import { requestMyDataRes } from "../../auth/me_response";

export const userForumGetUsernamesRes = {
  data: [
    {
      id: "forumUsernameId_1",
      name: "ski_mask",
      profilePics:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
    },
    {
      id: "forumUsernameId_2",
      name: "juice_wrld",
      profilePics:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
    },
    {
      id: "forumUsernameId_3",
      name: "loop_king",
      profilePics:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
    },
  ],
};

export const userForumGetMentionsRes = {
  data: {
    questions: [
      {
        sortId: 1,
        id: "questionId_1",
        title: "File uploadrgo",
        question:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
        active: true,
        createdAt: "2021-10-29T23:37:54.484Z",
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
        commentCount: 10,
      },
      {
        sortId: 1,
        id: "questionId_2",
        title: "File uploadrgo",
        question: "How to upload files to cloudinary",
        active: true,
        createdAt: new Date(),
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
        commentCount: 10,
      },
    ],
    comments: [
      {
        sortId: 2,
        id: "commentId_1",
        active: true,
        questionId: "questionId_1",
        comment:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
        createdAt: "2021-10-19T23:37:54.484Z",
        expressions: [
          {
            id: "expId_1",
            expression: "like",
            userId: requestMyDataRes.data.id,
          },
          {
            id: "expId_2",
            expression: "dislike",
            userId: "userId_2",
          },
          {
            id: "expId_3",
            expression: "dislike",
            userId: "userId_3",
          },
        ],
        user: {
          id: "userId_2",
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: "jane",
          lastName: "bar",
        },
      },
      {
        sortId: 0,
        id: "commentId_2",
        active: true,
        questionId: "questionId_1",
        comment: "Netus nisl nulla placerat dignissim ipsum arcu.",
        createdAt: new Date(),
        expressions: [],
        user: {
          id: requestMyDataRes.data.id,
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: requestMyDataRes.data.firstName,
          lastName: requestMyDataRes.data.lastName,
        },
      },
      {
        id: "replyId_2",
        active: true,
        comment: "I hate tomatoes",
        commentId: "commentId_2",
        questionId: "questionId_1",
        createdAt: "2022-10-19T23:37:54.484Z",
        user: {
          id: requestMyDataRes.data.id,
          profilePics:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
          firstName: requestMyDataRes.data.firstName,
          lastName: requestMyDataRes.data.lastName,
        },
        expressions: [],
        replies: [],
      },
    ],
  },
};
