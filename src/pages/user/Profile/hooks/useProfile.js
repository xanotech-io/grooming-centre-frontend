import { useCallback, useEffect } from 'react';
import { useFetchAndCache } from '../../../../hooks';
import { requestMyData } from '../../../../services';

const useProfile = () => {
    const { resource: profile, handleFetchResource } = useFetchAndCache();

    const fetcher = useCallback(async () => {
        const { data } = await requestMyData();
        return data;
    }, []);

    useEffect(() => {
        handleFetchResource({ cacheKey: 'userProfile', fetcher });
    }, [handleFetchResource, fetcher]);

    return {
        profile,
    };
};

export default useProfile;
