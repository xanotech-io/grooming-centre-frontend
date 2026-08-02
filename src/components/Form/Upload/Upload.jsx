import Icon from "@chakra-ui/icon";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/skeleton";
import PropTypes from "prop-types";
import { forwardRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { Button, Image, Spinner } from "../..";
import { useFetch } from "../../../hooks";
import FormGroup, { FormGroupPropTypes } from "../FormGroup";
import MiniUploadContent from "./MiniUploadContent";
import fileIcon from "../../../assets/images/file.png";

export const Upload = forwardRef(
  (
    {
      error,
      id,
      previewElementId,
      isRequired,
      isDisabled,
      isMini,
      imageUrl,
      videoUrl,
      audioUrl,
      pdfUrl,
      excelUrl,
      powerpointUrl,
      wordUrl,
      alt,
      label,
      onFileSelect,
      width = "100%",
      onDelete,
      deleteRequestServiceFunction,
      accept,
      ...rest
    },
    ref
  ) => {
    const onDrop = useCallback(
      (acceptedFiles) => {
        acceptedFiles.forEach((file) => {
          onFileSelect?.(file);
        });
      },
      [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept,
      disabled: isDisabled,
    });

    const hasUploaded = imageUrl || videoUrl || pdfUrl || audioUrl || excelUrl || powerpointUrl || wordUrl;

    const { resource: deleteRequest, handleFetchResource } = useFetch();
    const toast = useToast();

    const handleDelete = () => {
      handleFetchResource({
        fetcher: async () => {
          await deleteRequestServiceFunction?.();
          onDelete();
          return "File Deleted Successfully";
        },
        onError: (err) => {
          toast({
            description: err.message,
            position: "top",
            status: "error",
          });
        },
        onSuccess: (msg) => {
          toast({
            description: msg,
            position: "top",
            status: "success",
          });
        },
      });
    };

    const renderContent = (props) => {
      const style = !hasUploaded
        ? {
            flexDirection: "column",
            justifyContent: "center",
            width,
            padding: 20,
            border: "1px dashed",
            borderColor: "#C1C9D2",
          }
        : {};

      return (
        <>
          <Flex
            style={isMini ? { border: "none" } : { ...style }}
            {...props}
            {...getRootProps()}
          >
            <Input ref={ref} {...getInputProps()} {...rest} />

            {hasUploaded ? (
              <>
                {videoUrl ? (
                  <video
                    id={previewElementId}
                    src={videoUrl}
                    controls
                    width="300px"
                    height="150px"
                  />
                ) : audioUrl ? (
                  <audio src={audioUrl} controls />
                ) : pdfUrl ? (
                  <object
                    id={previewElementId}
                    width="100%"
                    height="400"
                    data={pdfUrl}
                    type="application/pdf"
                  >
                    {" "}
                  </object>
                ) : excelUrl ? (
                  <div>
                    <img width="100px" src={fileIcon} alt=""/><br/>
                    <b><i>{excelUrl}</i></b>
                  </div>
                ) : powerpointUrl ? (
                  <div>
                    <img width="100px" src={fileIcon} alt="" style={{filter: "hue-rotate(180deg)"}}/><br/>
                    <b><i>{powerpointUrl}</i></b>
                    <br/>
                    <Text fontSize="sm" color="gray.500" mt={1}>PowerPoint File</Text>
                  </div>
                ) : wordUrl ? (
                  <div>
                    <img width="100px" src={fileIcon} alt="" style={{filter: "hue-rotate(220deg)"}}/><br/>
                    <b><i>{wordUrl}</i></b>
                    <br/>
                    <Text fontSize="sm" color="gray.500" mt={1}>Word Document</Text>
                  </div>
                ) : (
                  <Image
                    id={previewElementId}
                    src={imageUrl}
                    width={isMini ? "80px" : "300px"}
                    borderRadius={isMini ? "50%" : null}
                    height={isMini ? "80px" : "150px"}
                    alt={alt}
                  />
                )}
                <MiniUploadContent
                  mute
                  hideImage
                  wrapperProps={
                    isMini
                      ? { alignItems: "center", paddingLeft: "16px" }
                      : { alignItems: "flex-end", paddingLeft: "16px" }
                  }
                  props={props}
                />
              </>
            ) : isMini ? (
              <Flex alignItems="center">
                <Skeleton boxSize="60px" rounded="full" marginRight={5} />
                <Button width="fit-content" secondary sm>
                  Re-upload
                </Button>
              </Flex>
            ) : (
              <Stack alignItems="center" textAlign="center" spacing={2}>
                <Box>
                  <Icon color="primary.base" fontSize="25px" width="30px">
                    <FaCloudUploadAlt />
                  </Icon>

                  {isDragActive ? (
                    <Text>Drop The File Here ...</Text>
                  ) : (
                    <Text>Drag & Drop Your Files Here</Text>
                  )}
                </Box>

                <Text color="accent.2">Or</Text>

                <Button width="fit-content" sm isDisabled={isDisabled}>
                  Browse files
                </Button>
              </Stack>
            )}
          </Flex>

          {deleteRequest.loading && (
            <Flex
              pos="fixed"
              top="0"
              left="0"
              zIndex={100}
              w="100vw"
              h="100vh"
              alignItems="center"
              justifyContent="center"
              bg="rgba(255,255,255, .5)"
            >
              <Flex
                alignItems="center"
                bg="rgba(255,255,255)"
                p={6}
                shadow="md"
                rounded="md"
                w="300px"
                flexDirection="column"
              >
                <Box>
                  <Spinner mb={5} />
                </Box>
                Please wait. Deleting this file might take some time.
              </Flex>
            </Flex>
          )}

          {hasUploaded && onDelete && (
            <Button
              asIcon
              width="fit-content"
              alignSelf="flex-end"
              transform="scale(.9) translate(10px, 2px)"
              onClick={handleDelete}
            >
              <FaTrash />
            </Button>
          )}
        </>
      );
    };

    return (
      <FormGroup
        id={id}
        label={label}
        isRequired={isRequired}
        error={error}
        renderControl={(props) => renderContent(props)}
      />
    );
  }
);

Upload.propTypes = {
  ...FormGroupPropTypes,
  width: PropTypes.string,
  onDrop: PropTypes.func,
  onDelete: PropTypes.func,
  deleteRequestServiceFunction: PropTypes.func,
};
