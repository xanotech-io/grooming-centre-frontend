import useTimerCountdown from '../../../layouts/user/Assessment/hooks/useTimerCountdown';

const useStandaloneTimer = ({ startDate, duration, endDate }) => {
  return useTimerCountdown({
    startDate,
    endDate,
    duration,
  });
};

export default useStandaloneTimer;
