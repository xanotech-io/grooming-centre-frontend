import { Box } from "@chakra-ui/layout";
import { useCallback } from "react";
import { useEffect } from "react";
import { Route } from "react-router-dom";
import { useFetchAndCache } from "../../../../hooks";
import { CardGridLayout } from "../../../../layouts";
import { userGetBookListing } from "../../../../services";

const useBooks = () => {
  const { resource: books, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { books } = await userGetBookListing();
    return books;
  }, []);

  useEffect(() => {
    handleFetchResource({ cacheKey: "books", fetcher });
  }, [handleFetchResource, fetcher]);

  return {
    books,
  };
};

const BooksPage = () => {
  const { books } = useBooks();

  return (
    <Box paddingX={10}>
      <CardGridLayout cardContents={books} />
    </Box>
  );
};

const BooksPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <BooksPage {...props} />} />;
};

export default BooksPageRoute;
