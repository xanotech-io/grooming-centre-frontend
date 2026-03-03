import { Text as TextChakraui } from '@chakra-ui/layout';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

export const Text = forwardRef(
  ({ as = 'level4', bold, children, italic, fontSize, ...rest }, ref) => {
    return (
      <TextChakraui
        fontWeight={bold ? 'bold' : 'regular'}
        fontSize={fontSize || `text.${as}`}
        fontStyle={italic && 'italic'}
        ref={ref}
        {...rest}
      >
        {children}
      </TextChakraui>
    );
  }
);

Text.propTypes = {
  as: PropTypes.oneOf([
    'level1',
    'level2',
    'level3',
    'level4',
    'level5',
    'level6',
    'level7',
  ]),
  fontSize: PropTypes.string,
  bold: PropTypes.bool,
  children: PropTypes.any,
  italic: PropTypes.bool,
};
