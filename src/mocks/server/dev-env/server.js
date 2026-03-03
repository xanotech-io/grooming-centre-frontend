// import { setupWorker } from "msw";
// import handlers from "../controllers/handlers";

// const worker = setupWorker(...handlers.dev);

export const setupDevelopmentServer = () => {
  if (process.env.NODE_ENV === "development") {
    // worker.start();
  }
};
