import { render as rtl } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

/**
 * Mount component to the DOM for testing purposes and unmount after each test case runs.
 *
 * @param {(props: {}) => ReactElement} renderComponent
 * @param {{ props: {}, wrapWithRouter: boolean } }} options
 */
export const render = (renderComponent, { wrapWithRouter }) => {
  const history = createMemoryHistory();

  rtl(
    wrapWithRouter ? (
      <Router history={history}>{renderComponent()}</Router>
    ) : (
      renderComponent()
    )
  );
};
