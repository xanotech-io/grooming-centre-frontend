import { baseURL } from "../../services/http/http";

/**
 * combines the `baseURL` to the backend API server, with `path` to hit a endpoint
 * @param {string} path
 * @returns `string` - `baseURL`+`path`
 */
export const getUrl = (path) => `${baseURL}${path}`;
