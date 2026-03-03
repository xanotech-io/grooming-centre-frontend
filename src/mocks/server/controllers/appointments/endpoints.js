import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import { userGetDayAppointmentsRes } from "./responses";

const userGetDayAppointments = rest.get(
  getUrl("/appointments/day"),
  handleSuccessResponse(userGetDayAppointmentsRes)
);

const appointments = [userGetDayAppointments];

export default appointments;
