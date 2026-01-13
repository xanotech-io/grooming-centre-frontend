import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { userGetAnnouncement } from '../../../services';

const useGetAnnouncements = () => {
  const [announcement, setAnnouncement] = useState([]);

  const fetcher = useCallback(async () => {
    try {
      const { message, announcements } = await userGetAnnouncement();

      setAnnouncement(announcements);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return { announcement };
};

export default useGetAnnouncements;
