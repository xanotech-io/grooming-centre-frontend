import { Box } from "@chakra-ui/react";
import { Switch, Redirect } from "react-router-dom";
import {
  AddQuestionPageRoute,
  MentionsPageRoute,
  QuestionDetailsPageRoute,
  QuestionsPageRoute,
  TagsPageRoute,
  YourAnswersPageRoute,
  YourQuestionsPageRoute,
} from "../../../pages/user";
import { BiMenu } from "react-icons/bi";

const MainArea = ({ ...rest }) => {
  return (
    <Box {...rest}>
      <Switch>
        <Redirect from="/forum" exact to="/forum/questions?tab=new" />
        <QuestionDetailsPageRoute path="/forum/questions/details/:id" />
        <QuestionsPageRoute path="/forum/questions" />
        <TagsPageRoute path="/forum/tags" />
        <MentionsPageRoute path="/forum/mentions" />
        <AddQuestionPageRoute path="/forum/your-questions/add" />
        <YourQuestionsPageRoute path="/forum/your-questions" />
        <YourAnswersPageRoute path="/forum/your-answers" />
      </Switch>
    </Box>
  );
};

export default MainArea;
