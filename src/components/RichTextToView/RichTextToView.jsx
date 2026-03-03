import { Box } from '@chakra-ui/layout';
import { convertFromRaw } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';

export const RichTextToView = ({ text, ...rest }) => {
  return (
    <Box
      {...rest}
      dangerouslySetInnerHTML={{
        __html: getConvertedHTML(text),
      }}
    ></Box>
  );
};

const getConvertedHTML = (text) => {
  if (text) {
    text = JSON.parse(text);
    return stateToHTML(convertFromRaw(text));
  }
};
