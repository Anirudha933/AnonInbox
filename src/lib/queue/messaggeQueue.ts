import { Queue } from "bullmq";
import { redis } from "../redis";

export const messageQueue = new Queue("message-moderation", {
  connection: redis,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      age: 60 * 60, // 1 hour
      count: 1000,
    },

    removeOnFail: {
      age: 24 * 60 * 60, // 24 hours
    },
  },
});