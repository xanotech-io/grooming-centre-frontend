import { Route } from "react-router-dom";

const BadgesPage = () => {
  return "BadgesPage";
};

const BadgesPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <BadgesPage {...props} />} />;
};

export default BadgesPageRoute;
