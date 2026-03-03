import { Box, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { Button } from '../../../components';
import {
  adminCreateStandaloneExaminationParticipants,
  adminGetDepartmentListing,
  adminGetUserListing,
} from '../../../services';
import { useQueryParams } from '../../../hooks';
import { useToast } from '@chakra-ui/toast';
import { capitalizeFirstLetter } from '../../../utils';
import { useHistory } from 'react-router';

const departmentProps = [
  {
    id: 1,
    name: 'test1',
  },
  {
    id: 2,
    name: 'test2',
  },
  {
    id: 3,
    name: 'test3',
  },
  {
    id: 4,
    name: 'test4',
  },
  {
    id: 5,
    name: 'test5',
  },
];

const CreateParticipants = () => {
  const [value, setValue] = useState('Department');
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState(<BiChevronDown size={20} />);
  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [id, setId] = useState('');
  const [myValue, setMyValue] = useState('');
  const [display, setDisplay] = useState('');
  const toast = useToast();
  const examinationId = useQueryParams().get('examination');
  const { push } = useHistory();

  const handleChange = (id, name, value) => {
    setId(id);
    setDisplay(name);
    setMyValue(value);
  };

  const handleCancel = () => {
    setDisplay('');
    setMyValue('');
  };

  const handleSave = async () => {
    try {
      const body = {
        standAloneExaminationId: examinationId,
        type: value.toLocaleLowerCase(),
        participantId: id,
      };
      const { message } = await adminCreateStandaloneExaminationParticipants(
        body
      );
      toast({
        description: capitalizeFirstLetter(message),
        position: 'top',
        status: 'success',
      });
      push(`/admin/standalone-exams/participants?examination=${examinationId}`);
    } catch (error) {
      toast({
        description: error.message,
        position: 'top',
        status: 'error',
      });
    }
  };

  const fetcher = useCallback(async () => {
    try {
      const { users } = await adminGetUserListing();
      const { departments } = await adminGetDepartmentListing();
      setUsers(users);
      setDepartments(departments);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  const handleShowDropDown = () => {
    setOpen((prev) => !prev);
    if (open === true) {
      setIcon(<BiChevronUp size={20} />);
    } else {
      setIcon(<BiChevronDown size={20} />);
    }
  };
  return (
    <>
      <Box
        backgroundColor="#fff"
        borderRadius={5}
        width="85%"
        height="auto"
        display="flex"
        flexDirection="column"
        gap="40px"
        marginTop="50px"
        marginLeft="auto"
        marginRight="auto"
        padding="40px"
        marginBottom={5}
      >
        <Box display="flex" flexDirection="column" gap="10px">
          <Text fontWeight="400" as="level2">
            Assesment Participants
          </Text>
          <RadioGroup onChange={setValue} value={value}>
            <Stack direction="row" gap="300px">
              <Radio colorScheme="red" value="Department">
                By Departments
              </Radio>
              <Radio colorScheme="red" value="User">
                By Users
              </Radio>
            </Stack>
          </RadioGroup>
        </Box>
        <Box display="flex" flexDirection="column" gap="2px">
          <Text fontWeight="400" as="level2" marginBottom={5}>
            Choose {value}
          </Text>
          <Box
            background="white"
            paddingTop="10px"
            paddingBottom="10px"
            paddingLeft="30px"
            paddingRight="8px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            borderRadius="4px"
            border="1px"
            borderColor="rgba(0, 0, 0, 0.32)"
            width="328px"
            onClick={() => handleShowDropDown()}
          >
            <input
              type="text"
              value={inputValue}
              placeholder={`${
                display && myValue === value ? display : `Choose a ${value}`
              }`}
              onChange={(e) => setInputValue(e.target.value.toLowerCase())}
              style={{ outline: 'none', color: 'rgba(0, 0, 0, 0.6)' }}
            />
            {icon}
          </Box>
          <ul
            style={
              open
                ? {
                    listStyle: 'none',
                    marginTop: '5px',
                    width: '328px',
                    overflowY: 'auto',
                    maxHeight: '220px',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                  }
                : {
                    listStyle: 'none',
                    marginTop: '5px',
                    width: '328px',
                    overflowY: 'auto',
                    border: '0px',
                    maxHeight: '0px',
                  }
            }
          >
            {value === 'Department' ? (
              <>
                {departments?.map((item) => (
                  <li
                    key={item?.id}
                    style={
                      item?.name.toLowerCase().startsWith(inputValue)
                        ? {
                            display: 'flex',
                            justifyItems: 'center',
                            padding: '8px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                            gap: '20px',
                          }
                        : {
                            display: 'none',
                          }
                    }
                  >
                    <p
                      className="participants_modal"
                      onClick={() => handleChange(item?.id, item?.name, value)}
                    >
                      {item?.name}
                    </p>
                  </li>
                ))}
              </>
            ) : (
              <>
                {users?.map((item) => (
                  <li
                    key={item?.id}
                    style={
                      item?.firstName.toLowerCase().startsWith(inputValue) ||
                      item?.lastName.toLowerCase().startsWith(inputValue)
                        ? {
                            display: 'flex',
                            justifyItems: 'center',
                            padding: '8px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                            gap: '20px',
                          }
                        : {
                            display: 'none',
                          }
                    }
                  >
                    <p
                      className="participants_modal"
                      onClick={() =>
                        handleChange(
                          item?.id,
                          `${item?.firstName} ${item?.lastName}`,
                          value
                        )
                      }
                    >
                      {item?.firstName} {item?.lastName}
                    </p>
                  </li>
                ))}
              </>
            )}
          </ul>
        </Box>
        <Box display="flex" justifyContent="space-between" marginBottom="20px">
          <Button secondary onClick={() => handleCancel()}>
            Cancel
          </Button>
          <Button onClick={handleSave} loadingText="Updating" type="submit">
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CreateParticipants;
