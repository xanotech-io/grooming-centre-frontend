import { Button as ButtonChakraui, IconButton } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";

import PropTypes from "prop-types";
import { Link } from "..";

export const Button = ({
  asIcon,
  children,
  disabled,
  ghost,
  blue,
  ordinary,
  iconAriaLabel,
  leftIcon,
  link,
  largeSize,
  rightIcon,
  secondary,
  reversePrimaryColor,
  sm,
  xs,
  isFullwidth,
  onClick,
  ...rest
}) => {
  const getOutlineStyles = () => {
    const commonStyles = {
      backgroundColor: "transparent",
      textColor: "primary.base",
      border: "1px",
      rounded: "4px",
      _hover: !disabled && {
        backgroundColor: "primary.hover",
      },
    };

    return secondary
      ? {
          ...commonStyles,
          _hover: !disabled && {
            backgroundColor: "secondary.1",
          },
        }
      : ghost
      ? {
          ...commonStyles,
          borderColor: "transparent",
          rounded: "none",
          _hover: !disabled && {
            backgroundColor: "secondary.05",
          },
        }
      : blue
      ? {
          ...commonStyles,
          textColor: "white",
          backgroundColor: "others.4",
          _hover: !disabled && {
            opacity: 0.8,
          },
        }
      : ordinary
      ? {
          ...commonStyles,
          backgroundColor: "accent.1",
          color: "accent.3",
          border: "none",
          _hover: !disabled && { opacity: 0.8 },
        }
      : {
          ...commonStyles,
          backgroundColor: "others.3",
          textColor: "white",
          borderColor: "transparent",
        };
  };

  const getButtonSizeStyles = () =>
    sm
      ? {
          paddingX: "28px",
          size: "sm",
        }
      : xs
      ? {
          size: "xs",
        }
      : {
          paddingX: "33px",
        };
  const renderContent = (extraProps) => {
    const styles = asIcon
      ? {
          backgroundColor: ghost ? "transparent" : "white",
          color: reversePrimaryColor ? "white" : "black",
          fontSize: largeSize ? "heading.h3" : "text.level1",
          isRound: true,
          _hover: !disabled && {
            backgroundColor: "primary.hover",
            textColor: "white",
          },
        }
      : getOutlineStyles();

    const props = {
      disabled,
      ...styles,
      ...extraProps,
      ...rest,
    };

    return asIcon ? (
      <IconButton onClick={onClick} aria-label={iconAriaLabel} {...props}>
        {children}
      </IconButton>
    ) : (
      <ButtonChakraui
      
        position="relative"
        {...getButtonSizeStyles()}
        {...props}
        textAlign="center"
        w={isFullwidth}
        onClick={onClick}
      >
        {leftIcon && (
          <Icon
            position="absolute"
            top="50%"
            left="10px"
            transform="translateY(-35%)"
            fontSize="text.level2"
          >
            {leftIcon}
          </Icon>
        )}
        {children}

        {rightIcon && (
          <Icon
            position="absolute"
            top="50%"
            right="2px"
            transform="translateY(-35%)"
            fontSize="text.level2"
          >
            {rightIcon}
          </Icon>
        )}
      </ButtonChakraui>
    );
  };

  return link && !disabled ? (
    <Link href={link}>{renderContent({ tabIndex: -1 })}</Link>
  ) : (
    renderContent()
  );
};

Button.propTypes = {
  asIcon: PropTypes.bool,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  ghost: PropTypes.bool,
  blue: PropTypes.bool,
  ordinary: PropTypes.bool,
  iconAriaLabel: PropTypes.string,
  link: PropTypes.string,
  leftIcon: PropTypes.any,
  secondary: PropTypes.bool,
  sm: PropTypes.bool,
  xs: PropTypes.bool,
  largeSize: PropTypes.bool,
  reversePrimaryColor: PropTypes.bool,
  rightIcon: PropTypes.any,
};
