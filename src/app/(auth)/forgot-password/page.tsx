'use client'
import { ResetPasswordCard } from "@/components/ResetPasswordCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import z from "zod";
import { Loader2 } from "lucide-react";

function page() {
  const EmailSendForm = useForm({
    resolver: zodResolver(z.object({
      email: z.email("Invalid email"),
    })),
  });
  const CodeVerifyForm = useForm({
    resolver: zodResolver(z.object({
      code: z.string().length(6, "Invalid code"),
    })),
  })
  const [codeVerified, setCodeVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [openResetPasswordCard, setOpenResetPasswordCard] = useState(false);
  useEffect(() => {
    if (codeVerified) {
      setOpenResetPasswordCard(true);
    }
  }, [codeVerified]);
  const sendEmail = async (data: { email: string }) => {
    setSending(true);
    try {
      const axiosResponse = await axios.post('/api/forgotpasswordEmailSend', { email: data.email });
      if (!axiosResponse.data.success) throw new Error(axiosResponse.data.message);

      toast.success("Check your email for the code");
      setEmailSent(true);
      setEmail(data.email);
    }
    catch (err: any) {
      toast.error(err.message || "Failed to send email");
    }
    finally {
      setSending(false);
    }
  }
  const checkCode = async (data: { code: string }) => {
    setSendingCode(true);
    try {
      const axiosResponse = await axios.post('/api/verifycodeforForgotPassword', { email: email, code: data.code });
      if (!axiosResponse.data.success) throw new Error(axiosResponse.data.message);
      toast.success("Code verified successfully");
      setCodeVerified(true);

    }
    catch (err: any) {
      toast.error(err.message || "Invalid code");
    }
    finally {
      setSendingCode(false);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-2xl border border-border">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-foreground">
            Reset Password
          </h1>
          <p className="mb-4 text-muted-foreground">Enter the verification code sent to your email</p>
        </div>
        <Form {...EmailSendForm}>
          <form onSubmit={EmailSendForm.handleSubmit(sendEmail)} className="space-y-8">
            <FormField
              control={EmailSendForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Enter Email associated with your account</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="test@email.com"
                      className="bg-muted/50 border-input text-foreground focus:ring-orange-500/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-orange-600 text-white font-bold p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/20"
            >
              {!emailSent && !sending && "Send"}
              {sending && (
                <div className="flex flex-row items-center justify-center space-x-2">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Sending
                </div>
              )}
              {emailSent && !sending && "Resend"}
            </Button>
          </form>
        </Form>
        {emailSent && (
          <Form {...CodeVerifyForm}>
            <form onSubmit={CodeVerifyForm.handleSubmit(checkCode)} className="space-y-8">
              <FormField
                control={CodeVerifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Enter code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Code"
                        className="bg-muted/50 border-input text-foreground focus:ring-orange-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/20"
              >
                {sendingCode ? (
                  <div className="flex flex-row items-center justify-center space-x-2">
                    <Loader2 className="animate-spin mr-2 h-4 w-4 my-2" /> Submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        )}
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
