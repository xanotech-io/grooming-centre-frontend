import { requestMyDataRes } from "../auth/me_response";

export const userGetMessagingRoomsRes = {
  data: [
    {
      id: "roomId_1",
      name: "John Doe",
      isGroup: false,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
      unreadCount: 20,
      message: {
        id: "msgId_1",
        text: "Yo! Xup",
        file: null,
        createdAt: "2021-11-23T20:59:24.341Z",
        userId: "userId_20",
      },
    },
    {
      id: "roomId_2",
      name: "Coding Group",
      isGroup: true,
      image:
        "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGF2YXRhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      unreadCount: 0,
      message: {
        id: "msgId_1",
        text: "Big data is cool and stuff",
        file: {
          url: "url",
          type: "audio",
          extension: "pdf",
          name: "big data course",
        },
        createdAt: "2021-11-23T20:59:24.341Z",
        userId: "userId_20",
      },
    },
    {
      id: "roomId_3",
      name: "Data Science Group",
      isGroup: true,
      image:
        "https://media.istockphoto.com/photos/futuristic-artificial-intelligence-with-robotic-technology-concept-picture-id1321058095?b=1&k=20&m=1321058095&s=170667a&w=0&h=Msxrpo6LrdXQnkc2-Y_YwpMCKhkK7Ma1QNkJeAGDbOQ=",
      unreadCount: 0,
      message: {
        id: "msgId_1",
        text: null,
        file: {
          url: "url",
          type: "audio",
          extension: "pdf",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
        },
        createdAt: "2021-11-23T20:59:24.341Z",
        userId: "userId_20",
      },
    },
  ],
};

export const userGetOneRoomRes_roomId_1 = {
  data: {
    id: "roomId_1",
    name: "John Doe",
    isGroup: false,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
    users: [
      {
        id: "userId_20",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "Jonas",
        lastName: "Schemer",
      },
      {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
    ],
    messages: [
      {
        id: "msgId_1",
        text: "Yo! Xup man",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: "userId_20",
        file: {
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          type: "audio",
          extension: "mp3",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
          size: "20mb",
        },
      },
      {
        id: "msgId_2",
        text: "Check out this cool music",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: "userId_20",
        file: {
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          type: "audio",
          extension: "mp3",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
          size: "20mb",
        },
      },
      {
        id: "msgId_3",
        text: "Ok cool",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: requestMyDataRes.data.id,
        file: null,
      },
      {
        id: "msgId_4",
        text: "This video is very good and I like it",
        createdAt: "2022-01-06T11:26:00.090Z",
        userId: requestMyDataRes.data.id,
        file: {
          url: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4",
          type: "video",
          extension: "mp4",
          name: "lorem",
          size: "20mb",
        },
      },
      {
        id: "msgId_5",
        text: null,
        createdAt: "2022-01-06T11:26:00.090Z",
        userId: requestMyDataRes.data.id,
        file: {
          url: "http://www.soundhelix.com/applet/examples/SoundHelix-Percussion.xml",
          type: "application",
          extension: "xml",
          name: "lorem",
          size: "20mb",
        },
      },
      {
        id: "msgId_6",
        text: "This video is very good and I enjoyed it",
        createdAt: "2022-01-06T12:26:00.090Z",
        userId: "userId_20",
        file: null,
      },
    ],
  },
};

export const userGetOneRoomRes_roomId_2 = {
  data: {
    id: "roomId_2",
    name: "Coding Group",
    isGroup: true,
    image:
      "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGF2YXRhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    users: [
      {
        id: "userId_20",
        profilePics:
          "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
        firstName: "Jonas",
        lastName: "Schemer",
      },
      {
        id: "userId_21",
        profilePics:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8YXZhdGFyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
        firstName: "Mosh",
        lastName: "Hammer",
      },
      {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
    ],
    messages: [
      {
        id: "msgId_1",
        text: "What's up",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: "userId_20",
        file: {
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          type: "audio",
          extension: "mp3",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
          size: "20mb",
        },
      },
      {
        id: "msgId_2",
        text: "Let's go to the gym",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: "userId_21",
        file: {
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          type: "audio",
          extension: "mp3",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
          size: "20mb",
        },
      },
      {
        id: "msgId_02",
        text: "Let's go to the gym",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: "userId_21",
        file: {
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          type: "audio",
          extension: "mp3",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
          size: "20mb",
        },
      },
      {
        id: "msgId_02",
        text: "Let's go to the gym pls",
        createdAt: "2022-01-06T11:26:00.090Z",
        userId: "userId_21",
        file: {
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          type: "audio",
          extension: "mp3",
          name: "lorem ipsum dolor sit amet, consectetur adipiscing elit",
          size: "20mb",
        },
      },
      {
        id: "msgId_3",
        text: "Ok cool",
        createdAt: "2022-01-06T10:26:00.090Z",
        userId: requestMyDataRes.data.id,
        file: null,
      },
      {
        id: "msgId_4",
        text: "This video is very good and I like it",
        createdAt: "2022-01-06T11:26:00.090Z",
        userId: requestMyDataRes.data.id,
        file: {
          url: "http://res.cloudinary.com/xanotech/video/upload/v1637447807/grooming-centre/HTML-clash-clans/0001.%20TutFlix.io--1-1-intro-to-fundamentals-of-testing-in-javascript-00-00-33.mp4",
          type: "video",
          extension: "mp4",
          name: "lorem",
          size: "20mb",
        },
      },
      {
        id: "msgId_5",
        text: null,
        createdAt: "2022-01-06T11:26:00.090Z",
        userId: "userId_21",
        file: {
          url: "http://www.soundhelix.com/applet/examples/SoundHelix-Percussion.xml",
          type: "application",
          extension: "xml",
          name: "lorem",
          size: "20mb",
        },
      },
      {
        id: "msgId_6",
        text: "I like this video",
        createdAt: "2022-01-06T12:26:00.090Z",
        userId: "userId_20",
        file: null,
      },
    ],
  },
};

export const userGetOneRoomRes_roomId_3 = {
  data: {
    id: "roomId_3",
    name: "Data Science Group",
    isGroup: true,
    image:
      "https://media.istockphoto.com/photos/futuristic-artificial-intelligence-with-robotic-technology-concept-picture-id1321058095?b=1&k=20&m=1321058095&s=170667a&w=0&h=Msxrpo6LrdXQnkc2-Y_YwpMCKhkK7Ma1QNkJeAGDbOQ=",
    users: [
      {
        id: "userId_20",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "Jonas",
        lastName: "Schemer",
      },
      {
        id: "userId_21",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "Mosh",
        lastName: "Hammer",
      },
      {
        id: requestMyDataRes.data.id,
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: requestMyDataRes.data.firstName,
        lastName: requestMyDataRes.data.lastName,
      },
      {
        id: "userId_278",
        profilePics:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
        firstName: "Harry",
        lastName: "Garry",
      },
    ],
    messages: [],
  },
};
