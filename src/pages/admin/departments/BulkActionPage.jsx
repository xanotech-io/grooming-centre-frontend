import { useState, useEffect } from "react";
import { Grid, GridItem, Stack, Flex, Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { Route, useHistory } from "react-router-dom";
import { read, utils } from "xlsx";
import {
  Button,
  Heading,
  Upload,
  Breadcrumb,
  Link,
  Text,
} from "../../../components";
import { useApp } from "../../../contexts";
import { CreatePageLayout } from "../../../layouts";
import { useUpload } from "../../../hooks";
import { adminBulkAddUsersToDepartment } from "../../../services";
import { capitalizeFirstLetter } from "../../../utils/formatString";
import { BreadcrumbItem, Select as ChakraSelect } from "@chakra-ui/react";
import temp from "../../../assets/images/temp.xlsx";

const BulkActionPage = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [uploadingUsers, setUploadingUsers] = useState(false);

  const toast = useToast();
  const appManager = useApp();
  const { push } = useHistory();

  const metadata = appManager.state.metadata;
  const fileManager = useUpload();

  // Handle form submission
  const onSubmitBulkAction = async (e) => {
    e.preventDefault();
    try {
      if (!selectedDepartmentId) {
        throw new Error("Please select a department");
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
                updatedObj[key.toLowerCase()] = typeof value === 'string' 
                  ? value.toLowerCase().trim() 
                  : value;
              }
              return updatedObj;
            });

            resolve(JSON.stringify(updatedRowObj));
          };
          fileReader.onerror = (error) => reject(error);
        });
      };

      const jsonObj = await getJson();
      const users = JSON.parse(jsonObj);
      
      // Validate that users have email field
      const invalidUsers = users.filter(user => !user.email);
      if (invalidUsers.length > 0) {
        throw new Error(`File contains ${invalidUsers.length} user(s) without email address. Please ensure all users have an email field.`);
      }

      console.log("Selected department:", selectedDepartmentId);
      console.log("Users to add:", users);
      
      const { message, data } = await adminBulkAddUsersToDepartment(selectedDepartmentId, users);

      setUploadingUsers(false);

      // Show detailed results
      if (data.successful > 0 && data.errors === 0) {
        toast({
          description: `Successfully added ${data.successful} user(s) to ${data.departmentName}`,
          position: "top",
          status: "success",
        });
      } else if (data.successful > 0 && data.errors > 0) {
        toast({
          description: `Partially completed: ${data.successful} users added, ${data.errors} failed. Check console for details.`,
          position: "top",
          status: "warning",
        });
        
        // Log error details for debugging
        console.log("Error details:", data.errorDetails);
      } else {
        toast({
          description: `Failed to add users: ${data.errorDetails.join(', ')}`,
          position: "top",
          status: "error",
        });
        
        console.log("All errors:", data.errorDetails);
      }

      // Navigate back to departments listing
      push("/admin/departments");
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

  // Init accept for file upload input
  useEffect(() => {
    setLessonAccept(".csv, .xlsx, .xls");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDepartment = metadata?.departments?.find(d => d.id === selectedDepartmentId);

  return (
    <>
      <Box paddingLeft={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem>
              <Link href="/admin/departments">Departments</Link>
            </BreadcrumbItem>
          }
          item3={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Bulk Action</Link>
            </BreadcrumbItem>
          }
        />
      </Box>
      
      <CreatePageLayout
        title="Bulk Add Existing Users to Department"
        submitButtonText="Upload & Add Users"
        submitButtonIsLoading={uploadingUsers}
        onSubmit={onSubmitBulkAction}
        template={true}
        file={temp}
      >
        <Stack spacing={6} marginBottom={10}>
          <Text fontSize="md" color="gray.600" marginBottom={4}>
            Upload a file containing email addresses of existing users to add them to a department.
          </Text>
          
          <Grid spacing={10} marginBottom={10}>
            <GridItem marginBottom={6}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" marginBottom={3}>
                  Select Department <Text as="span" color="red.500">*</Text>
                </Text>
                <ChakraSelect
                  placeholder="Choose a department..."
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                  }}
                  isRequired
                >
                  {metadata?.departments?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </ChakraSelect>
                
                {selectedDepartment && (
                  <Text fontSize="xs" color="gray.500" marginTop={2}>
                    Selected: {selectedDepartment.name}
                  </Text>
                )}
              </Box>
            </GridItem>
            
            <GridItem marginBottom={6}>
              <Box 
                padding={4} 
                borderRadius="md" 
                backgroundColor="blue.50" 
                border="1px solid" 
                borderColor="blue.200"
              >
                <Text fontSize="sm" fontWeight="semibold" color="blue.800" marginBottom={2}>
                  📋 File Format Requirements:
                </Text>
                <Box fontSize="sm" color="blue.700" lineHeight="1.6">
                  <Text>• File must be in .csv, .xlsx, or .xls format</Text>
                  <Text>• Required column: <strong>email</strong></Text>
                  <Text>• Users must already exist in the system</Text>
                  <Text>• Email addresses should be valid and unique</Text>
                  <Text>• Users already in the department will be skipped</Text>
                </Box>
              </Box>
            </GridItem>
            
            <GridItem colSpan={2}>
              <Upload
                id="file"
                previewElementId="file-video"
                label="Upload File (.csv, .xlsx, .xls)"
                isRequired
                excelUrl={fileManager.excel.url}
                onFileSelect={fileManager.handleFileSelect}
                accept={fileManager.accept}
              />
            </GridItem>
          </Grid>
        </Stack>
      </CreatePageLayout>
    </>
  );
};

export const BulkActionPageRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <BulkActionPage {...props} />
      )}
    />
  );
};

export default BulkActionPage;
