import { useCallback, useEffect, useState } from 'react';
import { useComponentIsMount, useQueryParams } from '../../../hooks';
import { useCache } from '../../../contexts';
import { adminGetAnnouncement } from '../../../services';

const useAnnoucement = () => {
  const id = useQueryParams().get('announcement');

  const [announcementDetails, setAnnouncementDetails] = useState([]);

  const fetcher = useCallback(async () => {
    try {
      const { announcement } = await adminGetAnnouncement(id);
      setAnnouncementDetails(announcement);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return {
    announcementDetails,
  };
};

export default useAnnoucement;
