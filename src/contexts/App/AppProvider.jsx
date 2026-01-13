import { createContext, useMemo, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = (props) => {
  const [state, setState] = useState({
    user: null,
    token: null,
    metadata: null,
    examdata: [],
  });
  const value = useMemo(() => [state, setState], [state]);

  return <AppContext.Provider value={value} {...props} />;
};
