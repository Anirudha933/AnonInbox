import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { connectDB } from "@/lib/dbConnect";
import { MessageModel } from "@/models/Message";
import { analyzer } from "@/utils/analyzer/route";

interface MessageJob {
  userId: string;
  content: string;
}

export const worker = new Worker<MessageJob>(
  "message-moderation",
  async (job: Job<MessageJob>) => {
    await connectDB();

    const { userId, content } = job.data;

    console.log(`[Worker] Processing job ${job.id} for user ${userId}`);

    // 1. Call Groq AI analyzer
    const analysisResult = await analyzer({ message: content });

    // Handle error or invalid AI response to trigger BullMQ retry
    if (!analysisResult || typeof analysisResult === "string" || !("state" in analysisResult)) {
      console.error(`[Worker] AI analysis failed or returned invalid response for job ${job.id}`);
      throw new Error(`AI moderation failed for job ${job.id}`);
    }

    console.log(`[Worker] Moderation result for job ${job.id}:`, analysisResult.state);

    // 2. Reject if message is BLOCKED
    if (analysisResult.state === "BLOCKED") {
      console.log(`[Worker] Message rejected (BLOCKED): ${job.id}`);
      return;
    }

    // 3. Store genuine approved message in MongoDB
    const finalContent =
      analysisResult.state === "WARNING" && analysisResult.improved_message
        ? analysisResult.improved_message
        : content;

    await MessageModel.create({
      userId,
      content: finalContent,
      createdAt: new Date(),
    });

    console.log(`[Worker] Message successfully stored in DB for job ${job.id}`);
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error);
});