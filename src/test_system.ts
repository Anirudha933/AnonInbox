import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/ratelimit";
import { analyzer } from "@/utils/analyzer/route";
import { messageQueue } from "@/lib/queue/messaggeQueue";
import { worker } from "@/worker/messageWorker";
import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";

async function runSystemTest() {
  console.log("=== STARTING SYSTEM INTEGRATION TEST ===");

  // 1. Test Redis Connection
  try {
    const pingRes = await redis.ping();
    console.log("1. Redis Ping Success:", pingRes);
  } catch (err: any) {
    console.error("1. Redis Connection Error:", err.message);
  }

  // 2. Test Rate Limiting
  try {
    console.log("2. Testing Rate Limiting (5 requests allowed per min)...");
    const testIp = "192.168.1.100";
    for (let i = 1; i <= 6; i++) {
      const res = await checkRateLimit(testIp, "test-action");
      console.log(` Request ${i}: allowed=${res.allowed}, remaining=${res.remaining}`);
    }
  } catch (err: any) {
    console.error("2. Rate Limiting Error:", err.message);
  }

  // 3. Test Groq AI Analyzer directly
  try {
    console.log("3. Testing Groq AI Analyzer...");
    const aiRes = await analyzer({ message: "The app features are nice and intuitive." });
    console.log(" Groq AI Result:", JSON.stringify(aiRes));
  } catch (err: any) {
    console.error("3. Groq AI Analyzer Error:", err.message);
  }

  // 4. Test MongoDB Connection & User query
  let testUser: any = null;
  try {
    console.log("4. Testing MongoDB Connection...");
    await connectDB();
    testUser = await UserModel.findOne({});
    console.log(" MongoDB Connected. Found test user:", testUser ? testUser.userName : "None found");
  } catch (err: any) {
    console.error("4. MongoDB Error:", err.message);
  }

  // 5. Test BullMQ Queue and Worker processing
  if (testUser) {
    try {
      console.log("5. Testing BullMQ Queue & Worker processing...");
      const job = await messageQueue.add("moderate-and-save", {
        userId: String(testUser._id),
        content: "Test feedback message from automated system check",
      });
      console.log(` Job added to queue with ID: ${job.id}`);
      console.log(" Waiting 5 seconds for worker to process job...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err: any) {
      console.error("5. BullMQ Error:", err.message);
    }
  }

  console.log("=== SYSTEM TEST COMPLETED ===");
  process.exit(0);
}

runSystemTest();
