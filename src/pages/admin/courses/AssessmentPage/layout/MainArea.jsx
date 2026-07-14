import { Box } from "@chakra-ui/layout";
import { Switch } from "react-router-dom";
import OverviewPageRoute from "../pages/OverviewPage";
import QuestionsPageRoute from "../pages/QuestionsPage";
import GradingSummaryPageRoute from "../pages/GradingSummaryPage";
import ManualGradingPageRoute from "../pages/ManualGradingPage";

const MainArea = () => {
  return (
    <Box flex={1}>
      <Switch>
        <OverviewPageRoute path="/admin/courses/:id/assessment/:assessmentId/overview" />
        <QuestionsPageRoute path="/admin/courses/:id/assessment/:assessmentId/questions/:questionId" />
        <ManualGradingPageRoute path="/admin/courses/:id/assessment/:assessmentId/grading/:studentId" />
        <GradingSummaryPageRoute path="/admin/courses/:id/assessment/:assessmentId/grading" />
      </Switch>
    </Box>
  );
};

export default MainArea;
