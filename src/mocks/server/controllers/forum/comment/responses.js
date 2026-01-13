// export const userForumReplyACommentRes = {
//   message: "comment replied successfully",
//   data: {
//     id: `${Date.now()}`,
//     comment: "I love this comment",
//     commentId: "commentId_1",
//   },
// };

import { requestMyDataRes } from "../../auth/me_response";

export const userForumAddCommentRes = {
  message: "comment added successfully",
  data: {
    id: `${Date.now()}`,
    comment: "I love this question",
    questionId: "questionId_1",
    createdAt: "2021-10-20T05:37:27.110Z",
    active: true,
    expressions: [],
    replies: [],
  },
};

export const userForumEditCommentRes_commentId_2 = {
  message: "comment updated successfully",
  data: {
    comment: "I still so much love this question",
    id: "commentId_2",
    expressions: [],
    active: true,
    createdAt: "2021-10-24T19:25:26.180Z",
    questionId: "questionId_1",
    replies: [],
  },
};
export const userForumEditCommentRes_replyId_3 = {
  message: "comment updated successfully",
  data: {
    comment: "I hate cucumbers",
    id: "replyId_3",
    expressions: [],
    active: true,
    createdAt: "2021-10-24T19:25:26.180Z",
    questionId: "questionId_1",
    replies: [],
  },
};
export const userForumEditCommentRes_replyId_2 = {
  message: "comment updated successfully",
  data: {
    comment: "I hate potatoes",
    id: "replyId_2",
    expressions: [],
    active: true,
    createdAt: "2021-10-24T19:25:26.180Z",
    questionId: "questionId_1",
    replies: [],
  },
};
export const userForumEditCommentRes_commentId_4 = {
  message: "comment updated successfully",
  data: {
    comment: "I love to code",
    id: "commentId_4",
    expressions: [],
    active: true,
    createdAt: "2021-10-24T19:25:26.180Z",
    questionId: "questionId_1",
    replies: [
      {
        id: "replyId_1",
        active: true,
        comment:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna.",
        user: {
          id: "userId_2",
          firstName: "jane",
          lastName: "bar",
        },
      },
      {
        id: "replyId_2",
        active: true,
        comment:
          "Lorem ipsum dolor Ornare rutrum amet, a nunc mi lacinia in iaculis",
        user: {
          id: "userId_2",
          firstName: "jane",
          lastName: "bar",
        },
      },
    ],
  },
};

export const userForumDeleteCommentRes = {
  message: "comment deleted successfully",
};

export const userForumCreateExpressionRes = {
  message: "comment expressed successfully",
};

export const userForumGetCommentsRes_questionId_1 = {
  data: [
    {
      id: "commentId_1",
      active: true,
      questionId: "questionId_1",
      comment:
        "Ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
      createdAt: new Date(),
      user: {
        id: "userId_2",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "jane",
        lastName: "bar",
      },
      replies: [],
      expressions: [
        {
          id: "expId_1",
          expression: "like",
          userId: requestMyDataRes.data.id,
        },
        {
          id: "expId_2",
          expression: "dislike",
          userId: "userId_223",
        },
        {
          id: "expId_3",
          expression: "dislike",
          userId: "userId_3323",
        },
      ],
    },
    {
      id: "commentId_2",
      active: true,
      questionId: "questionId_1",
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
      createdAt: new Date(),
      expressions: [
        {
          id: "expId_1",
          expression: "like",
          userId: "userId_34344",
        },
        {
          id: "expId_2",
          expression: "dislike",
          userId: "userId_23434",
        },
        {
          id: "expId_3",
          expression: "dislike",
          userId: requestMyDataRes.data.id,
        },
        {
          id: "expId_3",
          expression: "dislike",
          userId: "userId_32232323355",
        },
      ],
      user: {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
      replies: [
        {
          id: "replyId_1",
          active: true,
          comment:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna.",
          user: {
            id: "userId_2",
            firstName: "jane",
            lastName: "bar",
          },
        },
        {
          id: "replyId_2",
          active: true,
          comment:
            "Lorem ipsum dolor Ornare rutrum amet, a nunc mi lacinia in iaculis",
          user: {
            id: "userId_2",
            firstName: "jane",
            lastName: "bar",
          },
        },
      ],
    },
  ],
};

export const userForumGetCommentsRes_questionId_2 = {
  data: [],
};

export const userForumGetCommentsRes_questionId_3 = {
  data: [
    {
      id: "commentId_3",
      active: true,
      questionId: "questionId_3",
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
      createdAt: new Date(),
      expressions: [],
      user: {
        id: "userId_2",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "jane",
        lastName: "bar",
      },
      replies: [],
    },
    {
      id: "commentId_4",
      active: true,
      questionId: "questionId_3",
      comment:
        "Lorem ra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
      createdAt: new Date(),
      expressions: [],
      user: {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
      replies: [
        {
          id: "replyId_1",
          active: true,
          comment:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna.",
          user: {
            id: "userId_2",
            firstName: "jane",
            lastName: "bar",
          },
        },
      ],
    },
    {
      id: "commentId_5",
      active: false,
      questionId: "questionId_3",
      comment: "Lorem ra ut integer nibh urna.",
      createdAt: new Date(),
      expressions: [],
      user: {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
      replies: [
        {
          id: "replyId_1",
          active: true,
          comment:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna.",
          user: {
            id: "userId_2",
            firstName: "jane",
            lastName: "bar",
          },
        },
        {
          id: "replyId_2",
          active: false,
          comment: "Lorem ipsum dolor sit a.",
          user: {
            id: requestMyDataRes.data.id,
            firstName: requestMyDataRes.data.firstName,
            lastName: requestMyDataRes.data.lastName,
          },
        },
        {
          id: "replyId_3",
          active: true,
          comment: "Pharetra ut integer nibh urna.",
          user: {
            id: requestMyDataRes.data.id,
            firstName: requestMyDataRes.data.firstName,
            lastName: requestMyDataRes.data.lastName,
          },
        },
      ],
    },
  ],
};

export const userForumGetYourAnswersRes = {
  data: [
    {
      id: "commentId_3",
      active: true,
      questionId: "questionId_1",
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna. Placerat ut adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
      createdAt: new Date(),
      expressions: [
        {
          id: "expId_1",
          expression: "like",
          userId: "userId_43434",
        },
        {
          id: "expId_2",
          expression: "dislike",
          userId: "userId_22234343",
        },
        {
          id: "expId_3",
          expression: "dislike",
          userId: requestMyDataRes.data.id,
        },
        {
          id: "expId_3",
          expression: "dislike",
          userId: "userId_343421223",
        },
      ],
      user: {
        id: "userId_2",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "jane",
        lastName: "bar",
      },
      replies: [],
    },
    {
      id: "replyId_2",
      active: true,
      comment:
        "Lorem ipsum dolor Ornare rutrum amet, a nunc mi lacinia in iaculis",
      commentId: "commentId_2",
      questionId: "questionId_1",
      createdAt: new Date(),
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
    {
      id: "commentId_5",
      active: false,
      questionId: "questionId_3",
      comment: "Lorem ra ut integer nibh urna.",
      createdAt: new Date(),
      expressions: [],
      user: {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
      replies: [
        {
          id: "replyId_1",
          active: true,
          comment:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra ut integer nibh urna.",
          user: {
            id: "userId_2",
            firstName: "jane",
            lastName: "bar",
          },
        },
        {
          id: "replyId_2",
          active: false,
          comment: "Lorem ipsum dolor sit a.",
          user: {
            id: requestMyDataRes.data.id,
            firstName: requestMyDataRes.data.firstName,
            lastName: requestMyDataRes.data.lastName,
          },
        },
        {
          id: "replyId_3",
          active: true,
          comment: "Pharetra ut integer nibh urna.",
          user: {
            id: requestMyDataRes.data.id,
            firstName: requestMyDataRes.data.firstName,
            lastName: requestMyDataRes.data.lastName,
          },
        },
      ],
    },
  ],
};
