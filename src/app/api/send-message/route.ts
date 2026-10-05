import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { checkRateLimit } from "@/lib/ratelimit";
import { messageQueue } from "@/lib/queue/messaggeQueue";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { username, content } = await req.json();

        // 1. Check if receiver username is valid
        const user = await UserModel.findOne({ userName: username });
        console.log("User", user);
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // 2. Check if receiver is accepting messages
        const isUserAcceptingMessages = user.isacceptingMessage;
        if (!isUserAcceptingMessages) {
            return Response.json({ success: false, message: "User is not accepting messages" }, { status: 403 });
        }

        // 3. Rate limiting check
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

        const rateLimit = await checkRateLimit(ip, "send-message");
        if (!rateLimit.allowed) {
            return Response.json(
                {
                    success: false,
                    message: "Rate limit exceeded. You can only send up to 5 messages per minute."
                },
                { status: 429 }
            );
        }

        // 4. Send to BullMQ queue (Redis)
        const job=await messageQueue.add("moderate-and-save", {
            userId: String(user._id),
            content,
        });

        return Response.json(
            { success: true, message: "Message queued successfully for delivery", jobId: job.id },
            { status: 200 }
        );
    } catch (err) {
        console.log("Error occured while processing message", err);
        return Response.json(
            {
                success: false,
                message: "Error occured while sending message"
            },
            { status: 500 }
        );
    }
}