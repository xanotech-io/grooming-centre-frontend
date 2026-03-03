import { ButtonGroup } from '@chakra-ui/button';
import { Box, Grid } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/skeleton';
import { Route } from 'react-router-dom';
import { Button, SearchBar } from '../../../components';
import { AdminMainAreaWrapper } from '../../../layouts';

export const CoursesPage = () => {
  return (
    <AdminMainAreaWrapper>
      <Box
        as="section"
        backgroundColor="white"
        paddingX={10}
        paddingTop={5}
        paddingBottom={10}
        shadow="md"
      >
        <Box
          as="header"
          justifyContent="flex-end"
          height="120px"
          borderBottom="1px"
          borderColor="accent.1"
          marginBottom={10}
          paddingBottom={10}
        >
          <ButtonGroup display="flex" justifyContent="flex-end">
            <Button link="/admin/courses/edit/new">Add Course</Button>

            <Button link="/admin/courses/unknown/lessons/edit/new" secondary>
              Add Lesson
            </Button>
          </ButtonGroup>
        </Box>

        <Box>
          <SearchBar mb={5} maxWidth="500px" />

          <Grid
            templateColumns="repeat(4, 207px)"
            // justifyContent="space-between"
            gap={5}
          >
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />

            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />

            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
            <Skeleton height="228px" rounded="sm" />
          </Grid>
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CoursesPageRoute = ({ component: Component, ...rest }) => {
  return <Route {...rest} render={(props) => <CoursesPage {...props} />} />;
};
