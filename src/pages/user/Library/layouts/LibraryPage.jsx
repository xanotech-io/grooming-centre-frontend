import { Route } from 'react-router-dom';
import { Box, Stack } from '@chakra-ui/react';
import coverImagePlaceholder from '../../../../assets/images/events-banner.svg';
import { Image, Heading, Text } from '../../../../components';
import { maxWidthStyles_userPages } from '../../../../theme/breakpoints';
import Links from './Links';
import MainArea from './MainArea';

const LibraryPage = () => {
  return (
    <Box>
      <Box
        as="section"
        padding={10}
        marginBottom={10}
        // backgroundColor="secondary.9"
        color="white"
        position="relative"
      >
        <Image
          src={coverImagePlaceholder}
          width="100%"
          height="100%"
          top={0}
          left={0}
          position="absolute"
          alt="Course Header"
        />

        <Stack
          spacing={7}
          position="relative"
          // zIndex={1}
          {...maxWidthStyles_userPages}
        >
          <Heading>Library</Heading>
          <Text as="level2">Find resources available for you</Text>
        </Stack>
      </Box>
      <Box {...maxWidthStyles_userPages}>
        <Links />
        <MainArea />
      </Box>
    </Box>
  );
};

export const LibraryPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <LibraryPage {...props} />} />;
};
