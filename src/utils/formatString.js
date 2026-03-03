/**
 * Capitalize only the `first letter` of the string.
 * @param {string} string
 *
 * @returns {string}
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Capitalize `all words` of a string.
 * @param {string} string
 *
 * @returns {string}
 */
export function capitalizeWords(string) {
  return string.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}

/**
 * @param {{ firstName: string, lastName: string }} string
 *
 * @returns {string}
 */
export function getFullName(user) {
  return !(user?.firstName || user?.lastName)
    ? "anonymous"
    : `${user?.firstName} ${user?.lastName}`;
}

/**
 * format fullName to `username`
 * @param {string} fullName
 *
 * @returns {string}
 */
export function formatToUsername(fullName) {
  return `@${fullName.replace(" ", "_")}`;
}

/**
 * format Date to ISO 8601 format
 * @param {Date}
 *
 * @returns {Date}
 */
export function formatDateToISO(date) {
  return new Date(date).toISOString();
}
