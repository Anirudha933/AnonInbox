import { connectDB } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { UserModel } from "@/models/User";
import { apiResponse } from "@/types/ApiResponse";


export async function POST(req:Request){
    await connectDB();
    const session=await getServerSession(authOptions);
    console.log("Session",session);
    const user=session?.user;
    if(!session || !user){
            return Response.json(
            {
                success:false,
                message:"User is not authenticated",
            },
            {
                status:500
            }
        );
        }
    const userId=user._id;
    try{
        const {acceptMessage}=await req.json();
        const findindUser= await UserModel.findOne({_id:userId});
        if(!findindUser){
        return Response.json(
            {
            success:false,
            message:"User does not exist with this id",
        },
            {status:500}
        );
       }
     findindUser.isacceptingMessage=acceptMessage;
     await findindUser.save();
     return Response.json({success:true,message:"Message toggled successfully"},{status:200});

    }
    catch(err){
        console.log("Error occured while toggling accept message button",err);
        return Response.json({success:false,message:"Error occured while toggling accept message button"},{status:500});
    }
}

export async function GET(req:Request){
    await connectDB();
    const session=await getServerSession(authOptions);
    console.log("Session",session);
    const user=session?.user;
    if(!session || !user){
        return Response.json(
                {
                    success:false,
                    message:"User is not authenticated",
            },
            {status:500}
        );
    }
    const userId=user._id;
    try{
        const findindUser= await UserModel.findOne({_id:userId});
        if(!findindUser){
            return Response.json(
                {
                success:false,
                message:"User does not exist with this id",
            },
                {status:500}
            );
           }
        return Response.json(
        {
            success:true,
            isacceptingMessage:findindUser.isacceptingMessage
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