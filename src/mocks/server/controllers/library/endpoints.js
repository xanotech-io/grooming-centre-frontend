import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import {
  adminEditLibraryFileRes_audioId_1,
  adminEditLibraryFileRes_bookId_1,
  adminEditLibraryFileRes_videoId_1,
  adminLibraryListingRes,
  adminUploadLibraryFileRes,
  requestLibraryFileDetailsRes_audioId_1,
  requestLibraryFileDetailsRes_bookId_1,
  requestLibraryFileDetailsRes_videoId_1,
  userAudioListingRes,
  userBookListingRes,
  userVideoListingRes,
} from "./responses";

const userGetBookListing = rest.get(
  getUrl("/library/pdf"),
  handleSuccessResponse(userBookListingRes)
);

const userGetAudioListing = rest.get(
  getUrl("/library/audio"),
  handleSuccessResponse(userAudioListingRes)
);

const userGetVideoListing = rest.get(
  getUrl("/library/video"),
  handleSuccessResponse(userVideoListingRes)
);

const adminLibraryListing = rest.get(
  getUrl("/library/admin"),
  handleSuccessResponse(adminLibraryListingRes)
);

const requestLibraryFileDetails = [
  rest.get(
    getUrl("/library/details/videoId_1"),
    handleSuccessResponse(requestLibraryFileDetailsRes_videoId_1)
  ),
  rest.get(
    getUrl("/library/details/audioId_1"),
    handleSuccessResponse(requestLibraryFileDetailsRes_audioId_1)
  ),
  rest.get(
    getUrl("/library/details/bookId_1"),
    handleSuccessResponse(requestLibraryFileDetailsRes_bookId_1)
  ),
];

const adminUploadLibraryFile = rest.post(
  getUrl("/library/create"),
  handleSuccessResponse(adminUploadLibraryFileRes)
);

const adminEditLibraryFile = [
  rest.patch(
    getUrl("/library/edit/videoId_1"),
    handleSuccessResponse(adminEditLibraryFileRes_videoId_1)
  ),
  rest.patch(
    getUrl("/library/edit/audioId_1"),
    handleSuccessResponse(adminEditLibraryFileRes_audioId_1)
  ),
  rest.patch(
    getUrl("/library/edit/bookId_1"),
    handleSuccessResponse(adminEditLibraryFileRes_bookId_1)
  ),
];

const library = [
  userGetBookListing,
  userGetAudioListing,
  userGetVideoListing,
  adminLibraryListing,
  adminUploadLibraryFile,
  ...adminEditLibraryFile,
  ...requestLibraryFileDetails,
];

export default library;
