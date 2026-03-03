import { useCallback, useEffect } from 'react';
import { useFetchAndCache } from '../../../../hooks';
import { userGetCourseListing } from '../../../../services';

const useCourses = () => {
  // const { handleGetOrSetAndGet } = useCache();

  // const componentIsMount = useComponentIsMount();
  // const [courses, setCourses] = useState({
  //   data: null,
  //   loading: false,
  //   err: null,
  // });

  // const fetchCourses = useCallback(async () => {
  //   setCourses({ loading: true });

  //   try {
  //     const courses = await handleGetOrSetAndGet("courses", fetcher);

  //     if (componentIsMount) setCourses({ data: courses });
  //   } catch (err) {
  //     if (componentIsMount) setCourses({ err: err.message });
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [componentIsMount]);

  const { resource: courses, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { courses } = await userGetCourseListing();
    return courses;
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: 'courses', fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    courses,
  };
};

export default useCourses;
