import { connectDB } from "@/lib/dbConnect";
import {UserModel} from "@/models/User";
import bcrypt from "bcryptjs";
import {sendVerificationEmail} from "@/utils/verificationEmail";

export const POST = async (req: Request) => {
    await connectDB();
    try{
        const {userName,email,password} = await req.json();
        const existingUserVerifiedByUsername = await UserModel.findOne(
            {
                userName:userName,
                isVerified:true
            });
            
        if(existingUserVerifiedByUsername){
            return Response.json(
                {success:false,message:"User already exists"},
                {
                    status:400
                }
            );
        }
        const existingUserByEmail = await UserModel.findOne({
            email
        });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password,10);
        const expiryDate=new Date;
        expiryDate.setHours(expiryDate.getHours()+1);
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json(
                    {success:false,message:"User already exists"},
                    {
                        status:400
                    }
                );
            }
            else{
                await UserModel.findByIdAndUpdate(existingUserByEmail._id,
                     {  
                        password: hashedPassword,
                        verifyCode,
                        verifyCodeExpiry:expiryDate,
                        isVerified:false,
                        isacceptingMessage:true,
                        messages:[]
                    }
                );  
           }
        }
        else{
            const userNameExistsButDiffEmailNotVerified=await UserModel.findOne({
                userName,
                isVerified:false,
            })
            if(userNameExistsButDiffEmailNotVerified){
                await UserModel.findByIdAndUpdate(userNameExistsButDiffEmailNotVerified._id,
                     {  
                        email,
                        password: hashedPassword,
                        verifyCode,
                        verifyCodeExpiry:expiryDate,
                        isVerified:false,
                        isacceptingMessage:true,
                        messages:[]
                    }
                );
            }
            else{
                await UserModel.create(
                    {
                        userName,
                        email,
                        password: hashedPassword,
                        verifyCode,
                        verifyCodeExpiry:expiryDate,
                        isVerified:false,
                        isacceptingMessage:true,
                        messages:[]
                    }
                );
            }
        }

        const emailResponse=await sendVerificationEmail(email,verifyCode,"signup",userName);
        console.log("Email Response",emailResponse);
        if(!emailResponse.success){
            return Response.json(
                {success:false,message:emailResponse.message},
                {
                    status:500
                }
            );
        }
        return Response.json(
            {success:true,message:"Account created successfully"},
            {
                status:201,
            }
        );
    }
    catch(error:any){
        console.error("Error registering user",error.message);
        return Response.json(
            {success:false,message:"Error registering user"},
            {
                status:500
            }
        );
    }

}