import { useCallback, useEffect, useState } from 'react';
import { useFetch } from './useFetch';
import { adminGetWorkflowSupervisors, adminSubmitWorkflow } from '../services';

export const useWorkflowReview = () => {
  const [requestReview, setRequestReview] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');

  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { supervisors } = await adminGetWorkflowSupervisors();
    return supervisors;
  }, []);

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [handleFetchResource, fetcher]);

  const supervisors = resource.data ?? [];
  const supervisorsLoading = resource.loading;
  const supervisorsError = resource.err;

  const submitWorkflowIfRequested = async ({
    contentId,
    contentTitle,
    requestType,
    description,
    attachmentUrl,
  }) => {
    if (!requestReview) return;

    const payload = {
      request_type: requestType,
      content_id: contentId,
      content_title: contentTitle,
      description: description ?? '',
    };

    if (selectedSupervisorId) payload.supervisor_id = selectedSupervisorId;
    if (attachmentUrl) payload.attachment_url = attachmentUrl;

    await adminSubmitWorkflow(payload);
  };

  return {
    requestReview,
    setRequestReview,
    selectedSupervisorId,
    setSelectedSupervisorId,
    supervisors,
    supervisorsLoading,
    supervisorsError,
    submitWorkflowIfRequested,
  };
};
