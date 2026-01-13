import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { requestCertificateDetails } from "../../../../services";
import { useCache } from "../../../../contexts";
import useComponentIsMount from "../../../../hooks/useComponentIsMount";

const useCertificateDetails = () => {
  const { handleGetOrSetAndGet } = useCache();
  const componentIsMount = useComponentIsMount();
  const { course_id, id: user_id } = useParams();
  console.log(user_id);
  console.log(course_id);
  const [certificateDetails, setCertificateDetails] = useState({
    data: null,
    loading: false,
    err: null,
  });
  const isAdmin = /admin/i.test(window.location.pathname);
  const fetcher = useCallback(async () => {
    const { certificate } = await requestCertificateDetails(
      course_id,
      user_id,
      isAdmin
    );

    return certificate;
  }, [course_id]);
  const fetchCertificateDetails = useCallback(async () => {
    setCertificateDetails({ loading: true });

    try {
      const certificateDetails = await handleGetOrSetAndGet(course_id, fetcher);

      console.log(certificateDetails);

      if (componentIsMount) setCertificateDetails({ data: certificateDetails });
    } catch (err) {
      if (componentIsMount) setCertificateDetails({ err: err.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course_id, componentIsMount]);

  useEffect(() => {
    fetchCertificateDetails();
  }, [fetchCertificateDetails]);

  const certificate = certificateDetails.data;
  const isLoading = certificateDetails.loading;
  const error = certificateDetails.err;

  return {
    certificate,
    isLoading,
    error,
  };
};

export default useCertificateDetails;
