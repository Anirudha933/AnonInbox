import { connectDB } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import { MessageModel } from "@/models/Message";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ messageId: string }> }) {
    const { messageId } = await context.params;
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
    try {
        const deleteResult = await MessageModel.deleteOne({
            _id: messageId,
            userId: user._id,
        });

        if (deleteResult.deletedCount === 0) {
            return Response.json({ success: false, message: "Message not found or already deleted" }, { status: 404 });
        } else {
            return Response.json({ success: true, message: "Message deleted successfully" }, { status: 200 });
        }
    } catch (error) {
        return Response.json({ success: false, message: error || "Error in deleting message" }, { status: 500 });
    }
}