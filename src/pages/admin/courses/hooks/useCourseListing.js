import { useCallback, useEffect, useState } from "react";
import { adminGetCourseListing } from "../../../../services";
import { useCache} from "../../../../contexts"
import useComponentIsMount from "../../../../hooks/useComponentIsMount";

const useCourseListing = () => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();

  const [courseListing, setCourseListing] = useState({
    data: null,
    loading: false,
    err: null,
  });

  const fetcher = useCallback(async () => {
    const { courses } = await adminGetCourseListing();
    return courses;
  }, []);
  const fetchCourseListing = useCallback(async () => {
    setCourseListing({ loading: true });

    try {
      const courseListing =  await handleGetOrSetAndGet(
        "courseListing ",
        fetcher
      );
      // console.log(courseListing );
      if (componentIsMount)
        setCourseListing({ data: courseListing });
    } catch (err) {
      console.log(err.message);
      if (componentIsMount) setCourseListing({ err: err.message });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentIsMount]);

  useEffect(() => {
    fetchCourseListing();
  }, [fetchCourseListing]);

  const courses = courseListing.data;
  const isLoading = courseListing.loading;
  const error = courseListing.err;

  return {
    courses,
    isLoading,
    error,
  };
};

export default useCourseListing;
