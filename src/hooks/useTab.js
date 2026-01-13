import { useEffect, useState } from "react";
import { useQueryParams } from ".";

export const useTab = () => {
  const [currentTab, setCurrentTab] = useState("");
  const tabQuery = useQueryParams().get("tab");

  // Initial currentTab
  useEffect(() => {
    setCurrentTab(tabQuery);
  }, [tabQuery]);

  return {
    currentTab,
    setCurrentTab,
  };
};
