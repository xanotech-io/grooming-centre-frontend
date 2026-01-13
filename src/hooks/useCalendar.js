import { useCallback, useEffect, useMemo } from "react";
import { useDateTimePicker, useFetchAndCache } from ".";
import { userGetDayAppointments, userGetMonthAppointments } from "../services";
import { getServerDateNow } from "../utils";

export const useDaySchedule = () => {
  const initDate = useMemo(() => new Date(getServerDateNow()), []);
  const dateManager = useDateTimePicker(initDate);

  const { resource, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(
    (date) => async () => {
      const { appointments, appointmentsCount } = await userGetDayAppointments(date);
      return { appointments, appointmentsCount };
    },
    []
  );

  const handleFetch = useCallback(() => {
    handleFetchResource({
      cacheKey: "dayAppointments",
      fetcher: fetcher(new Date(initDate).toISOString()),
    });
  }, [fetcher, handleFetchResource, initDate]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  useEffect(() => {
    if (initDate.getTime() !== new Date(dateManager.value).getTime()) {
      handleFetchResource({
        cacheKey: "dayAppointments",
        fetcher: fetcher(new Date(dateManager.value).toISOString()),
        bypass: true,
      });
    }
  }, [dateManager.value, fetcher, handleFetchResource, initDate]);

  return { dateManager, resource, handleFetch };
};

export const useMonthSchedule = () => {
  const { resource, handleFetchResource } = useFetchAndCache();

  const fetcher = useCallback(async () => {
    const { appointments } = await userGetMonthAppointments();
    return appointments;
  }, []);

  const handleFetch = useCallback(() => {
    handleFetchResource({
      cacheKey: "monthAppointments",
      fetcher,
    });
  }, [fetcher, handleFetchResource]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return { resource, handleFetch };
};
