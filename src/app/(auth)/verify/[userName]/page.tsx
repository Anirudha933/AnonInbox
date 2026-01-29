'use client'
import { verifySchema } from '@/schemas/verifySchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from "sonner";
import axios, { AxiosError } from 'axios';
import { apiResponse } from '@/types/ApiResponse';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


function VerifyAccount() {
  const router = useRouter();
  const param = useParams<{ userName: string }>();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    }
  })
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const res = await axios.post('/api/verify-code', { userName: param.userName, code: data.code });
      if (res.data.success) {
        toast.success(res.data.message);
        router.replace('/login');
      }
      console.log("Response from verifying code", res);
    }
    catch (err) {
      const axiosError = err as AxiosError<apiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Error in verifying code');
    }
  }
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
            Verify Your Account
          </h1>
          <p className='mb-4'>Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
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
      </div>
    </div>

  )
}

export default VerifyAccount
