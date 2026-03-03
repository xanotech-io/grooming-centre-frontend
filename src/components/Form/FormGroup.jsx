import { FormControl, FormLabel } from "@chakra-ui/form-control";
import Icon from "@chakra-ui/icon";
import { Flex } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import PropTypes from "prop-types";
import { AiFillQuestionCircle } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { Spinner, Text } from "..";

const FormGroup = ({
  id,
  isRequired,
  isLoading,
  label,
  renderControl,
  error,
  tooltip,
  rest = {},
}) => {
  return (
    <FormControl
      id={id}
      display="flex"
      flexDirection="column"
      position="relative"
      {...rest}
    >
      {label && (
        <FormLabel fontSize="text.level2" display="flex">
          {label}
          {isRequired && (
            <Icon color="red.300" fontSize="heading.h3">
              <BsDot />
            </Icon>
          )}

          {tooltip && (
            <Tooltip label={tooltip}>
              <Icon
                fontSize="heading.h3"
                color="accent.7"
                transform="translateY(3px)"
              >
                <AiFillQuestionCircle />
              </Icon>
            </Tooltip>
          )}
        </FormLabel>
      )}
      <Flex alignItems="center">
        {renderControl({
          rounded: "4px",
          borderColor: "accent.2",
          disabled: isLoading,
        })}

        {isLoading && <Spinner size="md" position="absolute" right={30} />}
      </Flex>

      {error && (
        <Text
          position="absolute"
          bottom={-5}
          color="secondary.5"
          style={{ marginTop: 0 }}
        >
          {error}
        </Text>
      )}
    </FormControl>
  );
};

export const FormGroupPropTypes = {
  renderControl: PropTypes.func,
  id: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  tooltip: PropTypes.any,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

FormGroup.propTypes = FormGroupPropTypes;

export default FormGroup;
