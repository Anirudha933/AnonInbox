import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { apiResponse } from "@/types/ApiResponse";

export const POST = async(
    email:string,
    verifyCode:string,
    codeFor:'signup' | 'forgotpassword',
    userName?:string,
):Promise<apiResponse>=>{
    try{
       const {data,error}= await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: "Verification Code",
            react: VerificationEmail({ username: userName, otp: verifyCode, codeFor}),
  });
        if (error) {
            console.log("Error sending verification email",error);
      return {success:false,message:"Error sending verification email"};
    }

    console.log("Verification email sent successfully",data);
    return {success:true,message:"Verification email send successfully"};
    }
    catch(err){
        console.log("Error sending verification email",err);
        return {success:false,message:"Error sending verification email"};
    }
}
