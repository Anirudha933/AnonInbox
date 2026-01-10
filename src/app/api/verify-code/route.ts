import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { userNameValidation } from "@/schemas/signUpSchema";
import {z} from "zod";

const userNamevalidation=z.object({
    userName:userNameValidation,
})

export const POST=async(req:Request)=>{
    await connectDB();
    try{
        const {userName,code}=await req.json();
        // as we are extracting query params from url, the @ will be enocode in some code. Thus we will be using decodeURIComponent to decode it. 

        // const validUser=userNamevalidation.safeParse({userName});
        // console.log("ValidUser",validUser);
        // if(!validUser.success){
        //    const userNameError= validUser.error.format().userName?._errors || [];
        //     return Response.json({success:false,message:userNameError.length>0?userNameError.join(", "):"Invalid username"},{status:400});
        // }
        const decodedUserName=decodeURIComponent(userName);
        const User=await UserModel.findOne({userName:decodedUserName});
        console.log("User",User);
        // console.log("User",User?.verifyCodeExpiry.getHours());
        if(!User){
            return Response.json({success:false,message:"User does not exist"},{status:500});
        }
        const isCodeValid=User.verifyCode===code;
        if(isCodeValid){
            const isCodeNotExpired=new Date(User.verifyCodeExpiry)>=new Date(Date.now());
            if(isCodeNotExpired){
                await User.updateOne({isVerified:true,isAcceptingMessages:true});
                return Response.json({success:true,message:"Account verified successfully"},{status:200});
            }
            return Response.json({success:false,message:"Code is expired"},{status:500});
        }
         return Response.json({success:false,message:"Incorrect code"},{status:500});
    }
     catch(err){
        console.log(err);
        return Response.json({success:false,message:"Error in veryfying code"},{status:500});
    }

}