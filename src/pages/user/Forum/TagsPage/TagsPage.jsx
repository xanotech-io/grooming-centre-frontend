import { Box } from "@chakra-ui/layout";
import { useEffect } from "react";
import { Route } from "react-router-dom";
import { Heading, QuestionListCard, TagsInput } from "../../../../components";
import { useSelectedTags } from "../../../../hooks";
import { PageLoaderLayout } from "../../../../layouts";
import { capitalizeWords } from "../../../../utils";
import useTagsPage from "./hooks/useTagsPage";

const TagsPage = () => {
  const { questions, handleClearQuestionsData, handleTagQuestionsSearch } =
    useTagsPage();
  const {
    selectedTags,
    handleTagSelectOne,
    handleTagDeselect,
    // handleClearAllSelectedTags,
  } = useSelectedTags();

  useEffect(() => {
    // On Tag Select
    if (selectedTags.length) {
      const selectedTag = selectedTags[0];

      return handleTagQuestionsSearch(selectedTag.id);
    }

    // On Tag Deselect
    handleClearQuestionsData();

    // On Component unmount
    return () => handleClearQuestionsData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags?.[0]?.id]);

  return (
    <Box paddingBottom={2}>
      <TagsInput
        wrapperProps={{ marginBottom: 8 }}
        id="tags"
        placeholder="&#128269; Filter questions by tag"
        selectedTags={selectedTags}
        onTagSelect={handleTagSelectOne}
        onTagDeselect={handleTagDeselect}
      />

      <QuestionsResult questions={questions} />
    </Box>
  );
};

const QuestionsResult = ({ questions }) => {
  const questionsIsEmpty =
    !questions.loading && !questions.err && !questions.data?.length
      ? true
      : false;

  const hasNotSearched =
    !questions.loading && !questions.err && !questions.data;

  return hasNotSearched ? (
    <PageLoaderLayout height="40vh" width="100%">
      <Heading as="h3" marginBottom={3}>
        You have not searched yet
      </Heading>
    </PageLoaderLayout>
  ) : (
    <>
      {questions.loading && <PageLoaderLayout height="40vh" width="100%" />}

      {questionsIsEmpty && (
        <PageLoaderLayout height="40vh" width="100%">
          <Heading as="h3" marginBottom={3}>
            No Questions Found
          </Heading>
        </PageLoaderLayout>
      )}

      {questions.err && (
        <PageLoaderLayout height="70%" width="100%">
          <Heading as="h3" marginBottom={3} color="red.500">
            {capitalizeWords(questions.err)}
          </Heading>
        </PageLoaderLayout>
      )}

      {questions.data && !questionsIsEmpty && (
        <Box position="absolute" transform="translateY(-160px)">
          <Heading as="h4">
            <Box as="span" color="primary.base">
              {questions.data.length}
            </Box>{" "}
            Questions Found
          </Heading>
        </Box>
      )}

      {questions.data?.map((question) => (
        <QuestionListCard key={question.id} {...question} />
      ))}
    </>
  );
};

export const TagsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <TagsPage {...props} />} />;
};
