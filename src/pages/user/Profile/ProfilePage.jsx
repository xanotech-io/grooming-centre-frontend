import React, { useState } from "react";
import { Route } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  Flex,
  Stack,
  Badge,
  Avatar,
  Button,
  Input,
  useToast,
} from '@chakra-ui/react';
import { Skeleton } from '@chakra-ui/skeleton';
import { Text, Heading } from '../../../components';
import { maxWidthStyles_userPages } from '../../../theme/breakpoints';
import { useApp } from '../../../contexts';
import { requestUpdateDetails } from '../../../services';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage = () => {
  const { state, fetchCurrentUser } = useApp();
  const userData = state.user;
  const toast = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [professionalCertification, setProfessionalCertification] = useState(
    userData?.professionalCertification || ''
  );

  console.log('ProfilePage - userData:', userData);

  const handleEditClick = () => {
    setIsEditing(true);
    setProfessionalCertification(userData?.professionalCertification || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfessionalCertification(userData?.professionalCertification || '');
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    
    try {
      await requestUpdateDetails({
        professionalCertification: professionalCertification.trim(),
      });
      
      // Refresh user data after successful update
      await fetchCurrentUser();
      
      toast({
        title: "Profile Updated",
        description: "Your professional certification has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed", 
        description: error.message || "Failed to update professional certification. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <Box {...maxWidthStyles_userPages} paddingY={8}>
        <Stack spacing={6}>
          <Text>Loading profile...</Text>
          <Skeleton height="80px" />
          <Skeleton height="200px" />
          <Skeleton height="150px" />
        </Stack>
      </Box>
    );
  }

  return (
    <Box {...maxWidthStyles_userPages} paddingY={8}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading as="h1" size="lg">
              My Profile
            </Heading>
            {!isEditing && (
              <Button
                colorScheme="purple"
                size="sm"
                onClick={handleEditClick}
              >
                Edit Profile
              </Button>
            )}
          </Flex>
          <Text color="gray.600">
            View your personal information and account details
          </Text>
        </Box>

        {/* Profile Card */}
        <Box bg="white" rounded="lg" shadow="md" p={6}>
          <HStack spacing={6} align="start">
            <Avatar
              size="xl"
              src={userData?.profilePics}
              name={`${userData?.firstName} ${userData?.lastName}`}
            />
            <VStack align="start" spacing={3} flex={1}>
              <Box>
                <Heading as="h2" size="md">
                  {userData?.firstName} {userData?.lastName}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  @{userData?.username}
                </Text>
              </Box>
              <HStack spacing={2}>
                <Badge colorScheme={userData?.active ? 'green' : 'red'}>
                  {userData?.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge colorScheme="blue">{userData?.userRole?.name}</Badge>
                <Badge colorScheme="purple">{userData?.gender}</Badge>
              </HStack>
            </VStack>
          </HStack>
        </Box>

        {/* Information Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {/* Contact Information */}
          <GridItem>
            <Box bg="white" rounded="lg" shadow="md" p={6}>
              <Heading as="h3" size="sm" mb={4} color="gray.700">
                Contact Information
              </Heading>
              <Stack spacing={3}>
                <InfoField label="Email" value={userData?.email} />
                <InfoField 
                  label="Phone" 
                  value={userData?.phone || 'Not provided'} 
                />
              </Stack>
            </Box>
          </GridItem>

          {/* Account Details */}
          <GridItem>
            <Box bg="white" rounded="lg" shadow="md" p={6}>
              <Heading as="h3" size="sm" mb={4} color="gray.700">
                Account Details
              </Heading>
              <Stack spacing={3}>
                <InfoField label="User ID" value={userData?.id} isCopyable />
                <InfoField 
                  label="Account Created" 
                  value={formatDistanceToNow(new Date(userData?.createdAt), { addSuffix: true })} 
                />
                <InfoField 
                  label="Last Updated" 
                  value={formatDistanceToNow(new Date(userData?.updatedAt), { addSuffix: true })} 
                />
                <InfoField 
                  label="Last Login" 
                  value={userData?.last_login 
                    ? formatDistanceToNow(new Date(userData?.last_login), { addSuffix: true })
                    : 'Never'
                  } 
                />
              </Stack>
            </Box>
          </GridItem>

          {/* Professional Information */}
          <GridItem>
            <Box bg="white" rounded="lg" shadow="md" p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="sm" color="gray.700">
                  Professional Information
                </Heading>
                {isEditing && (
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      onClick={handleSaveEdit}
                      isLoading={isLoading}
                      loadingText="Saving..."
                    >
                      Save
                    </Button>
                  </HStack>
                )}
              </Flex>
              <Stack spacing={3}>
                {isEditing ? (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                      Professional Certification:
                    </Text>
                    <Input
                      value={professionalCertification}
                      onChange={(e) => setProfessionalCertification(e.target.value)}
                      placeholder="Enter your professional certification"
                      size="sm"
                      disabled={isLoading}
                    />
                  </Box>
                ) : (
                  <InfoField 
                    label="Professional Certification" 
                    value={userData?.professionalCertification || 'Not provided'} 
                  />
                )}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                    Departments
                  </Text>
                  <Stack spacing={2}>
                    {userData?.departments?.map((dept) => (
                      <Badge key={dept.id} colorScheme="teal" fontSize="xs">
                        {dept.name}
                      </Badge>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </GridItem>

          {/* Account Status */}
          <GridItem>
            <Box bg="white" rounded="lg" shadow="md" p={6}>
              <Heading as="h3" size="sm" mb={4} color="gray.700">
                Account Status
              </Heading>
              <Stack spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Account Active</Text>
                  <Badge colorScheme={userData?.active ? 'green' : 'red'}>
                    {userData?.active ? 'Yes' : 'No'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Invite Active</Text>
                  <Badge colorScheme={userData?.isInviteActive ? 'green' : 'gray'}>
                    {userData?.isInviteActive ? 'Yes' : 'No'}
                  </Badge>
                </HStack>
                <InfoField 
                  label="Current Date/Time" 
                  value={new Date(userData?.currentDateTime).toLocaleString()} 
                />
              </Stack>
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

// Helper component for displaying information fields
const InfoField = ({ label, value, isCopyable = false }) => {
  return (
    <Flex justify="space-between" align="start">
      <Text fontSize="sm" color="gray.600" fontWeight="medium" minW="120px">
        {label}:
      </Text>
      <Text 
        fontSize="sm" 
        color="gray.800" 
        wordBreak="break-word" 
        textAlign="right"
        flex={1}
        fontFamily={isCopyable ? 'mono' : 'inherit'}
        // fontSize={isCopyable ? 'xs' : 'sm'}
      >
        {value}
      </Text>
    </Flex>
  );
};

export const ProfilePageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <ProfilePage {...props} />} />;
};

export default ProfilePage;
