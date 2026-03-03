import { createContext, useMemo, useState } from "react";

export const CacheContext = createContext();

export const CacheProvider = (props) => {
  const [state, setState] = useState({});
  const value = useMemo(() => [state, setState], [state]);

  return <CacheContext.Provider value={value} {...props} />;
};
