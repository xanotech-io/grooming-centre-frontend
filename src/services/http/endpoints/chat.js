import { http } from "../http";
import dayjs from "dayjs";
import { getFullName, truncateText } from "../../../utils";
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

export const userGetMessagingRooms = async () => {
  const path = `/chat/rooms`;

  const {
    data: { data },
  } = await http.get(path);

  const rooms = data.map((room) => ({
    id: room.id,
    isGroup: room.isGroup,
    name: room.name,
    image: room.image,
    unreadCount: room.unreadCount,
    message: {
      text: room.message.text,
      date: dayjs().to(dayjs(room.message.createdAt)),
      file: room.message.file
        ? {
            type: room.message.file.type,
            name: `${truncateText(room.message.file.name, 25)}.${
              room.message.file.extension
            }`,
          }
        : null,
    },
  }));

  return { rooms };
};

export const userGetOneRoom = async (id) => {
  const path = `/chat/rooms/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  const room = {
    id: data.id,
    name: data.name,
    isGroup: data.isGroup,
    image: data.image,
    users: data.users.map((user) => ({
      id: user.id,
      profilePics: user.profilePics,
      name: getFullName(user),
    })),
    conversations: data.messages.map((message) => ({
      id: message.id,
      text: message.text,
      date: dayjs().to(dayjs(message.createdAt)),
      userId: message.userId,
      file: message.file
        ? {
            url: message.file.url,
            extension: message.file.extension,
            type: message.file.type,
            name: message.file.name,
            size: message.file.size,
          }
        : null,
    })),
  };

  return { room };
};

export const currentUserMessagePayload = ({ text, userId }) => ({
  id: `${Date.now()}`,
  date: dayjs().to(dayjs(new Date().toISOString())),
  text,
  userId,
});
