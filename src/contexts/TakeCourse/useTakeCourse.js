import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { useCache } from "..";
import useCourseDetails from "../../pages/user/Courses/CourseDetails/hooks/useCourseDetails";
import { TakeCourseContext } from "./TakeCourseProvider";

/**
 * TakeCourseLayout state `Manager` - its consumes the ContextProvider and returns whats neccessary.
 *
 * @returns  Object {
 *  state: {
 *    data: `Object` | `null`,
 *    err: `ErrorObject` | `null`,
 *    isLoading: `boolean`
 *  }
 * }
 */
export const useTakeCourse = () => {
  const { course_id } = useParams();

  // console.log(course_id);

  const { fetchCourseDetails } = useCourseDetails(course_id);

  const cacheManager = useCache();

  const context = useContext(TakeCourseContext);
  if (!context) {
    throw new Error(
      `useTakeCourse must be used within a TakeCourseContextProvider`
    );
  }

  const [state, setState] = context;

  useEffect(() => {
    const fetchData = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        await fetchCourseDetails();
        
        // const data = await fetchTakeCourseData();

        // if (isMounted) {
        //   setState((prev) => ({ ...prev, data, isLoading: false }));
        // }
      } catch (err) {
        setState({ err: err.message });
        console.error(err);
      }
    };

    if (course_id) fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course_id]);

  useEffect(() => {
    if (cacheManager.state[course_id]) {
      setState({ data: cacheManager.state[course_id] });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheManager.state[course_id]]);

  // useEffect(() => {
  //   if (state.data) {
  //     console.log(state.data);
  //   }
  // }, [state.data]);

  return {
    state,
    setState,
  };
};
