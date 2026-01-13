import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  userGetOneRoomRes_roomId_1,
  userGetOneRoomRes_roomId_2,
  userGetOneRoomRes_roomId_3,
  userGetMessagingRoomsRes,
} from "./responses";

const userGetMessagingRooms = rest.get(
  getUrl("/chat/rooms"),
  handleSuccessResponse(userGetMessagingRoomsRes)
);

const userGetOneRoom = [
  rest.get(
    getUrl("/chat/rooms/roomId_1"),
    handleSuccessResponse(userGetOneRoomRes_roomId_1)
  ),
  rest.get(
    getUrl("/chat/rooms/roomId_2"),
    handleSuccessResponse(userGetOneRoomRes_roomId_2)
  ),
  rest.get(
    getUrl("/chat/rooms/roomId_3"),
    handleSuccessResponse(userGetOneRoomRes_roomId_3)
  ),
];

const chat = [userGetMessagingRooms, ...userGetOneRoom];

export default chat;
