import { useLocation } from "react-router-dom";

/**
 * Whether to show the Forum Header
 *
 * @returns {{ pageDoNotRequireHeader: () => boolean, isAddQuestionPage: boolean }}
 */
const useDisplayHeader = () => {
  const { pathname } = useLocation();
  const pageDoNotRequireHeader = () =>
    // /(forum\/your-questions\/add|forum\/your-answers)/i.test(pathname) //TODO: use or remove
    /(forum\/your-questions|forum\/your-answers|forum\/questions\/details|forum\/mentions|forum\/tags)/i.test(
      pathname
    )
      ? true
      : false;

  const isAddQuestionPage = /(forum\/your-questions\/add)/i.test(pathname)
    ? true
    : false;

  return {
    pageDoNotRequireHeader,
    isAddQuestionPage,
  };
};

export default useDisplayHeader;
