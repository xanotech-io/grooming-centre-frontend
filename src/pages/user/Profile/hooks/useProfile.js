import { useCallback, useEffect } from 'react';
import { useFetchAndCache } from '../../../../hooks';
import { requestMyData } from '../../../../services';

const useProfile = () => {
    const { resource: profile, handleFetchResource } = useFetchAndCache();

    const fetcher = useCallback(async () => {
        console.log('Profile fetcher called');
        const { data } = await requestMyData();
        console.log('Profile data received:', data);
        return data;
    }, []);

    useEffect(() => {
        console.log('useProfile useEffect triggered');
        handleFetchResource({ cacheKey: 'userProfile', fetcher });
    }, [handleFetchResource, fetcher]);

    console.log('useProfile hook - profile state:', profile);

    return {
        profile,
    };
};

export default useProfile;
