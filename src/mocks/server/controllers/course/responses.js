export const upcomingDates = {
  startTime: new Date(Date.now() + 60 * 60 * 1000 * 24 * 2).toISOString(),
  endTime: new Date(Date.now() + 60 * 60 * 1000 * 24 * 3).toISOString(),
};
export const ongoingDates = {
  startTime: new Date(Date.now() - 60 * 10 * 1000).toISOString(),
  endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};
export const endedDates = {
  startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() - 60 * 10 * 1000).toISOString(),
};

export const adminCourseListingRes = {
  data: [
    {
      id: "courseId_1",
      title: "The implication of financial crisis in the society",
      description: "Financial Concept",
      user: {
        firstName: "Shalom",
        lastName: "Brain",
      },
      isPublished: false,
      lesson: [
        {
          endTime: "2021-11-25T20:52:00.000Z",
          id: "lessonId_1",
          startTime: "2021-11-25T16:52:59.021Z",
          title: "Introduction to Go",
        },
        {
          endTime: "2021-11-25T20:52:00.000Z",
          id: "lessonId_2",
          startTime: "2021-11-25T18:52:59.021Z",
          title: "Introduction to Html",
        },
      ],
    },
    {
      id: "courseId_3",
      title: "The best course on automation testing",
      description: "Advanced Testing Concept",
      user: {
        firstName: "Richcode",
        lastName: "dart",
      },
      isPublished: true,
      lesson: [],
    },
  ],
};

export const adminDeleteCourseRes = {
  message: "deleted successfully",
};

export const adminUnpublishCourseRes = {
  message: "unPublished",
};

export const adminPublishCourseRes = {
  message: "Published",
};

export const adminCreateCourseRes = {
  message: "course created successfully",
  data: {
    id: "courseId_1",
  },
};

export const adminEditCourseRes_courseId_1 = {
  message: "course updated successfully",
  data: [
    {
      id: "courseId_1",
    },
  ],
};

export const adminEditCourseRes_courseId_3 = {
  message: "course updated successfully",
  data: [
    {
      id: "courseId_3",
    },
  ],
};

export const userCourseListingRes = {
  data: [
    {
      startTime: new Date(new Date().getTime()),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 20),
      id: "courseId_1",
      duration: 120,
      description: "Learn HTML and CSS for free today",
      title: "Web dev 2021",
      thumbnail:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=869&q=80",
      lessonCount: 23,
      instructor: {
        id: "instructorId_2",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "jane",
        lastName: "bar",
        title: "Senior Facility Manager",
      },
      progressPercentage: 75,
    },
    {
      startTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 22),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 30),
      id: "courseId_3",
      duration: 100,
      description: "React Design Patters",
      disabled: false,
      title: "Become A React Guru",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 24,
      instructor: {
        id: "instructorId_3",
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "Richcode",
        lastName: "dart",
        title: "Junior Developer",
      },
      progressPercentage: 1,
    },
    {
      startTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 50),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 100),
      id: "courseId_2",
      duration: 180,
      description: "Nodejs Advanced Concept",
      disabled: true,
      title: "Backend Development",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 0,
      instructor: {
        id: "instructorId_1",
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "john",
        lastName: "doe",
        title: "Team Lead",
      },
    },
  ],
};

export const adminGetUserCourseListingRes_userId_1 = {
  data: [
    {
      id: "courseId_1",
      duration: 120,
      description: "Learn HTML and CSS for free today",
      title: "Web dev 2021",
      thumbnail:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=869&q=80",
      lessonCount: 23,
      instructorId: "InstructorId_1",
      instructor: {
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "Victoria",
        lastName: "Vivian :)",
        title: "Senior Facility Manager",
      },
      progressPercentage: 75,
    },
    {
      id: "courseId_2",
      duration: 100,
      description: "React Design Patters",
      disabled: false,
      title: "Become A React Guru",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 24,
      instructorId: "InstructorId_1",
      instructor: {
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "Victoria",
        lastName: "Vivian :)",
        title: "Junior Developer",
      },
      progressPercentage: 13,
    },
    {
      id: "courseId_3",
      duration: 100,
      description: "React Design Patters",
      disabled: false,
      title: "Become A React Guru",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 24,
      instructor: {
        id: "instructorId_3",
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "Richcode",
        lastName: "dart",
        title: "Junior Developer",
      },
      progressPercentage: 1,
    },
  ],
};

export const adminGetUserCourseListingRes_userId_2 = {
  data: [
    {
      id: "courseId_1",
      duration: 120,
      description: "Learn HTML and CSS for free today",
      title: "Web dev 2021",
      thumbnail:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=869&q=80",
      lessonCount: 23,
      instructorId: "InstructorId_1",
      instructor: {
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "Shalom",
        lastName: "Brain",
        title: "Senior Facility Manager",
      },
      progressPercentage: 100,
    },
    {
      id: "courseId_2",
      duration: 100,
      description: "React Design Patters",
      disabled: false,
      title: "Become A React Guru",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 24,
      instructorId: "InstructorId_2",
      instructor: {
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "Victoria",
        lastName: "Vivian :)",
        title: "Junior Developer",
      },
      progressPercentage: 13,
    },
    {
      id: "courseId_3",
      duration: 100,
      description: "React Design Patters",
      disabled: false,
      title: "Become A React Guru",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 24,
      instructor: {
        id: "instructorId_3",
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "Richcode",
        lastName: "dart",
        title: "Junior Developer",
      },
      progressPercentage: 1,
    },
  ],
};

export const adminGetUserCourseListingRes_userId_3 = {
  data: [
    {
      id: "courseId_3",
      duration: 100,
      description: "React Design Patters",
      disabled: false,
      title: "Become A React Guru",
      thumbnail:
        "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=872&q=80",
      lessonCount: 0,
      instructorId: "InstructorId_1",
      instructor: {
        profilePics:
          "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1740&q=80",
        firstName: "Victoria",
        lastName: "Vivian :)",
        title: "Team Lead",
      },
      progressPercentage: 100,
    },
  ],
};

export const userCourseDetailsRes_courseId_1 = {
  data: {
    id: "courseId_3",
    description: "Hi, this is a test course",
    disabled: false,
    title: "Test Course",
    active: false,
    thumbnail:
      "http://res.cloudinary.com/xanotech/image/upload/v1637836170/grooming-centre/Test-Course/course-thumbnail-1.jpg",
    thumbnailPublicId: "grooming-centre/Test-Course/course-thumbnail-1",
    certificate:
      "http://res.cloudinary.com/xanotech/image/upload/v1637836171/grooming-centre/Test-Course/course-certificate-termplate.png",
    certificatePublicId:
      "grooming-centre/Test-Course/course-certificate-termplate",
    instructorId: "d941d1e7-bd76-44a1-a128-8d0bf89ab18b",
    isPublished: false,
    createdAt: "2021-11-25T10:29:32.268Z",
    updatedAt: "2021-11-25T10:29:32.268Z",
    departmentId: "2daceae4-3896-44fd-b309-e5e7fe445cea",
    user: { profilePics: null, firstName: "tobby", lastName: "Joahian" },
    lesson: [],
    courseTracking: null,
    assessment: [],
    examination: null,
  },
};

export const userCourseDetailsRes_courseId_3 = {
  data: {
    id: "courseId_3",
    duration: 1880,
    description: "Lorem",
    disabled: false,
    title: "HTML clash clans",
    active: false,
    thumbnail:
      "http://res.cloudinary.com/xanotech/image/upload/v1637300384/grooming-centre/HTML-clash-clans/course-thumbnail-2.jpg",
    thumbnailPublicId: "grooming-centre/HTML-clash-clans/course-thumbnail-2",
    certificate:
      "http://res.cloudinary.com/xanotech/image/upload/v1637315918/grooming-centre/HTML-and-CSS/1562678645018.jpg",
    certificatePublicId: "grooming-centre/HTML-and-CSS/1562678645018",
    instructorId: "d941d1e7-bd76-44a1-a128-8d0bf89ab18b",
    isPublished: true,
    createdAt: "2021-11-19T05:39:46.473Z",
    updatedAt: "2021-11-19T11:17:34.361Z",
    departmentId: "departmentId_2",
    user: { profilePics: null, firstName: "tobby", lastName: "Joahian" },
    lesson: [
      {
        ...ongoingDates,
        id: "lessonId_1",
        title: "Ongoing lesson PDF",
        content:
          '{"blocks":[{"key":"6h3a2","text":"lorem","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        createdAt: "2021-11-19T05:43:48.006Z",
        updatedAt: "2021-11-19T05:43:48.006Z",
        lessonType: {
          id: "lessonTypeId_1",
          name: "pdf",
        },
        // lessonTracking: [{ isCompleted: true }],
      },
      {
        ...endedDates,
        id: "lessonId_3",
        title: "Ended lesson",
        content:
          '{"blocks":[{"key":"cr1kt","text":"New lesssonnn","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',

        createdAt: "2021-11-19T09:20:09.328Z",
        updatedAt: "2021-11-19T09:20:09.328Z",
        lessonType: { id: "lessonTypeId_1", name: "pdf" },
        lessonTracking: [],
      },
      {
        ...ongoingDates,
        id: "lessonId_2",
        title: "Ongoing lesson",
        content:
          '{"blocks":[{"key":"d2sqe","text":"Loreme sdsd shdskjdsd","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":11,"length":10,"style":"BOLD"}],"entityRanges":[],"data":{}}],"entityMap":{}}',
        createdAt: "2021-11-19T10:04:31.546Z",
        updatedAt: "2021-11-19T10:04:31.546Z",
        lessonType: {
          id: "lessonTypeId_2",
          name: "video",
        },
        lessonTracking: [],
      },
      {
        ...endedDates,
        id: "lessonId_4",
        title: "Ended lesson (Due to has completed)",
        content:
          '{"blocks":[{"key":"cr1kt","text":"New lesssonnn","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        lessonTracking: [{ isCompleted: true }],
        createdAt: "2021-11-19T09:20:09.328Z",
        updatedAt: "2021-11-19T09:20:09.328Z",
        lessonType: { id: "lessonTypeId_1", name: "pdf" },
      },
      {
        ...ongoingDates,
        id: "lessonId_5",
        title: "Ongoing lesson (But has completed)",
        content:
          '{"blocks":[{"key":"d2sqe","text":"Loreme sdsd shdskjdsd","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":11,"length":10,"style":"BOLD"}],"entityRanges":[],"data":{}}],"entityMap":{}}',
        lessonTracking: [{ isCompleted: true }],
        createdAt: "2021-11-19T10:04:31.546Z",
        updatedAt: "2021-11-19T10:04:31.546Z",
        lessonType: {
          id: "lessonTypeId_2",
          name: "video",
        },
      },
    ],
    courseTracking: null,
    assessment: [
      {
        id: "assessmentId_1",
        title: "New Assessment (Ongoing)",
        startTime: ongoingDates.startTime,
        duration: 20,
        active: true,
        amountOfQuestions: 30,
        createdAt: "2021-11-19T09:20:42.717Z",
        updatedAt: "2021-11-19T09:20:42.717Z",
        courseId: "courseId_3",
        // assessmentScoreSheets: [],
      },
      {
        id: "assessmentId_2",
        title: "HTML ASSESSMENT TODAY (Upcoming)",
        startTime: upcomingDates.startTime,
        duration: 60,
        active: true,
        amountOfQuestions: 20,
        createdAt: "2021-11-19T08:48:02.855Z",
        updatedAt: "2021-11-19T09:31:09.397Z",
        courseId: "courseId_3",
        // assessmentScoreSheets: [{}],
        // assessmentScoreSheets: [],
      },
      {
        id: "assessmentId_3",
        title: "New Hot Assessment (Ended)",
        startTime: endedDates.startTime,
        duration: 20,
        active: true,
        amountOfQuestions: 10,
        createdAt: "2021-11-19T10:07:01.107Z",
        updatedAt: "2021-11-19T10:07:01.107Z",
        courseId: "courseId_3",
        assessmentScoreSheets: [{}],
        // assessmentScoreSheets: [],
      },
    ],
    examination: {
      id: "examinationId_2",
      title: "Hot Exam",
      duration: 20,
      amountOfQuestions: 5,
      startTime: ongoingDates.startTime,
      courseId: "courseId_3",
      examinationScoreSheets: [{}],
    },
  },
};
