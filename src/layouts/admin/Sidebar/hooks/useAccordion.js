import { useState } from "react";

const useAccordion = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    isActive,
    setIsActive,
    handleToggle,
  };
};

export default useAccordion;
