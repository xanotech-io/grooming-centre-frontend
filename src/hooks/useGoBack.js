import { useHistory } from "react-router-dom";

/**
 * Handler to go back in the `router-history-tree`
 * @returns handleGoBack: `Function`
 */
export const useGoBack = () => {
  const history = useHistory();

  const handleGoBack = () => {
    history.goBack();
  };

  return handleGoBack;
};
