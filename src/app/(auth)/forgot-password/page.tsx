'use client'
import { ResetPasswordCard } from "@/components/ResetPasswordCard";
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import z from "zod";

function page() {
    const EmailSendForm=useForm({
        resolver:zodResolver(z.object({
            email:z.email("Invalid email"),
        })),
    });
    const CodeVerifyForm=useForm({
        resolver:zodResolver(z.object({
            code:z.string().length(6,"Invalid code"),
        })),
    })
    const [codeVerified,setCodeVerified]=useState(false);
    const [emailSent,setEmailSent]=useState(false);
    const [email,setEmail]=useState('');
    const [openResetPasswordCard,setOpenResetPasswordCard]=useState(false);
    useEffect(()=>{
      if(codeVerified){
        setOpenResetPasswordCard(true);
      }
    },[codeVerified]);
    const sendEmail=async(data:{email:string})=>{
        try{
            const axiosResponse=await axios.post('/api/forgotpasswordEmailSend',{email:data.email});
             if (!axiosResponse.data.success) throw new Error(axiosResponse.data.message);

              toast.success("Check your email for the code");
              setEmailSent(true);
              setEmail(data.email);
        }
        catch(err:any){
          toast.error(err.message || "Failed to send email");
        }
    }
    const checkCode=async(data:{code:string})=>{
        try{
            const axiosResponse=await axios.post('/api/verifycodeforForgotPassword',{email:email,code:data.code});
            if (!axiosResponse.data.success) throw new Error(axiosResponse.data.message);
            toast.success("Code verified successfully");
            setCodeVerified(true);

        }
        catch(err:any){
           toast.error(err.message || "Invalid code");
        }
    }
  return (
     <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
            <div className='text-center'>
            <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
                    Reset Password
            </h1>
            <p className='mb-4'>Enter the verification code sent to your email</p>
            </div>
            <Form {...EmailSendForm}>
            <form onSubmit={EmailSendForm.handleSubmit(sendEmail)} className="space-y-8">
                 <FormField
                control={EmailSendForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Email associated with your account</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="test@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
                <Button>Send</Button>
            </form>
            </Form>
            {
              emailSent && (
          <Form {...CodeVerifyForm}>
            <form onSubmit={CodeVerifyForm.handleSubmit(checkCode)}>
              <FormField
                control={CodeVerifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
              )
          }
           {
              <ResetPasswordCard 
                email={email}
                open={openResetPasswordCard}
                onOpenChange={setOpenResetPasswordCard}
              />
          }
        </div>
      </div>

  )
}

export default page
