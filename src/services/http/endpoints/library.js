import { http } from "../http";

/**
 * Endpoint to get user `book-listing`
 *
 * @returns {Promise<{ books: BookListArray }>}
 */
export const userGetBookListing = async () => {
  const path = `/library/pdf`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    books: data.map((book) => ({
      id: book.id,
      description: book.description,
      title: book.title,
      file: book.file,
      fileExtension: book.fileExtension,
      instructor: {
        id: book.user.id,
        profilePics: book.user.profilePics,
        firstName: book.user.firstName,
        lastName: book.user.lastName,
        title: book.user.title,
      },
    })),
  };
};

/**
 * Endpoint to get user `audio-listing`
 *
 * @returns {Promise<{ audio: AudioListArray }>}
 */
export const userGetAudioListing = async () => {
  const path = `/library/audio`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    audio: data.map((aud) => ({
      id: aud.id,
      description: aud.description,
      title: aud.title,
      file: aud.file,
      fileExtension: aud.fileExtension,
      instructor: {
        id: aud.user.id,
        profilePics: aud.user.profilePics,
        firstName: aud.user.firstName,
        lastName: aud.user.lastName,
        title: aud.user.title,
      },
    })),
  };
};

/**
 * Endpoint to get user `video-listing`
 *
 * @returns {Promise<{ videos: VideoListArray }>}
 */
export const userGetVideoListing = async () => {
  const path = `/library/video`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    videos: data.map((video) => ({
      id: video.id,
      description: video.description,
      title: video.title,
      file: video.file,
      fileExtension: video.fileExtension,
      instructor: {
        id: video.user.id,
        profilePics: video.user.profilePics,
        firstName: video.user.firstName,
        lastName: video.user.lastName,
        title: video.user.title,
      },
    })),
  };
};

/**
 * Endpoint to get `library-listing`
 *
 * @param {object} params
 *
 * @returns {Promise<{ data: LibraryListArray }>}
 */
export const adminLibraryListing = async (params) => {
  const path = `/library/admin`;

  const {
    data: { data },
  } = await http.get(path, { params });

  return {
    library: data.rows.map((lib) => ({
      id: lib.id,
      title: lib.title,
      description: lib.description,
      departmentId: lib.departmentId,
      // department: {
      //   id: lib.department.id,
      //   name: lib.department.name,
      // },
      fileType: lib.fileType,
      // libraryType: {
      //   id: lib.libraryType.id,
      //   name: lib.libraryType.name,
      // },
      file: lib.file,
      fileExtension: lib.fileExtension,
      instructor: {
        id: lib.user.id,
        profilePics: lib.user.profilePics,
        firstName: lib.user.firstName,
        lastName: lib.user.lastName,
        title: lib.user.title,
      },
    })),
    showingDocumentsCount: data.rows.length,
    totalDocumentsCount: data.rows.length,
  };
};

/**
 * Endpoint to get `library-file-details`
 * @param {string} id - fileId
 *
 * @returns {Promise<{ library: Library }>}
 */
export const requestLibraryFileDetails = async (id) => {
  const path = `/library/details/${id}`;

  const {
    data: { data },
  } = await http.get(path);

  return {
    library: {
      ...data,
    },
  };
};

/**
 * Endpoint to for admin to upload library file
 * @param {{ title: string, departmentId: string, description: string, libraryTypeId: string, file: File }} body
 *
 * @returns {Promise<{ message: string, library: { id: string } }>}
 */
export const adminUploadLibraryFile = async (body) => {
  const path = `/library/create`;

  const {
    data: { message, data },
  } = await http.post(path, body);

  const library = {
    id: data.id,
  };

  return { message, library };
};

/**
 * Endpoint to for admin to edit a library file
 * @param {{ title: string, departmentId: string, description: string, libraryTypeId: string, file: File }} body
 *
 * @returns {Promise<{ message: string, library: { id: string } }>}
 */
export const adminEditLibraryFile = async (id, body) => {
  const path = `/library/edit/${id}`;

  const {
    data: { message, data },
  } = await http.patch(path, body);

  const library = {
    id: data[0].id,
  };

  return { message, library };
};

/**
 * Endpoint to delete a single library file
 * @param {string} id - library file id
 *
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteLibraryFile = async (id) => {
  const path = `/library/${id}`;

  const {
    data: { message },
  } = await http.delete(path);

  return { message };
};

/**
 * Endpoint to delete multiple library files
 * @param {Array<{ id: string }>} selectedLibraryFiles - array of library file objects with id
 *
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteMultipleLibraryFiles = async (selectedLibraryFiles) => {
  // Delete each file individually since there's no bulk delete endpoint
  const deletePromises = selectedLibraryFiles.map(file =>
    adminDeleteLibraryFile(file.id)
  );

  await Promise.all(deletePromises);

  return { message: "Library files deleted successfully" };
};
