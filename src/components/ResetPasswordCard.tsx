"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {z} from "zod"
import {  useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

type ResetPasswordCardProps = {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formdata=z.object({
  password:z.string().min(8,{message:"Password must be at least 8 characters"}),
  confirmPassword:z.string().min(8,{message:"Password must be at least 8 characters"}),
}).refine((data)=>data.password===data.confirmPassword,{
  message:"Passwords do not match",
  path: ["confirmPassword"],
})

export function ResetPasswordCard({
  email,
  open,
  onOpenChange,
}: ResetPasswordCardProps) {
  const router=useRouter();
  const form=useForm<z.infer<typeof formdata>>({
    resolver:zodResolver(formdata),
    defaultValues: {
    password: "",
    confirmPassword: "",
  },
  shouldUnregister: false,
  });
  const onSubmit =async (data:z.infer<typeof formdata>) => {
    try {
      const response=await axios.post('/api/forgotPassword',{email,...data});
      if(!response.data.success){
        toast.error(response.data.message || "Error in resetting password");
        return;
      }
      toast.success("Password reset successfully");
      onOpenChange(false);
      router.replace('/login');
    } catch (error) {
      console.log("Error in resetting password:", error);
      toast.error("Failed to reset password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter new Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="enter new password...." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="confirm password...." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
    </Form>
      </DialogContent>
    </Dialog>
  );
}
