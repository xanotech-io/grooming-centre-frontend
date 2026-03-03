import { endedDates, ongoingDates, upcomingDates } from "../course/responses";

export const userGetEventListingRes = {
  data: [
    {
      ...endedDates,
      id: "eventId_1",
      title: "Video Conference",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?`,
      departmentId: "departmentId_1",
      eventLink: "http://localhost:4000/courses",
      eventPassword: "password",
    },
    {
      ...ongoingDates,
      id: "eventId_2",
      title: "Live Stream",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?`,
      departmentId: "departmentId_2",
      eventLink: "http://localhost:4000/courses",
      eventPassword: "password",
    },
    {
      ...upcomingDates,
      id: "eventId_3",
      title: "Mock Event",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit.`,
      departmentId: "departmentId_2",
    },
  ],
};

export const adminGetEventListingRes = {
  data: [
    {
      ...endedDates,
      id: "eventId_1",
      title: "Admin Video Conference",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?
      `,
      departmentId: "departmentId_1",
      eventAttendeesCount: 10,
    },
    {
      ...ongoingDates,
      id: "eventId_2",
      title: "Live Stream",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima voluptatum
      velit mollitia dolorem facilis suscipit cumque, molestias ut ex magni
      natus laudantium totam quisquam odit consectetur reprehenderit non quae
      vitae?`,
      departmentId: "departmentId_2",
      eventAttendeesCount: 340,
    },
    {
      ...upcomingDates,
      id: "eventId_3",
      title: "Mock Event (Admin)",
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit.`,
      departmentId: "departmentId_2",
      eventAttendeesCount: 2323,
      coverImage:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=869&q=80",
    },
  ],
};

export const adminCreateEventRes = {
  message: "event created successfully",
};

export const adminEditEventRes = {
  message: "event updated successfully",
};

export const userJoinEventRes = {
  message: "event attendee record created successfully",
};
