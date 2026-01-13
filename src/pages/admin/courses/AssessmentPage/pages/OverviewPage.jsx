import { Flex } from '@chakra-ui/layout';
import { Route, useParams } from 'react-router-dom';
import { Heading, Spinner } from '../../../../../components';
import useAssessmentPreview from '../../../../user/Courses/TakeCourse/hooks/useAssessmentPreview';
import EditAssessmentPage from './EditAssessmentPage';
import CreateAssessmentPage from './CreateAssessmentPage';
import { useFetch, useQueryParams } from '../../../../../hooks';
import { useEffect } from 'react';
import { adminGetUserListing } from '../../../../../services';
import { capitalizeFirstLetter } from '../../../../../utils';
import { useToast } from '@chakra-ui/react';

export const isStandaloneExaminationAndIsNotEditMode =
  'isStandaloneExamination && isNotEdit';

const OverviewPage = () => {
  const { id: courseId, assessmentId } = useParams();
  const examinationId = useQueryParams().get('examination');
  const isStandaloneExamination =
    courseId === 'not-set' && assessmentId === 'not-set' && examinationId
      ? true
      : false;

  const isEditMode = isStandaloneExamination
    ? examinationId && examinationId !== 'new'
    : assessmentId && assessmentId !== 'new';

  const { isLoading, error, assessment } = useAssessmentPreview(
    null,
    isStandaloneExamination && !isEditMode
      ? isStandaloneExaminationAndIsNotEditMode
      : isStandaloneExamination && isEditMode
      ? examinationId
      : assessmentId,
    true
  );

  const { resource: users, handleFetchResource } = useFetch();
  useEffect(() => {
    handleFetchResource({
      fetcher: async () => {
        let { users } = await adminGetUserListing();

        users = users.map((user) => ({
          value: user.id,
          label: `${capitalizeFirstLetter(
            `${user.firstName} ${user.lastName}`
          )} (${user.email})`,
        }));

        return users;
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toast = useToast();
  useEffect(() => {
    if (users.err)
      toast({
        description: 'Something went wrong! please refresh the page',
        position: 'top',
        status: 'error',
        duration: 60000,
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.err]);

  return isEditMode && (isLoading || error) ? (
    <Flex
      // Make the height 100% of the screen minus the `height` of the Header and Footer
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Heading color="red.500">{error}</Heading>
      ) : null}
    </Flex>
  ) : isEditMode ? (
    <EditAssessmentPage users={users} assessment={assessment} />
  ) : (
    <CreateAssessmentPage users={users} />
  );
};

const OverviewPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <OverviewPage {...props} />} />;
};

export default OverviewPageRoute;
