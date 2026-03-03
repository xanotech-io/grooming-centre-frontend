import { http } from "../http";

/**
 * Endpoint to get, create and edit `announcements`
 */
export const adminCreateAnnouncement = async (body) => {
  const path = "/announcement/create";

  const {
    data: { message, data },
  } = await http.post(path, body);

  return { message, data };
};

export const adminGetAnnouncementListing = async (params) => {
  const path = `/announcement/admin`;

  const {
    data: { data },
  } = await http.get(path, { params });

  console.log(data);

  const announcements = data.map((exam) => ({
    id: exam.id,
    text: exam.text,
    departmentId: exam.departmentId,
    senderId: exam.senderId,
    department: exam?.department?.name,
    firstName: exam?.sender?.firstName,
    lastName: exam?.sender?.lastName,
    createdAt: exam?.createdAt,
  }));

  return {
    announcements,
    showingDocumentsCount: data.length, // No pagination for now
    totalDocumentsCount: data.length, // No pagination for now
    // showingDocumentsCount: data.length,
    // totalDocumentsCount: data.length,
  };
};

export const adminGetAnnouncement = async (id) => {
  const path = `/announcement/admin/${id}`;

  console.log(id);

  const {
    data: { data },
  } = await http.get(path);

  const announcement = {
    id: data?.id,
    text: data?.text,
    departmentId: data?.departmentId,
    senderId: data?.senderId,
  };

  console.log(announcement);
  return {
    announcement,
  };
};

export const adminEditAnnouncement = async (id, body) => {
  const path = `/announcement/edit/${id}`;

  const {
    data: { message },
  } = await http.patch(path, body);

  return { message };
};
export const adminDeleteAnnouncement = async (id) => {
  const path = `/announcement/delete/${id}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

export const userGetAnnouncement = async () => {
  const path = "/announcement/user";

  const {
    data: { data, message },
  } = await http.get(path);

  const announcements = data.map((item) => ({
    id: item.id,
    text: item.text,
    departmentId: item.departmentId,
    senderId: item.senderId,
    firstName: item?.sender?.firstName,
    lastName: item?.sender?.lastName,
    profilePic: item?.sender?.profilePics,
    department: item?.department?.name,
  }));

  return { message, announcements };
};
