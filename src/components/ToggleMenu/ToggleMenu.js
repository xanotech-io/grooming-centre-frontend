import React from "react";
import { FaHamburger, FaXbox } from "react-icons/fa";
export const ToggleMenu = ({ icon = true, onClick }) => {
  let hambugar;
  if (icon === true) {
    hambugar = <FaHamburger width="20px" />;
  } else {
    hambugar = <FaXbox />;
  }
  return (
    <div className="hambugar" onClick={onClick}>
      {hambugar}
    </div>
  );
};
