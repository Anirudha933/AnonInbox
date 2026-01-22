'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
// import Link from "next/link"
import axios, { AxiosError } from "axios"
import { apiResponse } from "@/types/ApiResponse"
import { signUpSchema } from "@/schemas/signUpSchema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Button } from "@react-email/components"
import { Input } from "@/components/ui/input"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"

const Page = () => {
  const [userName, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounce = useDebounceCallback(setUsername, 300);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: '',
      email: '',
      password: '',
    }
  })
  useEffect(() => {
    const usernameCheck = async () => {
      if (userName) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const res = await axios.get(`/api/check-user-unique?userName=${userName}`);
          console.log("Axios response after checking availability of username", res);
          setUsernameMessage(res.data.message);
        }
        catch (err) {
          const axiosError = err as AxiosError<apiResponse>;
          console.log("Axios error", axiosError);
          setUsernameMessage(axiosError.response?.data.message ?? 'Error in checking unique username');
        } finally {
          setIsCheckingUsername(false);
        }
      }
    }
    usernameCheck();
  }, [userName])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    console.log("Form data", data);
    try {
      const res = await axios.post<apiResponse>('/api/signup', data);
      console.log("Axios response after submitting the form", res);
      if (res.data.success) {
        toast.success(res.data.message);
        router.replace(`/verify/${userName}`);
      }
      setIsSubmitting(false);
    }
    catch (err) {
      const axiosError = err as AxiosError<apiResponse>;
      console.log("Error in submitting the form", axiosError);
      toast.error(axiosError.response?.data.message ?? 'Error in submitting the form');
      setIsSubmitting(false);
    }
  }
  return (
    <div className="flex flex-col gap-3 justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-2xl border border-border">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-foreground">
            Join Mystery Message
          </h1>
          <p className="mb-4 text-muted-foreground">Sign up to start your anonymous adventure</p>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Already have an account? <span className="text-orange-400 hover:underline">Log In</span>
          </Link>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your username ....."
                      className="bg-muted/50 border-input text-foreground focus:ring-orange-500/50"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounce(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-orange-400" />}
                  <p
                    className={`text-sm ${usernameMessage === "User name is unique" ? "text-green-500" : "text-red-500"
                      }`}
                  >
                    {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email ....."
                      className="bg-muted/50 border-input text-foreground focus:ring-orange-500/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password ....."
                      className="bg-muted/50 border-input text-foreground focus:ring-orange-500/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer bg-primary hover:bg-orange-600 text-white font-bold p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/20"
            >
              {isSubmitting ? (
                <div className="flex flex-row items-center justify-center p-2">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Page
