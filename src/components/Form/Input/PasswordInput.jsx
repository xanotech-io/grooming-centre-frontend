import { forwardRef, useState } from "react";
import { Input } from "./Input";
import { Box, Button } from "@chakra-ui/react";
import { Visibility, VisibilityOff } from "@material-ui/icons";

export const PasswordInput = forwardRef((props, ref) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow((show) => !show);

  return (
    <Box position="relative" height="fit-content">
      <Input ref={ref} {...props} type={show ? "text" : "password"} />
      <Button
        position="absolute"
        right={1}
        bottom={1}
        variant="ghost"
        _hover={{ bg: "white" }}
        _active={{ bg: "white" }}
        size="sm"
        onClick={handleClick}
      >
        {show ? <VisibilityOff /> : <Visibility />}
      </Button>
    </Box>
  );
});
