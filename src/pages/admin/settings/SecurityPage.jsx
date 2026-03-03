import { Route } from "react-router-dom";

const SecurityPage = () => {
  return "SecurityPage";
};

export const SecurityPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <SecurityPage {...props} />} />;
};