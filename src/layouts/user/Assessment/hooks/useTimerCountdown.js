import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const formatHHMMSS = (totalSeconds) => {
  if (totalSeconds <= 0) {
    return { hours: '00', minutes: '00', seconds: '00' };
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: hours > 0 ? String(hours).padStart(2, '0') : '00',
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const useTimerCountdown = ({
  startDate: _startDate,
  endDate: _endDate,
  duration,
}) => {
  const [hasTimeout, setHasTimeout] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const intervalIdRef = useRef(null);

  const targetTime = useMemo(() => {
    if (_endDate) {
      const endMs = new Date(_endDate).getTime();
      if (!isNaN(endMs) && endMs > 0) return endMs;
    }
    if (_startDate && duration) {
      const startMs = new Date(_startDate).getTime();
      if (!isNaN(startMs) && startMs > 0) {
        return startMs + duration * 60000;
      }
    }
    return null;
  }, [_startDate, _endDate, duration]);

  const handleStopCountdown = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    handleStopCountdown();
    setHasTimeout(false);

    if (!targetTime) {
      setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = targetTime - now;
      const totalSeconds = Math.ceil(diffMs / 1000);

      if (totalSeconds <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        setHasTimeout(true);
        handleStopCountdown();
      } else {
        setTimeLeft(formatHHMMSS(totalSeconds));
      }
    };

    updateTimer();
    intervalIdRef.current = setInterval(updateTimer, 1000);

    return () => handleStopCountdown();
  }, [targetTime, handleStopCountdown]);

  const hasEnded = useMemo(
    () => ({ timeout: hasTimeout }),
    [hasTimeout]
  );

  return {
    timeLeft,
    hasEnded,
    handleStopCountdown,
  };
};

export default useTimerCountdown;
