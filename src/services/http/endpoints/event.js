import { http } from '../http';

/**
 * Endpoint to get user event listing
 *
 * @returns {Promise<{ events: Array<{ id: string, description: string, name: string, startTime: Date, endTime: Date, departmentId: string }> }>}
 */
export const userGetEventListing = async () => {
  const path = `/events/upcoming`;

  const {
    data: { data },
  } = await http.get(path);

  const events = data.map((event) => ({
    id: event.id,
    displayId: event.displayId,
    startTime: event.startTime,
    endTime: event.endTime,
    name: event.title,
    description: event.description,
    departmentId: event.departmentId,
    link: event.eventLink,
    password: event.eventPassword,
  }));

  return { events };
};

/**
 * Endpoint to user to join an event
 * @param {string} eventId
 *
 * @returns {Promise<void>}
 */
export const userJoinEvent = async (eventId) => {
  const path = `/event-attendance/create/${eventId}`;

  await http.post(path);
};

/**
 * Endpoint for admin to get event listing
 * @param {object} params
 *
 * @returns {Promise<{ events: Array<{ id: string, description: string, name: string, startTime: Date, endTime: Date, departmentId: string }> }>}
 */
export const adminGetEventListing = async (params) => {
  const path = `/events/all`;

  const {
    data: { data },
  } = await http.get(path, { params });

  const events = data.map((event) => ({
    id: event.id,
    displayId: event.displayId,
    startTime: event.startTime,
    endTime: event.endTime,
    name: event.title,
    description: event.description,
    departmentId: event.departmentId,
    coverImage: event.coverImage,
    attendeesCount: event.eventAttendeesCount || 0,
  }));

  return { events };
};

/**
 * Endpoint for admin to create a event
 * @param {object} body
 *
 * @returns {Promise<{ message: string }>}
 */
export const adminCreateEvent = async (body) => {
  const path = `/events/create`;

  const {
    data: { message },
  } = await http.post(path, body);

  return { message };
};

/**
 * Endpoint for admin to modify a event
 * @param {string} eventId
 * @param {object} body
 *
 * @returns {Promise<{ message: string }>}
 */
export const adminEditEvent = async (eventId, body) => {
  const path = `/events/edit/${eventId}`;

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};
