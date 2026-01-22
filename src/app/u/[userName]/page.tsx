'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { messageSchema } from '@/schemas/messageSchema';
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { apiResponse } from '@/types/ApiResponse';
import { useEffect, useState } from 'react';
import { Loader2, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useDebounceCallback } from 'usehooks-ts';
import { ModeToggle } from '@/components/ModeToggle';
import { messageAuthenticityCheckSchema, warningTypes } from '@/schemas/messageAuthenticityCheck';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


function page() {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [aiImprovedMessage, setAiImprovedMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const params = useParams<{ userName: string }>();
  const [isLoading, setisLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCheckingmessage, setIsCheckingmessage] = useState(false);
  const [MessageError, setMessageError] = useState('');
  const [sending, setSending] = useState(false);
  const [questionSuggestions, setQuestionSuggestions] = useState<string[]>([]);
  const decodedUserName = decodeURIComponent(params.userName);
  const debounce = useDebounceCallback(setMessage, 500);
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    }
  });
  useEffect(() => {
    const messageCheck = async () => {
      setIsCheckingmessage(true);
      setMessageError('');
      if (!message) {
        setIsCheckingmessage(false);
        setMessageError('');
        return;
      }
      try {
        let warnings: warningTypes[] = [];
        const result = messageAuthenticityCheckSchema.safeParse({ message });
        // console.log("Result from message authenticity check",result);
        if (!result.success) {
          warnings = result.error.issues.map((issues) => {
            return issues.message as warningTypes;
          })
          const WARNING_LABELS: Record<warningTypes, string> = {
            profanity: "strong language",
            insult: "disrespectful language",
            sexual: "sexual language",
            violence: "violent references",
          };
          const warningMessage =
            warnings.length > 2
              ? "Your message contains language that may be inappropriate."
              : "Your message contains " +
              warnings.map(w => WARNING_LABELS[w]).join(", ") +
              ".";

          setMessageError(warningMessage);
        }
      }
      catch (err) {
        console.log("Error in message check", err);
        toast.error('Error in checking message authenticity');
      }
      finally {
        setIsCheckingmessage(false);
      }
    };
    messageCheck();
  }, [message]);

  useEffect(() => {
    handleButtonDisability();
  }, [message, sending]);

  const copysuggestionMessage = (data: string) => {
    form.setValue('content', data);
    setMessage(data);
  }

  const handleGenMessages = async () => {
    setisLoading(true);
    setQuestionSuggestions([]);
    try {
      const response = await axios.get('/api/gen-messages');
      console.log("Response from generating messages", response);
      const msgs = response.data.msg
        .split('||')
        .map((q: any) => q.trim())
        .filter(Boolean);
      // localStorage.setItem("generatedQuestions",JSON.stringify(msgs))
      setQuestionSuggestions(msgs);
    }
    catch (error) {
      console.log(error);
      toast.error('Error generating message suggestions.')
    }
    finally {
      setisLoading(false);
    }
  }

  const handleButtonDisability = () => {
    if (!message || sending) return setButtonDisabled(true);
    return setButtonDisabled(false);
  }

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    console.log("Message data", data);
    setSending(true);
    try {
      // analyzing the message
      const responseFromAnalyzer = await axios.post('/api/message-analyzer', { message: data.content });
      console.log("Response from analyzer", responseFromAnalyzer.data);
      if (!responseFromAnalyzer.data.success) {
        toast.error("Error in sending message");
        return;
      }
      if (responseFromAnalyzer.data.message.state === "ALLOWED") {
        const res = await axios.post('/api/send-message', { username: decodedUserName, content: data.content });
        console.log("Response from sending message", res);
        if (res.data.success) {
          toast.success(res.data.message);
          form.reset();
        }
        else {
          toast.error(res.data.message);
        }
        return;
      }
      //warning
      else if (responseFromAnalyzer.data.message.state === "WARNING") {
        setAiImprovedMessage(responseFromAnalyzer.data.message.improved_message);
        setShowWarningDialog(true);
        return;
      }
      //Blocked
      else if (responseFromAnalyzer.data.message.state === "BLOCKED") {
        setShowBlockedDialog(true);
        return;
      }

    }
    catch (err) {
      const axiosError = err as AxiosError<apiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Error in verifying code');
    }
    finally {
      if (isCheckingmessage) setIsCheckingmessage(false);
      setSending(false);
      setMessage('');
      setButtonDisabled(false);
    }
  }


  const handleAcceptRewrite = () => {
    form.setValue("content", aiImprovedMessage);
    setShowWarningDialog(false);
  };

  const handleEditManually = () => {
    setShowWarningDialog(false);
  };

  useEffect(() => {
    const getMessages = localStorage.getItem('generatedQuestions') ?? '[]';
    if (getMessages) setQuestionSuggestions(JSON.parse(getMessages));
  }, [])

  return (
    <div className="mt-10 max-w-2xl mx-auto space-y-8 flex flex-col px-4 pb-12 relative">
      <div className="absolute top-0 right-4 z-10">
        <ModeToggle />
      </div>
      <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in-up">
        <h1 className='text-center font-bold text-3xl mb-2 bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent'>
          Public Profile Link
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Send a secret message to <span className="font-semibold text-foreground">{decodedUserName}</span>
        </p>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                      Write your message below
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="bg-muted/50 border-input text-foreground min-h-[100px] align-top py-3 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 rounded-xl"
                          placeholder="Type your anonymous message here..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            debounce(e.target.value);
                          }}
                        />
                        <div className="absolute top-3 right-3 opacity-50 pointer-events-none">
                          <ShieldCheck className="h-4 w-4 text-green-400" />
                        </div>
                      </div>
                    </FormControl>
                    {isCheckingmessage && (<div className="text-xs text-orange-400 flex items-center mt-1"><LoaderCircle className="mr-2 h-3 w-3 animate-spin" /> Checking message safety...</div>)}
                    <p className={`text-sm mt-1 transition-opacity duration-300 ${MessageError ? 'text-red-400 opacity-100' : 'opacity-0 h-0'}`}>
                      {MessageError}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={buttonDisabled} className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-0.5">
                {
                  sending ? (
                    <div className='flex flex-row items-center space-x-2'>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" /> Sending secure message...
                    </div>
                  ) : "Send Anonymous Message"
                }
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Separator className="my-4 bg-border" />
      <div className='flex flex-col space-y-4'>
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-4">Need inspiration?</h3>
          <Button
            disabled={isLoading}
            onClick={handleGenMessages}
            variant="outline"
            className="bg-secondary border-border text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground transition-all duration-300"
          >
            {
              isLoading ? (
                <div className='flex flex-row space-x-2'>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating...
                </div>
              ) : <><Sparkles className="w-4 h-4 mr-2 text-yellow-500" /> Suggest Messages</>
            }
          </Button>
        </div>

        <div className='flex flex-col space-y-3'>
          {
            questionSuggestions.length > 0 && (
              <div className="grid grid-cols-1 gap-3 animate-fade-in">
                {questionSuggestions.map((question, index) => (
                  <div
                    key={index}
                    className='group relative overflow-hidden bg-card hover:bg-accent cursor-pointer p-4 border border-border rounded-xl transition-all duration-300 hover:border-orange-500/30'
                    onClick={() => copysuggestionMessage(question)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <p className="text-center text-muted-foreground group-hover:text-foreground relative z-10">{question}</p>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        <Separator className="my-6 bg-border" />
        <div className="text-center mb-10 bg-gradient-to-b from-transparent to-black/5 dark:to-black/20 p-8 rounded-2xl border border-border">
          <div className="mb-4 text-xl font-bold text-foreground">Get Your Own Message Board</div>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create your personal link and start receiving anonymous feedback today.</p>
          <Link href={'/sign-up'}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all duration-300">Create Your Account</Button>
          </Link>
        </div>
      </div>

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Message Improvement</DialogTitle>
            <DialogDescription className="text-slate-400">
              Your message was flagged as potentially harsh. AI has suggested a more respectful version.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
            <strong className="text-orange-400 block mb-2">Suggested Rewrite:</strong>
            <p className="italic">"{aiImprovedMessage}"</p>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={handleEditManually} className="text-slate-400 hover:text-white hover:bg-white/5">
              I'll edit it myself
            </Button>
            <Button onClick={handleAcceptRewrite} className="bg-orange-600 hover:bg-orange-700 text-white">
              Use AI Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <DialogContent className="sm:max-w-md bg-red-950/90 border-red-500/30 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">Message Blocked</DialogTitle>
            <DialogDescription className="text-red-200/80">
              This message contains harmful content that violates our community guidelines. Please remain respectful.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setShowBlockedDialog(false)} variant="destructive" className="w-full">
              Rewrite message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default page
