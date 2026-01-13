import { getServerDateNow } from ".";

/**
 * Formats `duration` to  Hours and Minutes, given the `durationNumber` in Minutes
 *
 * @param {number} number - in minutes
 * @returns {{hours: number, minutes: number, combinedText: string}}
 */
export function getDuration(number) {
  const tempHours = number / 60;
  const hours = Math.floor(tempHours);
  const tempMinutes = (tempHours - hours) * 60;
  const minutes = Math.round(tempMinutes);

  const getSCharacter = (x) => (!(x <= 1) ? "s" : "");

  const combinedText = `${
    hours ? `${hours} hour${getSCharacter(hours)} ` : ""
  } ${minutes ? `${minutes} minute${getSCharacter(minutes)}` : ""}`;

  return { hours, minutes, combinedText };
}

/**
 * Get endTime given the `startTime` and `duration` (in Minutes)
 *
 * @param {Date} startTime
 * @param {number} duration
 *
 * @returns {Date}
 */
export const getEndTime = (startTime, duration) =>
  new Date(new Date(startTime).getTime() + duration * 60000).toISOString();

/**
 * Get `duration` (in Minutes) given the `startTime` and `endTime`
 *
 * @param {Date} startTime
 * @param {Date} endTime
 *
 * @returns {number} - duration
 */

export const getDurationBetweenStartTimeAndEndTime = (startTime, endTime) => {
  const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

  return duration / 1000 / 60;
};

/**
 * @param {Date} endTime
 *
 * @returns {boolean}
 */
export const hasEnded = (endTime) =>
  getServerDateNow() > new Date(endTime).getTime();

/**
 * @param {Date} startTime
 *
 * @returns {boolean}
 */
export const isUpcoming = (startTime) =>
  new Date(startTime).getTime() > getServerDateNow();

/**
 * @param {Date} startTime
 * @param {Date} endTime
 *
 * @returns {boolean}
 */
export const isOngoing = (startTime, endTime) =>
  getServerDateNow() > new Date(startTime) && !hasEnded(endTime);
