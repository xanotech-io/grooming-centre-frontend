import { useState } from "react";
import { adminEditCourse } from "../../../../services";
import {capitalizeFirstLetter } from "../../../../utils/formatString";
import { useCache } from "../../../../contexts";
import { useParams, useHistory } from "react-router";
import { useToast } from "@chakra-ui/toast";

const useEditCourseInfo = (courseId) => {

   const { id } = useParams();

   const { handleDelete } = useCache();

  const toast = useToast();
   const history = useHistory();

   const [status, setStatus] = useState({ success: false, err: false });

   const submitEditedCourse = async (data) => {
     try {
       const { message } = await adminEditCourse(id, data);
       handleDelete(id);

       setStatus({ success: true });
       toast({
         description: capitalizeFirstLetter(message),
         position: "top",
         status: "success",
       });
      
          history.push(`/admin/courses/details/${id}/info`);
      
      
     } catch (err) {
       setStatus({ err: true });
       toast({
         description: capitalizeFirstLetter(err.message),
         position: "top",
         status: "error",
       });
     }
   };

  return {
    submitEditedCourse,
    status,
    setStatus,
  };
 }
export default useEditCourseInfo;