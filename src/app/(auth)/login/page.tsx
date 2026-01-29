'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoaderCircle } from "lucide-react"
import { loginSchema } from "@/schemas/loginSchema"
import { signIn } from "next-auth/react"
import Link from "next/link"

const Page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    }
  })
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    const result = await signIn('credentials', {
      redirect: false,
      ...data
    });
    console.log("Result from sign in", result);


    if (result?.error) {
      toast.error(result.error);
      console.log("Error from sign in", result.error);
      setIsSubmitting(false);
    }
    if (result?.ok) {
      toast.success("Login successful");
      console.log("Success from sign in", result);
      router.replace('/dashboard');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-2xl border border-border">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-foreground">
            Join AnonInbox
          </h1>
          <p className="mb-4 text-muted-foreground">Sign in to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email/Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your email/username ..."
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
                  <Link
                    href="/forgot-password"
                    className="text-sm text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
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
                <div className="flex flex-row items-center justify-center">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </Form>
        <div className="text-center">
          <Link href="/sign-up" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Don't have an account? <span className="text-orange-400 hover:underline">Sign Up</span>
          </Link>
        </div>
      </div>
    </div>

  )
}

export default Page
