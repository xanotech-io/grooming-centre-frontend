import { useFetch } from ".";

export const useTableRows = (fetcher) => {
  const {
    resource: rows,
    setResource: setRows,
    handleFetchResource,
  } = useFetch();

  const fetchRowItems = (props) => {
    handleFetchResource({ fetcher: fetcher(props) });
  };

  return {
    rows,
    setRows,
    fetchRowItems,
  };
};
