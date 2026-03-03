import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import fileDownload from "js-file-download";
import { useState } from "react";

export const useDownload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toastBread = useToast();

  const handleDownload = (url, filename) => () => {
    setIsLoading(true);
    axios
      .get(url, {
        responseType: "blob",
      })
      .then((res) => {
        fileDownload(res.data, filename);
      })
      .catch((err) => {
        console.error(err);
        toastBread({
          description: "Something went wrong while downloading file",
          position: "top",
          status: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { isLoading, handleDownload };
};
