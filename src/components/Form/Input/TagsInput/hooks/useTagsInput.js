import { useToast } from '@chakra-ui/toast';
import { useEffect } from 'react';
import { useFetch } from '../../../../../hooks';
import { userForumGetTags } from '../../../../../services';
import { capitalizeFirstLetter } from '../../../../../utils';

export const getTagInput = () => {
  const tagsInput = document.querySelector('#tags');

  return tagsInput;
};

const useTagsInput = (props) => {
  const { propSelectedTags } = props;
  const toast = useToast();

  const {
    resource: tagsResult,
    handleFetchResource,
    handleClearResource,
  } = useFetch();

  const fetcher = (value) => async () => {
    console.log(value);
    const { tags } = await userForumGetTags({ word: value });
    return tags;
  };

  const handleTagSearch = async (event) => {
    const { value } = event.target;

    if (value) {
      handleFetchResource({ fetcher: fetcher(value) });
    } else {
      handleClearResource();
    }
  };

  // Handle Tag search error
  useEffect(() => {
    if (tagsResult.err) {
      toast({
        description: capitalizeFirstLetter(tagsResult.err),
        position: 'top',
        status: 'error',
      });
    }
  }, [tagsResult.err, toast]);

  return {
    selectedTags: propSelectedTags,
    handleTagSearch,
    tagsResult,
    handleClearResource,
  };
};

export default useTagsInput;
