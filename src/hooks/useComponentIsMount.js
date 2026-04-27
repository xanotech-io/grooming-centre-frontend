import { useEffect, useRef } from 'react';

export const useComponentIsMount = () => {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};

export default useComponentIsMount;
