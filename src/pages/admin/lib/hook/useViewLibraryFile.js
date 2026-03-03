import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { useFetchAndCache } from "../../../../hooks";
import { requestLibraryFileDetails } from "../../../../services";

const useViewLibraryFile = () => {
  const { id: fileId } = useParams();
  const fileIsNew = fileId === "new";
  const { resource: library, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { library } = await requestLibraryFileDetails(fileId);
    return library;
  }, [fileId]);

  useEffect(() => {
    if (!fileIsNew) handleFetchResource({ cacheKey: "library", fetcher });
  }, [handleFetchResource, fetcher, fileIsNew]);

  return {
    library,
  };
};

export default useViewLibraryFile;
