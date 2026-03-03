import { http } from "../http";

/**
 * Endpoint to get `courses-overview-details`
 *
 * @returns {Promise<{ coursesOverview: coursesOverview }>}
 */
export const userGetGrades = async () => {
  const path = `/grade/user`;

  const {
    data: { data },
  } = await http.get(path);
  console.log(data, "data");
  const grades = {
    overview: {
      averageAttendanceScore: data.overview.averageAttendanceScore,
      averageAttendanceColor: "#46BD84",
      averageAssessmentScore: data.overview.averageAssessmentScore,
      averageAssessmentColor: "#0083E2",
      averageExaminationScore: data.overview.averageExaminationScore,
      averageExaminationColor: "#0083E2",
      completedCourseLength: data.overview.completedCourseLength,
      totalCoursesCount: data.overview.totalCoursesCount,
    },
    completedCourses: data.completedCourses.map((course) => ({
      id: course.courseId,
      id2: course.id,
      attendanceScore: course.attendanceScore,
      assessmentScore: course.assessmentScore,
      examinationScore: course.examinationScore,
      courseTitle: course.courseTitle,
      lessonLength: course.lessonLength,
      courseDuration: course.courseDuration,
      courseTimeline: course.courseTimeline,
      totalScore: course.totalScore,
      attendanceTitle: "Attendance",
      assessmentTitle: "Assessment",
      examinationTitle: "Examination",
    })),
    ongoingCourses: data.ongoingCourses.map((course) => ({
      id: course.id,
      attendanceScore: course.attendanceScore,
      assessmentScore: course.assessmentScore,
      examinationScore: course.examinationScore,
      courseTitle: course.courseTitle,
      lessonLength: course.lessonLength,
      courseTimeline: course.courseTimeline,
      courseDuration: course.courseDuration,
      totalScore: course.totalScore,
      attendanceTitle: "Attendance",
      assessmentTitle: "Assessment",
      examinationTitle: "Examination",
    })),
  };

  return {
    grades,
  };
};

/**
 * Endpoint to get user grades
 *
 * @returns {Promise<{ grades }>}
 */
export const adminGetUserGrades = async (userId) => {
  const path = `/admin/grades/${userId}`;

  const {
    data: { data },
  } = await http.get(path);
  console.log(data, "data");
  const grades = {
    overview: {
      averageAttendanceScore: data.overview.averageAttendanceScore,
      averageAssessmentScore: data.overview.averageAssessmentScore,
      averageExaminationScore: data.overview.averageExaminationScore,
      completedCourseLength: data.overview.completedCourseLength,
      totalCoursesCount: data.overview.totalCoursesCount,
    },
    completedCourses: data.completedCourses.map((course) => ({
      id: course?.courseId,
      attendanceScore: course.attendanceScore,
      assessmentScore: course.assessmentScore,
      examinationScore: course.examinationScore,
      courseTitle: course.courseTitle,
      lessonLength: course.lessonLength,
      courseDuration: course.courseDuration,
      courseTimeline: course.courseTimeline,
      totalScore: course.totalScore,
      attendanceTitle: "Attendance",
      assessmentTitle: "Assessment",
      examinationTitle: "Examination",
    })),
    ongoingCourses: data.ongoingCourses.map((course) => ({
      id: course.id,
      attendanceScore: course.attendanceScore,
      assessmentScore: course.assessmentScore,
      examinationScore: course.examinationScore,
      courseTitle: course.courseTitle,
      lessonLength: course.lessonLength,
      courseTimeline: course.courseTimeline,
      courseDuration: course.courseDuration,
      totalScore: course.totalScore,
      attendanceTitle: "Attendance",
      assessmentTitle: "Assessment",
      examinationTitle: "Examination",
    })),
  };

  return {
    grades,
  };
};

/**
 * Endpoint to get grade criteria
 *
 * @returns {Promise<{ gradaeCriteria: gradeCriteria }>}
 */
export const adminGetGradeCriteria = async () => {
  const path = `/marking-guide`; //TODO: might change `

  const {
    data: { data },
  } = await http.get(path);

  return { gradeCriteria: data };
};

/**
 * Endpoint for updating grade criteria
 *
 * @param {object} body
 * @returns {Promise<{ message: string }>}
 */
export const adminEditGradeCriteria = async (body) => {
  const path = `/marking-guide/edit`; //TODO: might change `

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};
