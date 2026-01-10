import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

export const POST=async(req:Request)=>{
    await connectDB();
    try{
        const {email,password,confirmPassword}=await req.json();
        const user=await UserModel.findOne({email});
        if(!user){
            return Response.json({
                success:false,
                message:"User with these email address doesnt exist",
            })
        }   
            if(password!==confirmPassword){
                return Response.json({
                    success:false,
                    message:"Passwords do not match",
                })
            }
            const hashPassword=await bcrypt.hash(password,10);
            user.password=hashPassword;
            const response=await user.save();
            if(!response){
                return Response.json({
                    success:false,
                    message:"Error occured while setting up new password in db",
                })
            }
            return Response.json({
                success:true,
                message:"Password changed successfully",
            })
    }
    catch(err){
       return Response.json({
        success:false,
        message:"Error occured in setting up new password",
       })
    }
}