import { useMemo, useRef, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { BreadcrumbItem, Box } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { Flex, Stack } from "@chakra-ui/layout";
import { useForm } from "react-hook-form";
import {
  Breadcrumb,
  Button,
  Heading,
  Input,
  Link,
  Select,
  Textarea,
  WorkflowSubmitModal,
} from "../../../components";
import { CreatePageLayout } from "../../../layouts";
import { useApp } from "../../../contexts";
import { useIsSuperAdmin } from "../../../hooks";
import { adminCreatePoll } from "../../../services";
import { capitalizeFirstLetter, capitalizeWords } from "../../../utils";

const CreatePollsPage = ({ metadata: propMetadata }) => {
  const toast = useToast();
  const appManager = useApp();
  const createOptionId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      departmentId: "",
      question: "",
    },
  });

  const { push } = useHistory();
  const isSuperAdmin = useIsSuperAdmin();
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowContent, setWorkflowContent] = useState(null);
  const pendingPayloadRef = useRef(null);
  const resultPollRef = useRef(null);

  const metadata = propMetadata || appManager.state.metadata;
  const [options, setOptions] = useState([
    { id: createOptionId(), text: "" },
    { id: createOptionId(), text: "" },
  ]);

  const departmentOptions = useMemo(() => {
    return metadata?.departments?.map((department) => ({
      label: capitalizeWords(department.name),
      value: department.id,
    }));
  }, [metadata?.departments]);

  const updateOptionText = (optionId, text) => {
    setOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.id === optionId ? { ...option, text } : option,
      ),
    );
  };

  const addOption = () => {
    setOptions((currentOptions) => [
      ...currentOptions,
      { id: createOptionId(), text: "" },
    ]);
  };

  const removeOption = (optionId) => {
    setOptions((currentOptions) => {
      if (currentOptions.length <= 2) {
        return currentOptions;
      }

      return currentOptions.filter((option) => option.id !== optionId);
    });
  };

  const performCreate = async (payload) => {
    const { message, poll } = await adminCreatePoll(payload);
    resultPollRef.current = poll;
    toast({
      description: capitalizeFirstLetter(message),
      position: "top",
      status: "success",
    });
    return { id: poll?.id };
  };

  const onSubmit = async (data) => {
    try {
      const cleanedOptions = options
        .map((option) => option.text.trim())
        .filter(Boolean)
        .map((text) => ({ text }));

      if (!cleanedOptions.length) {
        throw new Error("Please add at least one answer option");
      }

      const payload = {
        question: data.question.trim(),
        options: cleanedOptions,
        ...(data.departmentId ? { departmentId: data.departmentId } : {}),
      };

      const workflowContentBase = {
        contentTitle: payload.question,
        requestType: "Poll",
        departmentId: data.departmentId,
      };

      // Everyone, including super admin, must submit for approval before
      // this gets created — hold off until the modal below completes. Super
      // admin submissions carry a null supervisor instead of skipping the
      // workflow.
      pendingPayloadRef.current = payload;
      setWorkflowContent(workflowContentBase);
      setWorkflowModalOpen(true);
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  return (
    <>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/polls">Polls</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Poll</Link>
            </BreadcrumbItem>
          }
        />
      </Box>
      <CreatePageLayout
        title="Create Poll"
        submitButtonText="Submit"
        submitButtonIsLoading={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={8} marginBottom={10}>
          <Box
            display={{ base: "grid", lg: "grid" }}
            gridTemplateColumns={{ base: "1fr", lg: "1fr" }}
            gap={10}
          >
            <Select
              label="Select department"
              id="departmentId"
              isLoading={!metadata?.departments}
              placeholder="All departments"
              options={departmentOptions}
              {...register("departmentId")}
            />
          </Box>

          <Textarea
            minHeight="160px"
            label="Question"
            id="question"
            isRequired
            {...register("question", {
              required: "Please add a question",
              maxLength: 1000,
            })}
            error={
              errors.question?.type === "maxLength"
                ? "Maximum length of 1000 characters"
                : errors.question?.message
            }
          />

          <Box>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginBottom={4}
            >
              <Heading as="h2" fontSize="heading.h4">
                Answer options
              </Heading>

              <Button secondary sm onClick={addOption} type="button">
                Add option
              </Button>
            </Flex>

            <Stack spacing={4}>
              {options.map((option, index) => (
                <Flex key={option.id} gap={3} alignItems="flex-end">
                  <Box flex="1">
                    <Input
                      label={`Option ${index + 1}`}
                      id={`option-${option.id}`}
                      value={option.text}
                      onChange={(event) =>
                        updateOptionText(option.id, event.target.value)
                      }
                      placeholder={`Enter option ${index + 1}`}
                    />
                  </Box>

                  <Button
                    secondary
                    type="button"
                    onClick={() => removeOption(option.id)}
                    disabled={options.length <= 2}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
            </Stack>
          </Box>
        </Stack>
      </CreatePageLayout>

      {workflowContent && (
        <WorkflowSubmitModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          isSuperAdmin={isSuperAdmin}
          contentId={workflowContent.contentId}
          contentTitle={workflowContent.contentTitle}
          requestType={workflowContent.requestType}
          departmentId={workflowContent.departmentId}
          onCreate={() => performCreate(pendingPayloadRef.current)}
          onSuccess={() => push("/admin/polls/")}
        />
      )}
    </>
  );
};

export const CreatePollsPageRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={(props) => <CreatePollsPage {...props} />} />
  );
};

export default CreatePollsPage;
