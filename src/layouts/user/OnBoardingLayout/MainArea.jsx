import { Flex } from "@chakra-ui/layout";
import { Redirect } from "react-router-dom";
import { Switch } from "react-router-dom";
import {
  ForgotPasswordPageRoute,
  NewPasswordPageRoute,
  SigninPageRoute,
  // UpdateDetailsPageRoute,
} from "../../../pages/user";

const MainArea = () => {
  return (
    <Flex
      as="main"
      minWidth={{ base: "500px", xl: "700px" }}
      alignItems="center"
      justifyContent="center"
    >
      <Switch>
        <SigninPageRoute exact path="/auth/signin" />
        <ForgotPasswordPageRoute exact path="/auth/forgot-password" />
        <NewPasswordPageRoute exact path="/auth/new-password/:token" />
        {/* <UpdateDetailsPageRoute exact path="/auth/update-details" /> */}

        <Redirect to="/not-found" />
      </Switch>
    </Flex>
  );
};

export default MainArea;
