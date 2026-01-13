export const userGetGradesRes = {
  data: {
    overview: {
      averageAttendanceScore: 100,
      averageAssessmentScore: 26,
      averageExaminationScore: 40,
      completedCourseLength: 2,
      totalCoursesCount: 10,
    },
    completedCourses: [
      {
        id: "courseId_1",
        attendanceScore: "10",
        assessmentScore: "26",
        examinationScore: "40",
        courseTitle: "HTML and CSS",
        lessonLength: 6,
        courseTimeline: 7,
        courseDuration: 630,
        totalScore: 76,
      },
      {
        id: "courseId_2",
        attendanceScore: "7",
        assessmentScore: "0",
        examinationScore: "0",
        courseTitle: "Web dev 2021",
        lessonLength: 27,
        courseTimeline: 9,
        courseDuration: 982,
        totalScore: 76,
      },
    ],
    ongoingCourses: [
      {
        id: "courseId_3",
        attendanceScore: "7",
        assessmentScore: "0",
        examinationScore: "0",
        courseTitle: "Web dev 2021",
        lessonLength: 27,
        courseTimeline: 9,
        courseDuration: 982,
        totalScore: 76,
      },
    ],
  },
};

export const adminGetGradeCriteriaRes = {
  data: {
    examination: 60,
    assessment: 20,
    attendance: 20,
  },
};

export const adminEditGradeCriteriaRes = {
  message: "grade criteria updated successfully",
};
