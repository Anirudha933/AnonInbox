import { connectDB } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import { UserModel } from "@/models/User";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ messageId: string }> }) {
    const { messageId } = await context.params;
    await connectDB();
    const session = await getServerSession(authOptions);
    // console.log("Session", session);
    const user:User = session?.user as User;
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "User is not authenticated",
            },
            { status: 500 }
        );
    }
  try {
    const updateResult=await UserModel.updateOne(
        {_id:user._id},
        {$pull:{messages:{_id:messageId}}}
    )
    if(updateResult.modifiedCount==0){
        return Response.json({success:false,message:"Message not deleted successfully"},{status:404});
    }
    else{
        return Response.json({success:true,message:"Message deleted successfully"},{status:200});
    }
  } catch (error) {
     return Response.json({success:false,message: error || "Error in deleting message"},{status:500});
  }
}