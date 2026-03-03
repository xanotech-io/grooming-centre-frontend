import { endedDates, ongoingDates } from "../course/responses";

export const userGetDayAppointmentsRes = {
  data: {
    events: [
      {
        startTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 7),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 10),
        id: "eventId_1",
        title: "Video Conference",
      },
      {
        startTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 5),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000 * 6),
        id: "eventId_2",
        title: "Live Stream",
      },
    ],
    lessons: [
      {
        ...ongoingDates,
        id: "lessonId_1",
        title: "The Best DS and Algo section",
      },
      {
        ...endedDates,
        id: "lessonId_2",
        title: "The Algo Expert",
      },
    ],
  },
};
