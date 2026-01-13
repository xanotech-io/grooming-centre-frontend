import { ongoingDates } from "../course/responses";

export const adminGetExaminationListingRes_courseId_1 = {
  data: [],
  // {
  //   id: "examinationId_1",
  //   title: "NodeJs examination",
  //   duration: 60,
  //   amountOfQuestions: 20,
  //   startTime: "2021-10-18T09:50:00.319Z",
  //   courseId: "courseId_1",
  //   active: true,
  //   examinationQuestions: [
  //     {
  //       id: "questionId_1",
  //       question: `{"blocks":[{"key":"bd4p2","text":"When to Stye A div","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":12,"length":5,"style":"UNDERLINE"},{"offset":12,"length":5,"style":"BOLD"},{"offset":12,"length":5,"style":"ITALIC"}],"entityRanges":[],"data":{}}],"entityMap":{}}`,
  //       options: [
  //         {
  //           id: "optionId_1",
  //           name: "me",
  //           optionIndex: "1",
  //           isAnswer: true,
  //         },
  //         {
  //           id: "optionId_2",
  //           name: "you",
  //           optionIndex: "2",
  //         },
  //         {
  //           id: "optionId_3",
  //           name: "them",
  //           optionIndex: "3",
  //         },
  //         {
  //           id: "optionId_4",
  //           name: "we",
  //           optionIndex: "4",
  //         },
  //       ],
  //     },
  //   ],
  // },
};

export const adminGetExaminationListingRes_courseId_3 = {
  data: {
    id: "examinationId_2",
    title: "ReactJs examination",
    startTime: ongoingDates.startTime,
    duration: 10.2,
    // examinationScoreSheets: [{}],
    amountOfQuestions: 2,
    courseId: "courseId_3",
    examinationQuestions: [
      {
        id: "questionId_1",
        question: `{"blocks":[{"key":"bd4p2","text":"How to Stye A div","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":12,"length":5,"style":"UNDERLINE"},{"offset":12,"length":5,"style":"BOLD"},{"offset":12,"length":5,"style":"ITALIC"}],"entityRanges":[],"data":{}}],"entityMap":{}}`,

        options: [
          {
            id: "optionId_1",
            name: "me",
            optionIndex: "1",
          },
          {
            id: "optionId_2",
            name: "you",
            optionIndex: "2",
            isAnswer: true,
          },
          {
            id: "optionId_3",
            name: "them",
            optionIndex: "3",
          },
          {
            id: "optionId_4",
            name: "we",
            optionIndex: "4",
          },
        ],
      },
      {
        id: "questionId_2",
        question: `{"blocks":[{"key":"bd4p2","text":"How to Stye A division","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":12,"length":5,"style":"UNDERLINE"},{"offset":12,"length":5,"style":"BOLD"},{"offset":12,"length":5,"style":"ITALIC"}],"entityRanges":[],"data":{}}],"entityMap":{}}`,

        options: [
          {
            id: "optionId_1",
            name: "me",
            optionIndex: "1",
          },
          {
            id: "optionId_2",
            name: "you",
            optionIndex: "2",
          },
          {
            id: "optionId_3",
            name: "them",
            optionIndex: "3",
          },
          {
            id: "optionId_4",
            name: "we",
            optionIndex: "4",
            isAnswer: true,
          },
        ],
      },
    ],
  },
};

export const submitExaminationRes = {
  message: "submit successful",
};

export const adminCreateExaminationQuestionRes = {
  message: "examination question created successfully",
};

export const adminCreateExaminationRes = {
  message: "Examination created successfully",
  data: {
    id: "examinationId_1",
  },
};

export const adminEditExaminationRes_examinationId_1 = {
  message: "Examination updated successfully",
  data: [
    {
      id: "examinationId_1",
    },
  ],
};

export const adminEditExaminationRes_examinationId_2 = {
  message: "Examination updated successfully",
  data: [
    {
      id: "examinationId_2",
    },
  ],
};
