import { createContext, useMemo, useState } from 'react';

export const TakeCourseContext = createContext();

export const TakeCourseProvider = (props) => {
  const [state, setState] = useState({
    data: null,
    err: null,
    isLoading: false,
  });
  const value = useMemo(() => [state, setState], [state]);

  return <TakeCourseContext.Provider value={value} {...props} />;
};
