import { Box, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';

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

const Participants = () => {
  const [value, setValue] = useState('1');
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState(<BiChevronDown size={20} />);
  const [inputValue, setInputValue] = useState('');

  const handleShowDropDown = () => {
    setOpen((prev) => !prev);
    if (open === true) {
      setIcon(<BiChevronUp size={20} />);
    } else {
      setIcon(<BiChevronDown size={20} />);
    }
  };
  return (
    <Box
      backgroundColor="#fff"
      borderRadius={5}
      height={442}
      width={864}
      margin="auto"
      paddingTop={4}
      paddingLeft={4}
      gap={5}
      marginBottom={5}
    >
      <Text fontWeight="400" as="level2" marginBottom={5}>
        Assesment Participants
      </Text>
      <RadioGroup onChange={setValue} value={value}>
        <Stack direction="row" gap="300px">
          <Radio colorScheme="red" value="1">
            By Departments
          </Radio>
          <Radio colorScheme="red" value="2">
            By Users
          </Radio>
        </Stack>
      </RadioGroup>
      <Text fontWeight="400" as="level2" marginBottom={5} marginTop={9}>
        Choose Departments
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
          placeholder="Choose a Department"
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
        {departmentProps.map((value) => (
          <li
            key={value.id}
            style={
              value.name.toLowerCase().startsWith(inputValue)
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
            <input type="checkbox" />
            <p>{value.name}</p>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default Participants;
