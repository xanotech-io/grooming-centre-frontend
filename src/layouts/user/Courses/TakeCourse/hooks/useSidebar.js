import { useState } from "react";
import { useApp, useTakeCourse } from "../../../../../contexts";
import { hasEnded, isUpcoming } from "../../../../../utils";

const mapLessonsToLinks = (course) => {
  const mapLessonToLink = (lesson) => ({
    id: lesson.id,
    to: `/courses/take/${course.id}/lessons/${lesson.id}`,
    text: lesson.title,
    disabled: false,
    type: lesson.lessonType.name,
    hasCompleted: lesson.hasCompleted,
    hasElapsed: hasEnded(lesson.endTime) && !lesson.hasCompleted,
    isUpcoming: isUpcoming(lesson.startTime),
    startTime: lesson.startTime,
    createdAt: lesson.createdAt,
    itemType: "lesson",
  });

  const mapAssessmentToLink = (assessment) => ({
    id: assessment.id,
    to: `/courses/take/${course.id}/assessment/${assessment.id}`,
    text: assessment.title || "Assessment",
    disabled: false,
    type: "assessment",
    hasCompleted: assessment.hasCompleted,
    hasElapsed: hasEnded(assessment.endTime) && !assessment.hasCompleted,
    isUpcoming: isUpcoming(assessment.startTime),
    startTime: assessment.startTime,
    createdAt: assessment.createdAt,
    itemType: "assessment",
  });

  const combinedItems = [];

  if (course?.lessons) {
    course.lessons.forEach((lesson) => {
      combinedItems.push(mapLessonToLink(lesson));
    });
  }

  if (course?.assessments) {
    course.assessments.forEach((assessment) => {
      combinedItems.push(mapAssessmentToLink(assessment));
    });
  }

  const extractModuleNumber = (title) => {
    const match = title.match(/(module|lesson)\s+(\d+)/i);
    return match ? parseInt(match[2], 10) : null;
  };

  const extractAssessmentModules = (title) => {
    const numbers = title.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return Math.max(...numbers.map((n) => parseInt(n, 10)));
    }
    return null;
  };

  const itemsWithSortKeys = combinedItems.map((item) => {
    let sortKey;

    if (item.itemType === "lesson") {
      const moduleNum = extractModuleNumber(item.text);
      if (moduleNum !== null) {
        sortKey = moduleNum;
      } else {
        const createdTime = new Date(item.createdAt).getTime();
        sortKey = -createdTime / 1e15;
      }
    } else if (item.itemType === "assessment") {
      const maxModule = extractAssessmentModules(item.text);
      if (maxModule !== null) {
        sortKey = maxModule + 0.5;
      } else {
        sortKey = 9999;
      }
    }

    return { ...item, sortKey };
  });

  const links = itemsWithSortKeys.sort((a, b) => {
    if (a.sortKey !== b.sortKey) {
      return a.sortKey - b.sortKey;
    }
    const createdA = new Date(a.createdAt).getTime();
    const createdB = new Date(b.createdAt).getTime();
    return createdA - createdB;
  });

  const examination = {
    id: course?.examination?.id,
    to: `/courses/take/${course?.id}/assessment/${course?.id}?examination=true`,
    text: "Examination",
    disabled: false,
    type: "examination",
    hasCompleted: course?.examination?.hasCompleted,
    hasElapsed:
      hasEnded(course?.examination?.endTime) &&
      !course?.examination?.hasCompleted,
    isUpcoming: isUpcoming(course?.examination?.startTime),
    startTime: course?.examination?.startTime,
    itemType: "examination",
  };

  if (course?.examination) links.push(examination);

  return links;
};

/**
 * TakeCourseLayout's Sidebar functionality `Manager`
 * @returns Object { links: `Array<Object>` | `null`, courseTitle: `string`, isLoading: `boolean` }
 */
const useSidebar = () => {
  const appManager = useApp();
  const {
    state: { data: course, isLoading },
    setState: setCourseState,
  } = useTakeCourse();

  const sidebarLinkClickedState = useState(false);

  const links = mapLessonsToLinks(course);

  const loading = isLoading || !appManager.state.metadata; // TODO:replace with `!appManager.metadataIsLoading`

  return {
    course,
    setCourseState,
    links,
    isLoading: loading,
    sidebarLinkClickedState,
  };
};

export default useSidebar;
