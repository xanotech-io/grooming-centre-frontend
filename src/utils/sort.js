import { hasEnded } from ".";

/**
 * sorts by the index field
 * @param {*} arrayKey
 * @param {*} field
 * @returns {Array}
 */
export const sortByIndexField = (array, field) =>
  array
    ? [...array].sort((a, b) => {
        if (a[field] > b[field]) return 1;
        if (a[field] <= b[field]) return -1;
        return -1;
      })
    : [];

/**
 * sorts by most relevant date : `Ongoing`, then `Upcoming` before `Ended` elements
 * @param {Array<{ startTime: Date, endTime: Date }>} array
 * @returns {Array}
 */
export const sortByMostRelevantDate = (array) => {
  let newArray = [...array].sort((a, b) => {
    if (new Date(a.endTime).getTime() < new Date(b.endTime).getTime()) return 1;

    if (new Date(a.endTime).getTime() > new Date(b.endTime).getTime())
      return -1;

    return -1;
  });

  const endedElements = [];

  const filterOutEndedElements = array.filter((event) => {
    if (hasEnded(event.endTime)) {
      endedElements.push(event);
    }

    return !hasEnded(event.endTime);
  });

  filterOutEndedElements.sort((a, b) => {
    if (new Date(a.endTime).getTime() < new Date(b.endTime).getTime())
      return -1;

    if (new Date(a.endTime).getTime() > new Date(b.endTime).getTime()) return 1;

    return 1;
  });

  newArray = [...filterOutEndedElements, ...endedElements];

  return newArray;
};
