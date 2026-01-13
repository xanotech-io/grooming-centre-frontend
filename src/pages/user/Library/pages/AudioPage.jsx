import { Box } from "@chakra-ui/layout";
import { useEffect } from "react";
import { useCallback } from "react";
import { Route } from "react-router-dom";
import { useFetchAndCache } from "../../../../hooks";
import { CardGridLayout } from "../../../../layouts";
import { userGetAudioListing } from "../../../../services";

const useAudio = () => {
  const { resource: audio, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { audio } = await userGetAudioListing();
    return audio;
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: "audio", fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    audio,
  };
};

const AudioPage = () => {
  const { audio } = useAudio();
  console.log(audio);
  return (
    <Box paddingX={10}>
      <CardGridLayout cardContents={audio} />
    </Box>
  );
};

const AudioPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AudioPage {...props} />} />;
};

export default AudioPageRoute;
