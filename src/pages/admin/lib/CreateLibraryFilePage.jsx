import { useEffect } from "react";
import { useToast } from "@chakra-ui/toast";
import { Flex, Grid, GridItem } from "@chakra-ui/layout";
import { Route, useParams, useHistory } from "react-router-dom";
import {
  Input,
  Select,
  Upload,
  Breadcrumb,
  Link,
  Heading,
  Spinner,
  Textarea,
} from "../../../components";
import { CreatePageLayout } from "../../../layouts";
import { BreadcrumbItem, Box } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useUpload } from "../../../hooks";
import {
  appendFormData,
  capitalizeFirstLetter,
  populateSelectOptions,
} from "../../../utils";
import { useApp, useCache } from "../../../contexts";
import {
  adminEditLibraryFile,
  adminUploadLibraryFile,
} from "../../../services";
import useViewLibraryFile from "./hook/useViewLibraryFile";

const CreateLibraryFilePage = () => {
  const { id: fileId } = useParams();

  const isEditMode = fileId && fileId !== "new";

  const { push } = useHistory();
  const toast = useToast();
  const { handleDelete } = useCache();

  const {
    handleSubmit,
    register,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const {
    state: { allMetadata },
  } = useApp();

  const fileManager = useUpload();

  const { library } = useViewLibraryFile();
  const libraryFile = library.data;
  const isLoading = library.loading;
  const isError = library.error;

  /// Init `Title` value
  useEffect(() => {
    if (libraryFile) {
      setValue("title", libraryFile.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryFile]);

  useEffect(() => {
    if (libraryFile && allMetadata?.departments) {
      setValue("departmentId", libraryFile?.departmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryFile, allMetadata?.departments]);

  useEffect(() => {
    if (libraryFile) {
      setValue("description", libraryFile.description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryFile]);

  const setLibraryAccept = (libraryTypeId) => {
    if (libraryTypeId === "pdf") {
      fileManager.handleAcceptChange("application/pdf");
    }

    if (libraryTypeId === "video") {
      fileManager.handleAcceptChange("video/mp4, video/mkv");
    }

    if (libraryTypeId === "audio") {
      fileManager.handleAcceptChange("audio/mpeg, audio/ogg, audio/wav");
    }
  };

  // Init `libraryTypeId` value and set `accept` for file upload input
  useEffect(() => {
    if (libraryFile) {
      setValue("libraryTypeId", libraryFile.fileType);
      setLibraryAccept(libraryFile.fileType);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryFile]);

  // Init `library File` file url
  useEffect(() => {
    if (libraryFile) {
      const fileIsAVideo = libraryFile.fileExtension === "mp4";
      const fileIsPDF = libraryFile.fileExtension === "pdf";
      const fileIsAudio = libraryFile.fileExtension === "mpeg";

      if (fileIsAVideo) {
        fileManager.handleInitialVideoSelect(libraryFile.file);
      }
      if (fileIsPDF) {
        fileManager.handleInitialPdfSelect(libraryFile.file);
      }
      if (fileIsAudio) {
        fileManager.handleInitialAudioSelect(libraryFile.file);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryFile]);

  // Control `library File` with `File Type`
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      console.log({ name, type, data });

      if (name === "libraryTypeId") {
        fileManager.handleFileSelect(null);

        setLibraryAccept(data.libraryTypeId);
      }
    });

    return () => subscription.unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const file = fileManager.handleGetFileAndValidate(
        "Library File",
        isEditMode
      );

      data = {
        ...data,
        libraryTypeId: null,
        file,
      };

      if (isEditMode) Reflect.deleteProperty(data, "fileId");

      const body = appendFormData(data);

      const { message, library } = await (isEditMode
        ? adminEditLibraryFile(fileId, body)
        : adminUploadLibraryFile(body));

      if (isEditMode) handleDelete(library.id);

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      if (isEditMode) push(`/admin/library/details/${fileId}`);
      else {
        push(`/admin/library/details/${fileId}`);
      }
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });
    }
  };

  return isEditMode && (isLoading || isError) ? (
    <Flex
      // Make the height 100% of the screen minus the `height` of the Header and Footer
      height="calc(100vh - 200px)"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Heading color="red.500">{isError}</Heading>
      ) : null}
    </Flex>
  ) : (
    <>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/library">Library</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{isEditMode ? "Edit" : "Create"}</Link>
            </BreadcrumbItem>
          }
        />
      </Box>

      <CreatePageLayout
        title={isEditMode ? "Edit File details" : "Upload File"}
        submitButtonText={
          isSubmitting
            ? "Please wait this might take a while"
            : isEditMode
            ? "Update File"
            : "Add File"
        }
        onSubmit={handleSubmit(onSubmit)}
        submitButtonIsDisabled={!allMetadata}
        submitButtonIsLoading={isSubmitting}
      >
        <Box
          as="div"
          display={{ lg: "grid", sm: "flex", md: "flex" }}
          flexDirection="column"
          gridTemplateColumns="1fr 1fr"
          gap={10}
          marginBottom={10}
        >
          {/* Row 1 */}
          <GridItem>
            <Input
              label="Title"
              id="title"
              {...register("title", {
                required: "Title is required",
              })}
              error={errors.title?.message}
            />
          </GridItem>
          <GridItem>
            <Select
              label="Select department"
              options={populateSelectOptions(allMetadata?.departments)}
              id="departmentId"
              isLoading={!allMetadata?.departments}
              {...register("departmentId", {
                required: "Please select a department",
              })}
              error={errors.departmentId?.message}
            />
          </GridItem>
        </Box>
        {/* Row 2 */}
        <Grid marginBottom={10}>
          <Textarea
            minHeight="150px"
            label="Description"
            id="description"
            isRequired
            {...register("description", {
              required: "Please add a description",
              maxLength: 1000,
            })}
            error={
              errors.description?.type === "maxLength"
                ? "Maximum length of 1000 characters"
                : errors.description?.message
            }
          />
        </Grid>

        <Grid marginBottom={10}>
          <GridItem width={{ lg: "50%", base: "100%" }}>
            <Select
              id="libraryTypeId"
              label="File type"
              options={[
                { value: "pdf", label: "Pdf" },
                { value: "video", label: "Video" },
                { value: "audio", label: "Audio" },
              ]}
              // options={populateSelectOptions(metadata?.libraryType)}
              // isLoading={!metadata?.libraryType}
              isRequired
              error={errors.libraryTypeId?.message}
              {...register("libraryTypeId", {
                required: "File type is required",
              })}
            />
          </GridItem>
        </Grid>
        <Grid marginBottom={10}>
          <GridItem colSpan={2}>
            <Upload
              id="file"
              label="Library file"
              isRequired
              videoUrl={fileManager.video.url}
              pdfUrl={fileManager.pdf.url}
              audioUrl={fileManager.audio.url}
              //disabled={!getValues("libraryTypeId")}
              onFileSelect={fileManager.handleFileSelect}
              accept={fileManager.accept}
            />
          </GridItem>
        </Grid>
      </CreatePageLayout>
    </>
  );
};

export const CreateLibraryFilePageRoute = ({
  component: Component,
  ...rest
}) => {
  return (
    <Route {...rest} render={(props) => <CreateLibraryFilePage {...props} />} />
  );
};
