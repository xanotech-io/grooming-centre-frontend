import { Box } from "@chakra-ui/layout";
import { useEffect } from "react";
import { useCallback } from "react";
import { Route } from "react-router-dom";
import { useFetchAndCache } from "../../../../hooks";
import { CardGridLayout } from "../../../../layouts";
import { userGetCourseMaterials } from "../../../../services";

const useVideo = () => {
  const { resource: videos, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { materials } = await userGetCourseMaterials("AGR101", {
      format: "MP4",
    });
    return materials;
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: "videos", fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    videos,
  };
};

const VideoPage = () => {
  const { videos } = useVideo();
  console.log(videos);

  return (
    <Box paddingX={10}>
      <CardGridLayout cardContents={videos} />
    </Box>
  );
};

const VideosPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <VideoPage {...props} />} />;
};

export default VideosPageRoute;
