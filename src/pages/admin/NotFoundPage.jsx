import { Flex } from "@chakra-ui/react";
import { Route } from "react-router-dom";
import { Button } from "../../components";
import { EmptyState } from "../../layouts";
import { ReactComponent as NotFound } from "../../assets/images/page-not-found.svg";
import { useGoBack } from "../../hooks";
import { IoArrowBack } from "react-icons/io5";

const NotFoundPage = () => {
  const handleGoBack = useGoBack();
  return (
    <Flex
      height="100%"
      width="100%"
      alignItems="center"
      backgroundColor="white"
    >
      <EmptyState
        cta={
          <Button
            leftIcon={<IoArrowBack />}
            onClick={handleGoBack}
            paddingY={4}
          >
            Go Back
          </Button>
        }
        heading="Not Found!"
        illustration={<NotFound style={{ paddingBottom: 20 }} />}
      />
    </Flex>
  );
};

export const NotFoundPageRoute = ({ component: Component, ...rest }) => {
  return <Route {...rest} render={(props) => <NotFoundPage {...props} />} />;
};
