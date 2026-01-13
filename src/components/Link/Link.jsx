import { Link as LinkReactRouterDom, NavLink } from "react-router-dom";
import PropTypes from "prop-types";

export const Link = ({
  activeClassName,
  activeStyle,
  children,
  className,
  disabled,
  exact,
  href,
  navLink,
  style,
  onClick,
}) => {
  const props = {
    children,
    className: `${className}${disabled ? " disabled-link" : ""}`,
    to: href,
    style,
    onClick,
  };

  return navLink ? (
    <NavLink
      activeStyle={activeStyle}
      exact={exact}
      activeClassName={activeClassName}
      {...props}
    />
  ) : (
    <LinkReactRouterDom {...props} />
  );
};

Link.propTypes = {
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
  children: PropTypes.any,
  className: PropTypes.string,
  exact: PropTypes.bool,
  href: PropTypes.string,
  navLink: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  onClick: PropTypes.func,
};
