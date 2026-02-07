import { render } from "@react-email/render";
import { apiResponse } from "../types/ApiResponse";
import nodemailer from 'nodemailer';
import VerificationEmail from "../../emails/verificationEmail";


export const sendVerificationEmail = async(
    email:string,
    verifyCode:string,
    codeFor:'signup' | 'forgotpassword',
    userName?:string,
):Promise<apiResponse>=>{
       const html =await render(
            <VerificationEmail username={userName} otp={verifyCode} codeFor={codeFor} />
        );
       let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL!,
            pass: process.env.PASS_EMAIL!,
        },
         });
    try{
         const info =await transporter.sendMail({
            from: 'AnionInbox <anirudhamohanty2005@gmail.com>',
            to: email,
            subject: "Verification Code",
            html,
        });
        console.log("Message sent: %s", info);
        //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        if (!info) {
            // console.log("Error sending verification email",error);
      return {success:false,message:"Error sending verification email"};
    }
    console.log("Verification email sent successfully",info);
    return {success:true,message:"Verification email send successfully"};
    }
    catch(err){
        console.log("Error sending verification email",err);
        return {success:false,message:"Error sending verification email"};
    }
}
