import { connectDB } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { UserModel } from "@/models/User";
import { MessageModel } from "@/models/Message";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "User is not authenticated",
            },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursorParam = searchParams.get("cursor");

    const limit = Math.min(Math.max(parseInt(limitParam || "10", 10), 1), 50);
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const findUser = await UserModel.findOne({ _id: userId });
        if (!findUser) {
            return Response.json(
                {
                    success: false,
                    message: "User does not exist with this id",
                },
                { status: 404 }
            );
        }

        const query: Record<string, any> = { userId };
        if (cursorParam) {
            const cursorDate = new Date(cursorParam);
            if (!isNaN(cursorDate.getTime())) {
                query.createdAt = { $lt: cursorDate };
            }
        }

        // Fetch limit + 1 items to determine if a next page exists without using expensive skip() operations
        const messages = await MessageModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1);

        let hasMore = false;
        let nextCursor: string | null = null;

        if (messages.length > limit) {
            hasMore = true;
            messages.pop();
            const lastMessage = messages[messages.length - 1];
            nextCursor = lastMessage.createdAt.toISOString();
        }

        return Response.json(
            {
                success: true,
                data: messages,
                nextCursor,
                hasMore,
            },
            { status: 200 }
        );
    }
    catch (err) {
        console.log("Error occured while getting messages from database", err);
        return Response.json(
            {
                success: false,
                message: "Error occured while getting messages from database"
            },
            { status: 500 }
        );
    }
}