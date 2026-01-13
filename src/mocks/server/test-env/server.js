import { setupServer } from "msw/node";
import handlers from "../controllers/handlers";

const mockServer = setupServer(...handlers.test);

export default mockServer;
