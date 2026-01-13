import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCache } from '../../../../../contexts';
import useComponentIsMount from '../../../../../hooks/useComponentIsMount';
import { userGetCourseDetails } from '../../../../../services';

const useCourseDetails = (courseId) => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const [courseDetails, setCourseDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });

  let params = useParams();
  const id = courseId || params.id;

  const fetcher = useCallback(async () => {
    const { course } = await userGetCourseDetails(id);
    return course;
  }, [id]);

  const fetchCourseDetails = useCallback(
    async (bypassCache) => {
      setCourseDetails({ loading: true });

      try {
        let courseDetails = await handleGetOrSetAndGet(
          id,
          fetcher,
          bypassCache
        );

        if (componentIsMount) setCourseDetails({ data: courseDetails });
      } catch (err) {
        console.log(err);
        if (componentIsMount) setCourseDetails({ err: err.message });
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, componentIsMount]
  );

  return {
    courseDetails,
    fetchCourseDetails,
    setCourseDetails,
  };
};

export default useCourseDetails;
