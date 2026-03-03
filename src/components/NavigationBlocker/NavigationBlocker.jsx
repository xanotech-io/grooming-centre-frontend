import PropTypes from "prop-types";
import { useEffect } from "react";
import { Prompt } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
export const NavigationBlocker = (props) => {

  useEffect(() => {
   
    if (props.when) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
   
  }, [props.when]);

  return  props.disable===false?null:<Prompt when={props.when} message="Are you sure you want to leave here?" />;
};

NavigationBlocker.propTypes = {
  when: PropTypes.bool,
};
