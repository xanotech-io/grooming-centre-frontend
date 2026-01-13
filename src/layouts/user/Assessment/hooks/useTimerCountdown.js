import { useEffect, useMemo, useRef, useState } from 'react';
import { getEndTime } from '../../../../utils';
import { getServerDateNow } from '../../../../utils/DateNow';

const getLateEndDate = (startTime, endTime) => {
  const now = new Date(getServerDateNow());
  const duration = (new Date(endTime).getTime() - now.getTime()) / 1000 / 60;
  const newEndDate = new Date(getEndTime(startTime, duration));

  return newEndDate;
};

const useTimerCountdown = ({
  startDate: _startDate,
  endDate: _endDate,
  // duration
}) => {
  const [startDate, setStartDate] = useState();

  // Reduce EndDate due to late coming (The Lower the EndDate the Lower the `Timer`)
  const endDate = useMemo(
    () => _endDate && startDate && getLateEndDate(startDate, _endDate),
    [_endDate, startDate]
  );

  const [startCountDown, setStartCountDown] = useState(false);
  const [hasTimeout, setHasTimeout] = useState(false);

  const [hasEnded, setHasEnded] = useState({
    timeout: false,
  });

  // Checks if the assessment can be taken
  useEffect(() => {
    if (hasTimeout) {
      setHasEnded({ timeout: true });
    }
  }, [hasTimeout]);

  // Initialize startDate
  useEffect(() => {
    if (_startDate) setStartDate(new Date(_startDate));
  }, [_startDate]);

  // Triggers countdown
  useEffect(() => {
    if (endDate === undefined) return setStartCountDown(false);

    if (startDate && !hasEnded.timeout) {
      setStartCountDown(true);
    } else {
      setStartCountDown(false);
    }
  }, [hasEnded.timeout, startDate, endDate]);

  const [timeLeft, setTimeLeft] = useState({});

  const getDateDifferenceInHHMMSS = (date1, date2) => {
    let distance = Math.abs(date1 - date2);
    const hours = Math.floor(distance / 3600000);
    distance -= hours * 3600000;
    const minutes = Math.floor(distance / 60000);
    distance -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);

    return {
      hours: hours || '00',
      minutes: /an/i.test(('0' + minutes).slice(-2))
        ? '00'
        : ('0' + minutes).slice(-2),
      seconds: /an/i.test(('0' + seconds).slice(-2))
        ? '00'
        : ('0' + seconds).slice(-2),
    };
  };

  const timeLeftHMS = getDateDifferenceInHHMMSS(startDate, endDate);

  // Sets the state `timeLeft`
  useEffect(() => {
    setTimeLeft(timeLeftHMS);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftHMS.hours, timeLeftHMS.minutes, timeLeftHMS.seconds]);

  const intervalIdRef = useRef();
  const handleStopCountdown = () => clearInterval(intervalIdRef.current);

  // Implements countdown
  useEffect(() => {
    if (startCountDown) {
      intervalIdRef.current = setInterval(() => {
        setStartDate((prev) => {
          if (
            +timeLeftHMS.hours === 0 &&
            +timeLeftHMS.minutes === 0 &&
            +timeLeftHMS.seconds - 1 === 0
          ) {
            setHasTimeout(true);
          }

          return new Date(prev.getTime() + 1000);
        });
      }, 1000);

      return () => handleStopCountdown();
    } else {
      handleStopCountdown();
    }
  }, [
    startCountDown,
    timeLeftHMS.hours,
    timeLeftHMS.minutes,
    timeLeftHMS.seconds,
  ]);

  return {
    timeLeft,
    hasEnded,
    handleStopCountdown,
  };
};

export default useTimerCountdown;
