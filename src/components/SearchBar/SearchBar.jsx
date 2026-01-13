import { IconButton } from "@chakra-ui/button";
import { Flex } from "@chakra-ui/layout";
import VisuallyHidden from "@chakra-ui/visually-hidden";
import { BsSearch } from "react-icons/bs";
import { Input } from "..";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";

export const SearchBar = ({
  adminLayoutHeaderStyle,
  placeholder = "Search Courses",
  sm,
  fontSize,
  onSearch,
  onClear,
  onClick,
  ...rest
}) => {
  adminLayoutHeaderStyle = adminLayoutHeaderStyle
    ? {
        backgroundColor: "secondary.7",
        textColor: "white",
        rounded: "2rem",
        border: "none",
      }
    : {};

  const inputId = uuid();

  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ query }) => {
    onSearch?.(query);
  };

  return (
    <Flex
      as="form"
      border="1px"
      backgroundColor="white"
      textColor="accent.3"
      rounded="4px"
      overflow="hidden"
      height={sm ? "33px" : "auto"}
      onSubmit={handleSubmit(onSubmit)}
      {...adminLayoutHeaderStyle}
      {...rest}
    >
      <VisuallyHidden as="label" htmlFor="search">
        Search Courses
      </VisuallyHidden>
      <Input
        border="none"
        type="search"
        onInput={(e) => e.target.value === "" && onClear?.()}
        onClick={onClick}
        placeholder={placeholder}
        paddingLeft={2}
        size={sm && "sm"}
        id={inputId}
        fontSize={fontSize}
        _focus={{
          transform: "scale(1.01)",
          "&::placeholder": {
            textColor: "black",
          },
        }}
        {...register("query", { validate: true })}
      />

      <IconButton
        size={sm && "sm"}
        _focus={{
          fontSize: "20px",
          textColor: "primary.base",
          backgroundColor: "secondary.1",
        }}
        _hover={
          adminLayoutHeaderStyle && {
            backgroundColor: "secondary.6",
          }
        }
        rounded="none"
        variant="ghost"
        width="60px"
        order={-1}
        type="submit"
      >
        <BsSearch />
      </IconButton>
    </Flex>
  );
};

SearchBar.propTypes = {
  adminLayoutHeaderStyle: PropTypes.bool,
  placeholder: PropTypes.string,
  sm: PropTypes.bool,
  fontSize: PropTypes.string,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  onClick: PropTypes.func,
};
