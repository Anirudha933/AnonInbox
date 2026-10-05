import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { MessageModel } from "@/models/Message";

export async function POST(req: Request) {
    await connectDB();
    const { username, content } = await req.json();
    try {
        const user = await UserModel.findOne({ userName: username });
        console.log("User", user);
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        const isUserAcceptingMessages = user.isacceptingMessage;
        if (!isUserAcceptingMessages) {
            return Response.json({ success: false, message: "User is not accepting the messages" }, { status: 403 });
        }

        await MessageModel.create({
            userId: user._id,
            content,
            createdAt: new Date(),
        });

        return Response.json({ success: true, message: "Message sent successfully" }, { status: 200 });
    } catch (err) {
        console.log("Error occured while sending message", err);
        return Response.json(
            {
                success: false,
                message: "Error occured while sending message"
            },
            { status: 500 }
        );
    }
}