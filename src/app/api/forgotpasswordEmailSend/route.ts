import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import {POST as sendVerificationEmail} from "@/utils/verificationEmail";


export const POST=async(req:Request)=>{
        await connectDB();
        try{
            const {email}=await req.json();
            const user=await UserModel.findOne({email});
            if(!user){
                return Response.json(
                    {
                        success:false,
                        message:"User with these email address doesnt exist",
                    }
                )
            }
            const verificationCode=Math.floor(100000 +Math.random()*900000).toString();
                user.forgotPasswordCode=verificationCode;
                const expiryDate=new Date;
                expiryDate.setMinutes(expiryDate.getMinutes()+5);
                user.forgotPasswordCodeExpiry=expiryDate;
                const responseFromSavingUser=await user.save();
                if(!responseFromSavingUser){
                    return Response.json(
                        {
                            success:false,
                            message:"Error occured while setting up new password",
                        }
                    )
                }
            const emailResponse=await sendVerificationEmail(email,verificationCode,"forgotpassword");
            if(!emailResponse.success){
                return Response.json(
                    {
                        success:false,
                        message:emailResponse.message || "Error occured while sending verification email",
                    }
                )
            }
            return Response.json(
                {
                    success:true
                }
            )
        }
        catch(err){
            return Response.json(
                {
                    success:false,
                    message:"Error occured while setting up new password",
                    error:err
                }
            )
        }
}