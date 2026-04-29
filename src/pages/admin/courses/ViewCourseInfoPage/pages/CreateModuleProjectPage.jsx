import { Route, useParams, useHistory } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useForm } from "react-hook-form";
import {
    Button,
    DateTimePicker,
    Input,
} from "../../../../../components";
import {
    useDateTimePicker,
    useGoBack,
} from "../../../../../hooks";
import { AdminMainAreaWrapper } from "../../../../../layouts";
import { adminCreateProject } from "../../../../../services";
import { capitalizeFirstLetter, formatDateToISO } from "../../../../../utils";

const CreateModuleProjectPage = () => {
    const { courseId, moduleId } = useParams();
    const { push } = useHistory();
    const toast = useToast();
    const handleCancel = useGoBack();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const dueDateManager = useDateTimePicker();

    const onSubmit = async (data) => {
        try {
            const dueDate = dueDateManager.handleGetValueAndValidate("Due Date");

            const body = {
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                dueDate: formatDateToISO(dueDate),
                maxGrade: Number(data.maxGrade),
                status: "draft",
            };

            const { message } = await adminCreateProject(moduleId, body);
            toast({
                description: capitalizeFirstLetter(message),
                position: "top",
                status: "success",
            });
            push(`/admin/courses/${courseId}/module/${moduleId}/projects`);
        } catch (error) {
            toast({
                description: capitalizeFirstLetter(
                    error?.response?.data?.message || error.message
                ),
                position: "top",
                status: "error",
            });
        }
    };

    return (
        <AdminMainAreaWrapper>
            <Box as="form" onSubmit={handleSubmit(onSubmit)} marginY={14} marginX={6}>
                <Box backgroundColor="white" padding={10}>
                    <Input
                        label="Title"
                        placeholder="e.g. Build a Grooming Portfolio"
                        isRequired
                        error={errors.title?.message}
                        mb={6}
                        {...register("title", { required: "Title is required" })}
                    />

                    <Input
                        label="Description"
                        placeholder="Brief description of the project"
                        isRequired
                        error={errors.description?.message}
                        mb={6}
                        {...register("description", {
                            required: "Description is required",
                        })}
                    />

                    <Input
                        label="Instructions"
                        placeholder="Step-by-step instructions for students"
                        isRequired
                        error={errors.instructions?.message}
                        mb={6}
                        as="textarea"
                        rows={5}
                        {...register("instructions", {
                            required: "Instructions are required",
                        })}
                    />

                    <DateTimePicker
                        label="Due Date"
                        isRequired
                        value={dueDateManager.value}
                        onChange={dueDateManager.handleChange}
                        mb={6}
                    />

                    <Input
                        label="Max Grade"
                        type="number"
                        placeholder="e.g. 100"
                        isRequired
                        error={errors.maxGrade?.message}
                        mb={6}
                        {...register("maxGrade", {
                            required: "Max grade is required",
                            min: { value: 1, message: "Max grade must be at least 1" },
                        })}
                    />

                    <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
                        <Button secondary onClick={handleCancel} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Create Project
                        </Button>
                    </Box>
                </Box>
            </Box>
        </AdminMainAreaWrapper>
    );
};

export const CreateModuleProjectPageRoute = ({ ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => <CreateModuleProjectPage {...props} />}
        />
    );
};

export default CreateModuleProjectPageRoute;
