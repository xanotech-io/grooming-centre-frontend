import { rest } from "msw";
import { getUrl } from "../../http";
import { handleSuccessResponse } from "../helpers";
import { requestMetadataRes } from "./responses";

const requestMetadata = rest.get(
  getUrl("/metadata"), // TODO: change `path`
  handleSuccessResponse(requestMetadataRes)
);

const metadata = [requestMetadata];

export default metadata;
