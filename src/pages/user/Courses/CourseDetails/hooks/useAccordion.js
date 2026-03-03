import { useState } from "react";

/**
 * Accordion state manager
 * @param {boolean} initialState - default `true`
 * @returns - { isOpen: `boolean`, handleClose: `Function`, handleOpen: `Function`, handleToggle: `Function` }
 */
const useAccordion = (initialState = true) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    handleClose,
    handleOpen,
    handleToggle,
  };
};

export default useAccordion;
