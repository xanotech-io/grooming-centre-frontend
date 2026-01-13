import { useForm } from 'react-hook-form';
import { Route, useParams, useHistory } from 'react-router';
import { Input, Breadcrumb, Link, Button } from '../../../components';
import { BreadcrumbItem, Box } from '@chakra-ui/react';
import { adminCreateDepartment } from '../../../services';
import { useToast } from '@chakra-ui/toast';
import { appendFormData, capitalizeFirstLetter } from '../../../utils';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';

const CreateDepartmentPage = () => {
  const { id: departmentId } = useParams();
  const toast = useToast();

  const { push } = useHistory();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      data = {
        ...data,
        departmentId,
      };
      const body = appendFormData(data);

      const { message } = await adminCreateDepartment(body);

      toast({
        description: capitalizeFirstLetter(message),
        position: 'top',
        status: 'success',
      });

      push(`/admin/departments`);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: 'top',
        status: 'error',
      });
    }
  };

  return (
    <AdminMainAreaWrapper>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/departments">Departments</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create</Link>
            </BreadcrumbItem>
          }
        />
      </Box>
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Box
          marginY={10}
          padding={10}
          backgroundColor="white"
          w={{ lg: '50%', md: '100%', sm: '100%' }}
        >
          <Input
            label="Title"
            id="name"
            width="100%"
            {...register('name', {
              required: 'Title is required',
            })}
            error={errors.name?.message}
          />
          <Button marginTop={10} isLoading={isSubmitting} type="submit">
            Create Deparment
          </Button>
        </Box>
      </Box>
    </AdminMainAreaWrapper>
  );
};

export const CreateDepartmentPageRoute = ({
  component: Component,
  ...rest
}) => {
  return (
    <Route {...rest} render={(props) => <CreateDepartmentPage {...props} />} />
  );
};
