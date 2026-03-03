import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  userGetEventListingRes,
  adminCreateEventRes,
  adminGetEventListingRes,
  adminEditEventRes,
  userJoinEventRes,
} from "./responses";

const userGetEventListing = rest.get(
  getUrl("/events/upcoming"),
  handleSuccessResponse(userGetEventListingRes)
);
const userJoinEvent = rest.post(
  getUrl("/event-attendance/create/eventId_2"),
  handleSuccessResponse(userJoinEventRes)
);
const adminGetEventListing = rest.get(
  getUrl("/events/all"),
  handleSuccessResponse(adminGetEventListingRes)
);

const adminCreateEvent = rest.post(
  getUrl("/events/create"),
  handleSuccessResponse(adminCreateEventRes)
);

const adminEditEvent = rest.patch(
  getUrl("/events/edit/eventId_3"),
  handleSuccessResponse(adminEditEventRes)
);

const event = [
  userGetEventListing,
  adminCreateEvent,
  adminGetEventListing,
  adminEditEvent,
  userJoinEvent,
];

export default event;
