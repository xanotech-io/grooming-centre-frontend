import { http } from "../http";
import { hasEnded, isOngoing } from "../../../utils";
import { userGetCourseListing } from "./course";
import { userGetEventListing } from "./event";

const getStatusText = (appointment) => {
  if (isOngoing(appointment.startTime, appointment.endTime)) {
    return "(Ongoing)";
  }
  if (hasEnded(appointment.endTime)) {
    return "(Completed)";
  }

  return "(Upcoming)";
};

const appointmentsMapper =
  (context = "EVENT") =>
  (appointment) => ({
    id: appointment.id,
    startDate: appointment.startTime,
    endDate: appointment.endTime,
    title: `${context}: ${appointment.title} ${getStatusText(appointment)}`,
  });

/**
 * Endpoint to get all appointments for a day
 * @param {Date} date - date to get appointments for day
 *
 * @returns {Promise<{ appointments: Array<{ id: string, title: string, startDate: Date, endDate: Date }>>}
 */
export const userGetDayAppointments = async (date) => {
  const path = `/schedule`;

  const {
    data: { data },
  } = await http.get(path, { params: { date } });

  const appointments = [
    ...data.events.map(appointmentsMapper()),
    ...data.lessons.map(appointmentsMapper("LESSON")),
  ];

  const appointmentsCount = { events: data.events.length, lessons: data.lessons.length }

  return { appointments, appointmentsCount };
};

/**
 * Endpoint to get all appointments for courses and events
 *
 * @returns {Promise<{ appointments: Array<{ id: string, title: string, startDate: Date, endDate: Date }>>}
 */
export const userGetMonthAppointments = async () => {
  // const [c, e]
  const [{ courses }, { events }] = await Promise.all([
    userGetCourseListing(),
    userGetEventListing(),
  ]);

  const appointments = [
    ...courses.map(appointmentsMapper("COURSE")),
    ...events.map((e) => ({ ...e, title: e.name })).map(appointmentsMapper()),
  ];

  return {
    // appointments: [
    //   {
    //     title: "EVENT: Meeting with client",
    //     startDate: new Date(new Date().getTime() + 8.64e7 * 2),
    //     endDate: new Date(new Date().getTime() + 8.64e7 * 3),
    //     id: 0,
    //   },
    //   {
    //     title: "COURSE: The Best Course Ever",
    //     startDate: new Date(),
    //     endDate: new Date(new Date().getTime() + 8.64e7),
    //     id: 2,
    //   },
    // ],
    appointments,
  };
};
