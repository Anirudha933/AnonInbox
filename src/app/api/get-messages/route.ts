import { connectDB } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { UserModel } from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    console.log("Session", session);
    const user:User = session?.user as User;
    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "User is not authenticated",
            },
            { status: 401 }
        );
    }
    //we have converted user._id to string , this might cause problem while using aggregration pipeline
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const findUser=await UserModel.findOne({_id:userId});
        if(!findUser){
            return Response.json(
                {
                    success:false,
                    message:"User does not exist with this id",
                },
                {status:500}
            );
           }
        const userAggregation=await UserModel.aggregate([
            {$match:{_id:userId}},
            {$unwind:'$messages'},
            {$sort:{'messages.createdAt':-1}},
            {$group:{_id:'$_id',messages:{$push:'$messages'}}},
        ]);
        console.log("User messages from aggregation",userAggregation);
        if(userAggregation.length==0){
            return Response.json(
                {
                    success:false,
                    message:"Messages not found for this user",
                }
            );
           }
        return Response.json(
            {
                success:true,
                data:userAggregation[0].messages
            },
            {status:200}
        );
    }
    catch(err){
        console.log("Error occured while getting status of accept message from database",err);
        return Response.json(
            {
                success:false,
                message:"Error occured while getting status of accept message from database"
            },
            {status:500}
        );
    }
}