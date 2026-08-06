import { useState } from "react";

const useAccordion = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const open = () => setIsOpen(true);

  return {
    isOpen,
    handleToggle,
    open,
  };
};

export default useAccordion;
