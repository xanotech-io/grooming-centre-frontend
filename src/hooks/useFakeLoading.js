import { useEffect, useState } from "react";

/**
 * Fake a loading state
 * @param {number} minMilliseconds - default `500`
 * @returns isLoading: `boolean`
 */
export const useFakeLoading = (minMilliseconds = 500) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const maxMilliseconds = 1000 + minMilliseconds;

    setTimeout(() => {
      setIsLoading(false);
    }, Math.floor(Math.random() * maxMilliseconds + minMilliseconds));
  }, [minMilliseconds]);

  return isLoading;
};
