import axios from 'axios';
import AppError from './AppError';

// Intercept all Errors
axios.interceptors.response.use(null, (err) => {
  const error = new AppError(err);

  return Promise.reject(error);
});

<<<<<<< HEAD
export const baseURL = 'http://52.228.43.176:8089/api/v1';
// 'https://privateapi.groomingcentre.net/api/v1';
=======
export const baseURL = 'http://52.228.43.176:8089';
>>>>>>> a91ed591fb8e3310c6514836fa1ea8f868337bf1
const token = localStorage.getItem('token');

const defaultOptions = (explicitToken = token) => ({
  // timeout's the request in 10 minute by default
  timeout: 60 * 10 * 1000, // TODO: 10 minutes might be too long, make to about 3-4 minutes
  // withCredentials: true,
  // credentials: "include",
  headers: {
    authorization: `Bearer ${explicitToken}`,
  },
});

const buildOptions = (options) => ({
  ...defaultOptions(options?.token),
  ...options,
});
const buildURL = (path) => {
  return baseURL + path;
};

export const http = {
  get: (path, options) =>
    axios.get(options?.url || buildURL(path), buildOptions(options)),
  post: (path, data, options) =>
    axios.post(options?.url || buildURL(path), data, buildOptions(options)),
  patch: (path, data, options) =>
    axios.patch(options?.url || buildURL(path), data, buildOptions(options)),
  delete: (path, options) =>
    axios.delete(options?.url || buildURL(path), buildOptions(options)),
};
