import { useToast } from "@chakra-ui/toast";
import { useCallback, useEffect, useState } from "react";
import { useDebounceTyping, useFetch } from "../../../../../hooks";
import { userForumGetUsernames } from "../../../../../services";
import { capitalizeFirstLetter } from "../../../../../utils";

export const useMentioning = ({
  watch,
  setValue,
  getValues,
  inputName,
  inputId,
}) => {
  const toast = useToast();

  const [matchedTypedUserNames, setMatchedTypedUserNames] = useState([]);
  const [shadowTypedUserNames, setShadowTypedUserNames] = useState([]);
  const [currentEditingUsername, setCurrentEditingUsername] = useState(null);

  const {
    resource: usernameResults,
    handleFetchResource: handleFetchUsernameResults,
    handleClearResource: handleClearUsernameResults,
  } = useFetch();

  const debounce = useDebounceTyping();
  useEffect(() => {
    const subscription = watch((data) => {
      handleClearUsernameResults();

      const matched =
        data[inputName]
          ?.match(/^((.){0,}(\s))?(@)([\da-z_]){1,}/gim)?.[0]
          ?.match(/(@)([\da-z_]){1,}/gim)
          ?.map((m) => m.replace("@", "")) || [];

      setMatchedTypedUserNames(matched);
    });

    return () => subscription.unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const handleShadowing = () => {
    if (!matchedTypedUserNames.length) setCurrentEditingUsername(null);

    matchedTypedUserNames.forEach((m, index) => {
      if (shadowTypedUserNames[index] !== m) {
        debounce.handleType(null, () => setCurrentEditingUsername(m));
      }
    });

    setShadowTypedUserNames(matchedTypedUserNames);
  };

  const handleAutoComplete = (username) => {
    setValue(
      inputName,
      getValues(inputName).replace(
        new RegExp(`@${currentEditingUsername}`, "gm"),
        `@${username.name}`
      )
    );
  };

  // const handleInputFocus = () => {
  //   // console.log(document.getElementById(`${inputName}`), inputName);
  //   document.getElementById(`${inputId}`).focus();
  // };

  const handleUserNameSelect = (username) => {
    handleClearUsernameResults();
    setCurrentEditingUsername();
    handleAutoComplete(username);
    // handleInputFocus();
  };

  const fetchUsernameResults = useCallback(
    async () =>
      await (
        await userForumGetUsernames({
          username: currentEditingUsername,
        })
      ).usernames,
    [currentEditingUsername]
  );

  useEffect(() => {
    if (currentEditingUsername) {
      handleFetchUsernameResults({ fetcher: fetchUsernameResults });
    }
  }, [
    currentEditingUsername,
    fetchUsernameResults,
    handleFetchUsernameResults,
  ]);

  useEffect(() => {
    if (usernameResults.err)
      toast({
        description: capitalizeFirstLetter(usernameResults.err),
        position: "top",
        status: "error",
      });
  }, [toast, usernameResults.err]);

  return {
    handleKeyUp: handleShadowing,
    handleUserNameSelect,
    handleClearUsernameResults,
    usernameResults: usernameResults.data,
  };
};
