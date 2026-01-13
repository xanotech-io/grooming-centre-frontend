import { Box } from "@chakra-ui/layout";
import { Switch } from "react-router-dom";
import BooksPageRoute from "../pages/BooksPage";
import AudioPageRoute from "../pages/AudioPage";
import VideoPageRoute from "../pages/VideoPage";

const MainArea = () => {
  return (
    <Box flex={1} overflowY="scroll">
      <Switch>
        <BooksPageRoute exact path="/library/books" />
        <AudioPageRoute path="/library/audio" />
        <VideoPageRoute path="/library/videos" />
      </Switch>
    </Box>
  );
};

export default MainArea;
