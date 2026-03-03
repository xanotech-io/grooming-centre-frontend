import {
  endedDates,
  ongoingDates,
  // upcomingDates
} from "../course/responses";

export const adminCreateLessonRes = {
  message: "lesson created successfully",
  data: {
    id: "lessonId_1",
  },
};
export const adminEditLessonRes_lessonId_1 = {
  message: "lesson updated successfully",
  data: [
    {
      id: "lessonId_1",
    },
  ],
};
export const adminEditLessonRes_lessonId_2 = {
  message: "lesson updated successfully",
  data: [
    {
      id: "lessonId_2",
    },
  ],
};

export const adminGetLessonListingRes_courseId_1 = {
  data: {
    rows: [
      {
        id: "lessonId_1",
        courseId: "courseId_1",
        title: "Introduction to GO",
        startTime: "2021-010-21 02:25 PM",
        active: true,
      },
    ],
  },
};

export const adminGetLessonListingRes_courseId_3 = {
  data: {
    rows: [
      {
        id: "lessonId_2",
        courseId: "courseId_3",
        title: "Advance GO",
        startTime: "2021-010-21 02:25 PM",
        active: false,
      },
    ],
  },
};

export const requestLessonDetailsRes_lessonId_1 = {
  data: {
    ...ongoingDates,
    id: "lessonId_1",
    title: "Introduction to CSS (Upcoming) pDf",
    content: `{"blocks":[{"key":"6jj41","text":"Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum! Provident similique accusantium nemo autem. Veritatisobcaecati tenetur iure eius earum ut molestias architecto voluptate aliquamnihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit,tenetur error, harum nesciunt ipsum debitis quas aliquid. Reprehenderit,quia. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"c7ok","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8o62p","text":"Quo neque error repudiandae fuga?","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"45uqb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"se8c","text":" Ipsa laudantium molestias eos sapiente officiis modi at sunt excepturi expedita sint? ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1r6cp","text":"Sed quibusdamrecusandae alias error harum maxime adipisci amet laborum. Perspiciatis minima nesciunt dolorem! Officiis iure rerum voluptates a cumque velit quibusdam sed amet tempora. Sit laborum ab, eius fugit doloribus tenetur fugiat, temporibus enim commodi iusto libero magni deleniti quod quam consequuntur! Commodi minima excepturi repudiandae velit hic maximedoloremque. ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"32pp4","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"491gt","text":"Quaerat provident commodi consectetu","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"edshb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"egmhh","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8gdtb","text":"ipsum saepe, voluptas, hic voluptates pariatur est explicabo fugiat, dolorum eligendi quam cupiditate excepturi mollitia maiores labore suscipit quas? Nulla, placeat. Voluptatem quaerat non architecto ab laudantiummodi minima sunt esse temporibus sint culpa, recusandae aliquam numquam totam ratione voluptas quod exercitationem fuga. Possimus quis earum veniam quasi aliquam eligendi, placeat qui corporis!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
    file: "http://africau.edu/images/default/sample.pdf",
    startTime: "2021-10-21T12:25:00.000Z",
    endTime: "2021-12-21T12:25:00.000Z",
    courseId: "courseId_1",
    active: true,
    lessonTypeId: "lessonTypeId_2",
    lessonType: {
      id: "lessonTypeId_2",
      name: "video",
    },
    // lessonTracking: [{ isCompleted: true }],
  },
};

export const requestLessonDetailsRes_lessonId_2 = {
  data: {
    // ...ongoingDates,
    id: "lessonId_2",
    // title: "Introduction to HTML (Ongoing)",
    // content: `{"blocks":[{"key":"6jj41","text":"Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum! Provident similique accusantium nemo autem. Veritatisobcaecati tenetur iure eius earum ut molestias architecto voluptate aliquamnihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit,tenetur error, harum nesciunt ipsum debitis quas aliquid. Reprehenderit,quia. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"c7ok","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8o62p","text":"Quo neque error repudiandae fuga?","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"45uqb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"se8c","text":" Ipsa laudantium molestias eos sapiente officiis modi at sunt excepturi expedita sint? ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1r6cp","text":"Sed quibusdamrecusandae alias error harum maxime adipisci amet laborum. Perspiciatis minima nesciunt dolorem! Officiis iure rerum voluptates a cumque velit quibusdam sed amet tempora. Sit laborum ab, eius fugit doloribus tenetur fugiat, temporibus enim commodi iusto libero magni deleniti quod quam consequuntur! Commodi minima excepturi repudiandae velit hic maximedoloremque. ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"32pp4","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"491gt","text":"Quaerat provident commodi consectetu","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"edshb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"egmhh","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8gdtb","text":"ipsum saepe, voluptas, hic voluptates pariatur est explicabo fugiat, dolorum eligendi quam cupiditate excepturi mollitia maiores labore suscipit quas? Nulla, placeat. Voluptatem quaerat non architecto ab laudantiummodi minima sunt esse temporibus sint culpa, recusandae aliquam numquam totam ratione voluptas quod exercitationem fuga. Possimus quis earum veniam quasi aliquam eligendi, placeat qui corporis!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
    // file: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4 ",
    // // startTime: "2021-10-21T12:25:00.000Z",
    // // endTime: "2021-12-21T12:25:00.000Z",
    // courseId: "courseId_2",
    // // active: false,
    // lessonTypeId: "lessonTypeId_1",
    // lessonType: {
    //   id: "lessonTypeId_1",
    //   name: "pdf",
    // },
    lessonTracking: [],
    // id: "6970a272-6b4c-4318-832e-3d382dd4f865",
    title: "sdsd",
    content:
      '{"blocks":[{"key":"8b7ir","text":"dsdsd","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
    file: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4",
    filePublicId:
      "grooming-centre/HTML-clash-clans/0001. TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33",
    startTime: "2021-11-22T11:37:53.297Z",
    endTime: "2021-11-22T12:37:53.330Z",
    active: true,
    createdAt: "2021-11-22T11:39:49.105Z",
    updatedAt: "2021-11-22T11:39:49.105Z",
    courseId: "fada709b-3397-4394-aca2-a75740a3f8d7",
    lessonTypeId: "5fbad180-0a64-4f7f-bfaa-b4cc4b53a67e",
    lessonType: { id: "5fbad180-0a64-4f7f-bfaa-b4cc4b53a67e", name: "video" },
  },
};

export const requestLessonDetailsRes_lessonId_3 = {
  data: {
    ...endedDates,
    id: "lessonId_3",
    title: "Introduction to GO (Ended)",
    content: `{"blocks":[{"key":"6jj41","text":"Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum! Provident similique accusantium nemo autem. Veritatisobcaecati tenetur iure eius earum ut molestias architecto voluptate aliquamnihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit,tenetur error, harum nesciunt ipsum debitis quas aliquid. Reprehenderit,quia. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"c7ok","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8o62p","text":"Quo neque error repudiandae fuga?","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"45uqb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"se8c","text":" Ipsa laudantium molestias eos sapiente officiis modi at sunt excepturi expedita sint? ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1r6cp","text":"Sed quibusdamrecusandae alias error harum maxime adipisci amet laborum. Perspiciatis minima nesciunt dolorem! Officiis iure rerum voluptates a cumque velit quibusdam sed amet tempora. Sit laborum ab, eius fugit doloribus tenetur fugiat, temporibus enim commodi iusto libero magni deleniti quod quam consequuntur! Commodi minima excepturi repudiandae velit hic maximedoloremque. ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"32pp4","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"491gt","text":"Quaerat provident commodi consectetu","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"edshb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"egmhh","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8gdtb","text":"ipsum saepe, voluptas, hic voluptates pariatur est explicabo fugiat, dolorum eligendi quam cupiditate excepturi mollitia maiores labore suscipit quas? Nulla, placeat. Voluptatem quaerat non architecto ab laudantiummodi minima sunt esse temporibus sint culpa, recusandae aliquam numquam totam ratione voluptas quod exercitationem fuga. Possimus quis earum veniam quasi aliquam eligendi, placeat qui corporis!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
    file: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4 ",
    startTime: "2021-010-18 04:25 PM",
    endTime: "2021-12-21T12:25:00.000Z",
    courseId: "courseId_3",
    active: true,
    lessonTypeId: "b4de5c1c-fa91-4572-b05c-a7eaab62a8cd",
    lessonType: {
      id: "b4de5c1c-fa91-4572-b05c-a7eaab62a8cd",
      name: "video",
    },
    lessonTracking: [],
  },
};

export const requestLessonDetailsRes_lessonId_4 = {
  data: {
    ...endedDates,
    id: "lessonId_4",
    title: "Ended lesson (Due to has completed)",
    content: `{"blocks":[{"key":"6jj41","text":"Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum! Provident similique accusantium nemo autem. Veritatisobcaecati tenetur iure eius earum ut molestias architecto voluptate aliquamnihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit,tenetur error, harum nesciunt ipsum debitis quas aliquid. Reprehenderit,quia. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"c7ok","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8o62p","text":"Quo neque error repudiandae fuga?","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"45uqb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"se8c","text":" Ipsa laudantium molestias eos sapiente officiis modi at sunt excepturi expedita sint? ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1r6cp","text":"Sed quibusdamrecusandae alias error harum maxime adipisci amet laborum. Perspiciatis minima nesciunt dolorem! Officiis iure rerum voluptates a cumque velit quibusdam sed amet tempora. Sit laborum ab, eius fugit doloribus tenetur fugiat, temporibus enim commodi iusto libero magni deleniti quod quam consequuntur! Commodi minima excepturi repudiandae velit hic maximedoloremque. ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"32pp4","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"491gt","text":"Quaerat provident commodi consectetu","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"edshb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"egmhh","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8gdtb","text":"ipsum saepe, voluptas, hic voluptates pariatur est explicabo fugiat, dolorum eligendi quam cupiditate excepturi mollitia maiores labore suscipit quas? Nulla, placeat. Voluptatem quaerat non architecto ab laudantiummodi minima sunt esse temporibus sint culpa, recusandae aliquam numquam totam ratione voluptas quod exercitationem fuga. Possimus quis earum veniam quasi aliquam eligendi, placeat qui corporis!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
    file: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4 ",
    startTime: "2021-010-18 04:25 PM",
    endTime: "2021-12-21T12:25:00.000Z",
    courseId: "courseId_3",
    active: true,
    lessonTypeId: "b4de5c1c-fa91-4572-b05c-a7eaab62a8cd",
    lessonType: {
      id: "b4de5c1c-fa91-4572-b05c-a7eaab62a8cd",
      name: "video",
    },
    lessonTracking: [{ isCompleted: true }],
  },
};

export const requestLessonDetailsRes_lessonId_5 = {
  data: {
    ...endedDates,
    id: "lessonId_5",
    title: "Ongoing lesson (But has completed)",
    content: `{"blocks":[{"key":"6jj41","text":"Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum! Provident similique accusantium nemo autem. Veritatisobcaecati tenetur iure eius earum ut molestias architecto voluptate aliquamnihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit,tenetur error, harum nesciunt ipsum debitis quas aliquid. Reprehenderit,quia. ","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"c7ok","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8o62p","text":"Quo neque error repudiandae fuga?","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"45uqb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"se8c","text":" Ipsa laudantium molestias eos sapiente officiis modi at sunt excepturi expedita sint? ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1r6cp","text":"Sed quibusdamrecusandae alias error harum maxime adipisci amet laborum. Perspiciatis minima nesciunt dolorem! Officiis iure rerum voluptates a cumque velit quibusdam sed amet tempora. Sit laborum ab, eius fugit doloribus tenetur fugiat, temporibus enim commodi iusto libero magni deleniti quod quam consequuntur! Commodi minima excepturi repudiandae velit hic maximedoloremque. ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"32pp4","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"491gt","text":"Quaerat provident commodi consectetu","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"edshb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"egmhh","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8gdtb","text":"ipsum saepe, voluptas, hic voluptates pariatur est explicabo fugiat, dolorum eligendi quam cupiditate excepturi mollitia maiores labore suscipit quas? Nulla, placeat. Voluptatem quaerat non architecto ab laudantiummodi minima sunt esse temporibus sint culpa, recusandae aliquam numquam totam ratione voluptas quod exercitationem fuga. Possimus quis earum veniam quasi aliquam eligendi, placeat qui corporis!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
    file: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4 ",
    startTime: "2021-010-18 04:25 PM",
    endTime: "2021-12-21T12:25:00.000Z",
    courseId: "courseId_3",
    active: true,
    lessonTypeId: "b4de5c1c-fa91-4572-b05c-a7eaab62a8cd",
    lessonType: {
      id: "b4de5c1c-fa91-4572-b05c-a7eaab62a8cd",
      name: "video",
    },
    lessonTracking: [{ isCompleted: true }],
  },
};

export const requestEndLessonRes = {
  message: "lesson ended successfully",
};
