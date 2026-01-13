import { useRef } from "react";

/**
 * - fires `cb` when the user has stop for about a second
 * - Don't use the `handleType` direct to handle the input value state management because it's slow :)
 * - Use the `cb` instead to update the input value
 *
 * @returns {{ handleType: (event: InputEvent, cb: (event: InputEvent) => void, interval: ?number) => void }}
 */
export const useDebounceTyping = () => {
  const typeTimeoutRef = useRef();

  const handleType = async (event, cb, interval = 1000) => {
    // Clear the timeout if it has already been set.
    // This will prevent the previous task from executing
    // if it has been less than <MILLISECONDS>
    clearTimeout(typeTimeoutRef.current);

    // Make a new timeout set to go off in 1000ms (1 second)
    typeTimeoutRef.current = setTimeout(function () {
      cb(event);
    }, interval);
  };

  return {
    handleType,
  };
};
