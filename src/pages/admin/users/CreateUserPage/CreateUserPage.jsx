import { useState } from "react";
import { Grid, GridItem, Stack, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { Route, useParams, useHistory } from "react-router-dom";
import { read, utils } from "xlsx";
import {
  Input,
  Select,
  Breadcrumb,
  Link,
  Upload,
  Button,
} from "../../../../components";
import { useApp, useCache } from "../../../../contexts";
import { CreatePageLayout } from "../../../../layouts";
import { useUpload } from "../../../../hooks";
import {
  adminEditUser,
  adminInviteUser,
  adminInvitBatcheUser,
  superAdminInviteAdmin,
} from "../../../../services";
import { capitalizeFirstLetter } from "../../../../utils/formatString";
import useCreateUser from "../hooks/useCreateUser";
import { BreadcrumbItem, Box, RadioGroup, Radio, VStack, Text, Select as ChakraSelect } from "@chakra-ui/react";
import { populateSelectOptions } from "../../../../utils";
import { useEffect, useMemo } from "react";
import { useViewUserDetails } from "../..";
import temp from "../../../../assets/images/temp.xlsx";
const CreateUserPage = ({
  creatorRoleIsSuperAdmin,
  metadata: propMetadata,
}) => {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
  const [uploadingUsers, setUploadingUsers] = useState(false);
  const [batchUploadMethod, setBatchUploadMethod] = useState("invite");
  const [defaultPassword, setDefaultPassword] = useState("");

  const toast = useToast();
  const appManager = useApp();
  const {
    formManager,
    departmentIsRequired,
    handleResetDepartmentIsRequired,
    setStatus,
    // status,
  } = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = formManager;

  const { push } = useHistory();

  const { id: userId } = useParams();
  const isEditMode = useMemo(() => userId && userId !== "new", [userId]);

  const { user } = useViewUserDetails();

  const metadata = propMetadata || appManager.state.metadata;

  const { handleDelete } = useCache();

  const fileManager = useUpload();

  const onSubmit = async (data) => {
    try {
      const { message, user } = await (isEditMode
        ? adminEditUser(userId, {
            departmentId: data.departmentId,
            firstName: data.firstName,
            gender: data.gender,
            lastName: data.lastName,
            userRoleId: data.roleId,
            professionalCertification: data.professionalCertification,
          })
        : creatorRoleIsSuperAdmin &&
          appManager.getOneMetadata("userRoles", data.roleId)?.name === "admin"
        ? superAdminInviteAdmin({
            ...data,
            professionalCertification: data.professionalCertification,
          })
        : adminInviteUser({
            ...data,
            professionalCertification: data.professionalCertification,
          }));

      if (isEditMode) handleDelete(user.id);

      setStatus({
        success: message,
      });

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });
      reset();
      handleResetDepartmentIsRequired();

      isEditMode && push(`/admin/users/details/${userId}/profile`);
    } catch (err) {
      toast({
        description: capitalizeFirstLetter(err.message),
        position: "top",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("lastName", user.lastName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("email", user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setValue("gender", user.gender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && metadata?.departments) {
      setValue("departmentId", user.departmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, metadata?.departments]);

  useEffect(() => {
    if (user && metadata?.userRoles) {
      setValue("roleId", user.userRoleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, metadata?.userRoles]);

  const userRole = appManager.getOneMetadata(
    "userRoles",
    user?.userRoleId
  )?.name;

  // Handle form submission
  const onSubmitBatchUser = async (e) => {
    e.preventDefault();
    try {
      if (selectedDepartmentIds.length === 0) {
        throw new Error("Please select at least one department");
      }

      if (batchUploadMethod === "default" && !defaultPassword.trim()) {
        throw new Error("Please enter a default password");
      }

      const file = fileManager.handleGetFileAndValidate("File");

      setUploadingUsers(true);

      const getJson = () => {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.readAsBinaryString(file);
          fileReader.onload = (e) => {
            const data = e.target.result;
            const wb = read(data, { type: "binary" });
            const rowObj = utils.sheet_to_row_object_array(
              wb.Sheets[wb.SheetNames[0]]
            );

            const updatedRowObj = rowObj.map((obj) => {
              const updatedObj = {};
              for (const [key, value] of Object.entries(obj)) {
                updatedObj[key] = value.toLowerCase();
              }
              return updatedObj;
            });

            resolve(JSON.stringify(updatedRowObj));
          };
        });
      };

      const jsonObj = await getJson();
      console.log("Upload method:", batchUploadMethod);
      console.log("Default password:", batchUploadMethod === "default" ? defaultPassword : "Not using default password");
      console.log("Selected departments:", selectedDepartmentIds);
      console.log(JSON.parse(jsonObj));
      
      const requestData = {
        departmentIds: selectedDepartmentIds,
        users: JSON.parse(jsonObj),
        uploadMethod: batchUploadMethod,
        ...(batchUploadMethod === "default" && { defaultPassword })
      };

      const { message } = await adminInvitBatcheUser(requestData);

      setUploadingUsers(false);

      toast({
        description: capitalizeFirstLetter(message),
        position: "top",
        status: "success",
      });

      push(`/admin/users`);
    } catch (error) {
      toast({
        description: capitalizeFirstLetter(error.message),
        position: "top",
        status: "error",
      });

      setUploadingUsers(false);
    }
  };
 
  const setLessonAccept = (fileType) => {
    fileManager.handleAcceptChange(fileType);
  };

  // Init `lessonTypeId` value and set `accept` for file upload input
  useEffect(() => {
    setLessonAccept(".csv, .xlsx, .xls");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/users">Users</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Create Users</Link>
            </BreadcrumbItem>
          }
        />
      </Box>
      <CreatePageLayout
        title="Create Single User"
        submitButtonText={isEditMode ? "Update User" : "Submit"}
        submitButtonIsLoading={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={10} marginBottom={10}>
          <Box
            as="div"
            display={{ lg: "grid", base: "flex", md: "flex" }}
            flexDirection={{ base: "column", md: "column" }}
            gridTemplateColumns="1fr 1fr"
            gap={10}
            marginBottom={10}
          >
            <Input
              label="Firstname"
              id="firstName"
              isRequired
              {...register("firstName", {
                required: "Firstname is required",
              })}
              error={errors.firstName?.message}
            />
            <Input
              label="Lastname"
              id="lastName"
              isRequired
              {...register("lastName", {
                required: "Lastname is required",
              })}
              error={errors.lastName?.message}
            />
            <Input
              label="User's Email"
              id="email"
              disabled={isEditMode}
              isRequired
              {...register("email", {
                required: "Email can't be empty",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Enter a valid e-mail address",
                },
              })}
              error={errors.email?.message}
            />
            <Select
              id="gender"
              label="Select Gender"
              isRequired
              options={[
                { label: "Female", value: "female" },
                { label: "Male", value: "male" },
              ]}
              {...register("gender", {
                required: "Please select your gender",
              })}
              error={errors.gender?.message}
            />
            <Input
              label="Professional Certification"
              id="professionalCertification"
              placeholder="Enter professional certification"
              {...register("professionalCertification")}
              error={errors.professionalCertification?.message}
            />
            <Select
              label="Department"
              options={populateSelectOptions(metadata?.departments)}
              id="departmentId"
              isLoading={!metadata?.departments}
              isRequired={departmentIsRequired}
              {...register("departmentId", {
                required: departmentIsRequired && "Please select a department",
              })}
              error={errors.departmentId?.message}
            />
            {!userRole?.toLowerCase().includes("super") && (
              <Select
                label="Select Role"
                options={populateSelectOptions(metadata?.userRoles, (r) => {
                  const role = appManager.getOneMetadata(
                    "userRoles",
                    r.id
                  )?.name;

                  if (role !== "super admin") {
                    return true;
                  }

                  if (!creatorRoleIsSuperAdmin && role !== "admin") {
                    return true;
                  }
                })}
                isLoading={!metadata?.userRoles}
                isRequired
                {...register("roleId", {
                  required: "Please select a role",
                })}
                id="roleId"
                error={errors.roleId?.message}
              />
            )}
          </Box>
        </Stack>
      </CreatePageLayout>
      {!isEditMode && (
        <CreatePageLayout
          title="Batch User Upload"
          submitButtonText="Upload"
          submitButtonIsLoading={uploadingUsers}
          onSubmit={onSubmitBatchUser}
          template={true}
          file={temp}
        >
          <Grid spacing={10} marginBottom={10}>
            <GridItem marginBottom={10}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" marginBottom={3}>
                  Select Departments <Text as="span" color="red.500">*</Text>
                </Text>
                <ChakraSelect
                  placeholder="Select departments..."
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !selectedDepartmentIds.includes(value)) {
                      setSelectedDepartmentIds(prev => [...prev, value]);
                    }
                  }}
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                  }}
                >
                  {metadata?.departments
                    ?.filter(dept => !selectedDepartmentIds.includes(dept.id))
                    .map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                </ChakraSelect>
                
                {/* Show selected departments */}
                {selectedDepartmentIds.length > 0 && (
                  <Box marginTop={3}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" marginBottom={2}>
                      Selected Departments:
                    </Text>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {selectedDepartmentIds.map((deptId) => {
                        const department = metadata?.departments?.find(d => d.id === deptId);
                        return (
                          <Box
                            key={deptId}
                            display="flex"
                            alignItems="center"
                            bg="blue.100"
                            color="blue.800"
                            px={3}
                            py={1}
                            borderRadius="md"
                            fontSize="sm"
                          >
                            {department?.name}
                            <Box
                              as="button"
                              ml={2}
                              color="blue.600"
                              fontWeight="bold"
                              onClick={() => setSelectedDepartmentIds(prev => 
                                prev.filter(id => id !== deptId)
                              )}
                              _hover={{ color: "blue.800" }}
                            >
                              ×
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
                
                <Text fontSize="xs" color="gray.500" marginTop={2}>
                  Users will be added to all selected departments
                </Text>
              </Box>
            </GridItem>
            
            <GridItem marginBottom={6} marginLeft={10}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" marginBottom={3}>
                  Upload Method <Text as="span" color="red.500">*</Text>
                </Text>
                <RadioGroup 
                  value={batchUploadMethod} 
                  onChange={setBatchUploadMethod}
                  colorScheme="blue"
                >
                  <VStack align="start" spacing={4}>
                    <Radio 
                      value="invite" 
                      size="lg"
                      borderColor="gray.300"
                      _checked={{
                        bg: "blue.500",
                        borderColor: "blue.500",
                        color: "white",
                      }}
                      _focus={{
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
                      }}
                    >
                      <Box marginLeft={3}>
                        <Text fontWeight="semibold" color="gray.800">
                          Send Invite Email
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Users will receive an email with login instructions and temporary password
                        </Text>
                      </Box>
                    </Radio>
                    
                    <Radio 
                      value="default" 
                      size="lg"
                      borderColor="gray.300"
                      _checked={{
                        bg: "blue.500",
                        borderColor: "blue.500",
                        color: "white",
                      }}
                      _focus={{
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
                      }}
                    >
                      <Box marginLeft={3}>
                        <Text fontWeight="semibold" color="gray.800">
                          Use Default Password
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Set a common password for all users (they can change it later)
                        </Text>
                      </Box>
                    </Radio>
                  </VStack>
                </RadioGroup>
              </Box>
            </GridItem>

            {batchUploadMethod === "default" && (
              <GridItem marginBottom={10}>
                <Input
                  label="Default Password"
                  id="defaultPassword"
                  type="password"
                  placeholder="Enter default password for all users"
                  isRequired
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                  }}
                />
                <Text fontSize="xs" color="gray.500" marginTop={2}>
                  This password will be set for all users in the uploaded file
                </Text>
              </GridItem>
            )}
            
            <GridItem colSpan={2}>
              <Upload
                id="file"
                previewElementId="file-video"
                label="File (.csv, .xlsx, .xls)"
                isRequired
                excelUrl={fileManager.excel.url}
                onFileSelect={fileManager.handleFileSelect}
                accept={fileManager.accept}
              />
            </GridItem>
          </Grid>
        </CreatePageLayout>
      )}
    </>
  );
};

export const CreateUserPageRoute = ({ component: Component, ...rest }) => {
  const { state, getOneMetadata } = useApp();

  const creatorRoleIsSuperAdmin =
    getOneMetadata("userRoles", state.user?.userRoleId)?.name === "super admin";

  return (
    <Route
      {...rest}
      render={(props) => (
        <CreateUserPage
          creatorRoleIsSuperAdmin={creatorRoleIsSuperAdmin}
          {...props}
        />
      )}
    />
  );
};

export default CreateUserPage;
