import { connectDB } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { UserModel } from "@/models/User";
import mongoose from "mongoose";

import { Message } from "@/models/User";
import { messageSchema } from "@/schemas/messageSchema";


export async function POST(req:Request){
    await connectDB();
    // messages can be sent even by the person who has not signed up
    const {username,content}=await req.json();
    try{
        const user=await UserModel.findOne({userName:username});
        console.log("User",user);
        if(!user){
            return Response.json({success:false,message:"User not found"},{status:404});
        }
        const isUserAcceptingMessages=user.isacceptingMessage;
       if(!isUserAcceptingMessages){
            return Response.json({success:false,message:"User is not accepting the messages"},{status:403});
       }
       const queryParam={
            content:content,
       }
    //    const result=contentUserQuerySchema.safeParse(queryParam);
    //    console.log("Result",result);
    //    if(!result.success){
    //        const contentError= result.error.format().content?._errors || [];
    //         return Response.json({success:false,message:contentError.length>0?contentError.join(","):"Invalid content"},{status:400});
    //    }
       const newMessage={content:content,createdAt:new Date()};
       await UserModel.updateOne({$push:{messages:newMessage}});
       return Response.json({success:true,message:"Message sent successfully"},{status:200});
    }
    catch(err){
        console.log("Error occured while sending message",err);
        return Response.json(
            {
                success:false,
                message:"Error occured while sending message"
            },
            {status:500}
        );
    }
}