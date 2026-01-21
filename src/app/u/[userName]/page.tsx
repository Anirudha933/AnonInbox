'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { messageSchema } from '@/schemas/messageSchema';
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { apiResponse } from '@/types/ApiResponse';
import { useEffect, useState } from 'react';
import { Loader2, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useDebounceCallback } from 'usehooks-ts';
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

  const params=useParams<{userName:string}>();
  const [isLoading,setisLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [isCheckingmessage,setIsCheckingmessage]=useState(false);
  const [MessageError,setMessageError]=useState('');
  const [sending,setSending]=useState(false);
  const [questionSuggestions,setQuestionSuggestions]=useState<string[]>([]);
  const decodedUserName=decodeURIComponent(params.userName);
  const debounce=useDebounceCallback(setMessage,500);
  const form=useForm<z.infer<typeof messageSchema>>({
    resolver:zodResolver(messageSchema),
    defaultValues:{
        content:'',
    }
  });
  useEffect(()=>{
    const messageCheck=async()=>{
      setIsCheckingmessage(true);
      setMessageError('');
      if (!message) {
        setIsCheckingmessage(false);
        setMessageError('');
        return;
      }
        try{
          let warnings:warningTypes[]=[];
          const result=messageAuthenticityCheckSchema.safeParse({message});
          // console.log("Result from message authenticity check",result);
          if(!result.success){
            warnings=result.error.issues.map((issues)=>{
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
        catch(err){
          console.log("Error in message check",err);
          toast.error('Error in checking message authenticity');
        }
        finally{
          setIsCheckingmessage(false);
        }
    };
    messageCheck();
  },[message]);

  const copysuggestionMessage=(data:string)=>{
      form.setValue('content',data);
  }

const handleGenMessages=async()=>{
  setisLoading(true);
  setQuestionSuggestions([]);
  try{
    const response=await axios.get('/api/gen-messages');
    console.log("Response from generating messages",response);
    const msgs=response.data.msg
                .split('||')
                .map((q:any)=>q.trim())
                .filter(Boolean);
    // localStorage.setItem("generatedQuestions",JSON.stringify(msgs))
    setQuestionSuggestions(msgs);
  }
  catch(error){
      console.log(error);
      toast.error('Error generating message suggestions.')
  }
  finally{
    setisLoading(false);
  }
}


  const onSubmit=async(data:z.infer<typeof messageSchema>)=>{
    console.log("Message data",data);
    setSending(true);
    setMessage(data.content);
    try{
      // analyzing the message
      const responseFromAnalyzer=await axios.post('/api/message-analyzer',{message:data.content});
      console.log("Response from analyzer",responseFromAnalyzer.data);
      if(!responseFromAnalyzer.data.success){
        toast.error("Error in sending message");
        return;
      }   
      if(responseFromAnalyzer.data.message.state==="ALLOWED")
        {
        const res=await axios.post('/api/send-message',{username:decodedUserName,content:data.content});
        console.log("Response from sending message",res);
        if(res.data.success){
          toast.success(res.data.message);
          form.reset();
        }
        else{
          toast.error(res.data.message);
        }
        return;
      }
      //warning
      else if(responseFromAnalyzer.data.message.state==="WARNING"){
        setAiImprovedMessage(responseFromAnalyzer.data.message.improved_message);
        setShowWarningDialog(true);
        return;
      }
      //Blocked
      else if(responseFromAnalyzer.data.message.state==="BLOCKED"){
          setShowBlockedDialog(true);
          return;
      }

    }
    catch(err){
            const axiosError=err as AxiosError<apiResponse>;
            toast.error(axiosError.response?.data.message??'Error in verifying code');
    }
    finally{
        if(isCheckingmessage) setIsCheckingmessage(false);
        setSending(false);
    }
  }


  const handleAcceptRewrite = () => {
      form.setValue("content", aiImprovedMessage);
      setShowWarningDialog(false);
    };

  const handleEditManually = () => {
      setShowWarningDialog(false);
    };

  useEffect(()=>{
    const getMessages=localStorage.getItem('generatedQuestions')??'[]';
    if(getMessages) setQuestionSuggestions(JSON.parse(getMessages));
  },[])

  return (
    <div className="mt-10 max-w-2xl mx-auto space-y-8 flex flex-col">
        <div>
            <h1 className='text-center font-bold text-2xl'>
                Public Profile URL
            </h1>
        <div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Send message to ${decodedUserName}`}</FormLabel>
              <FormControl>
                <Input 
                type="text" placeholder="Write your message here ....." {...field} 
                onChange={(e)=>{
                  field.onChange(e);
                  debounce(e.target.value);
                }}
                />
              </FormControl>
              {isCheckingmessage && (<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />)}
              <p className={`text-sm ${MessageError && 'text-red-500'}`}>
                {MessageError}
              </p>
               <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {
            sending ? (
            <div className='flex flex-row space-x-2'>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Sending
            </div>
            ) : "Send Message"
          }
        </Button>
      </form>
    </Form>
    </div>
        </div>
         <Separator className="my-4" />
        <div className='flex flex-col space-y-3'>
          <div>
          <Button disabled={isLoading}  onClick={handleGenMessages}>
             {
              isLoading ? (
                <div className='flex flex-row space-x-2'>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating...
                </div>  
              ):  'Generate Message Suggestions'
            }
          </Button>
          </div>

          <div className='flex flex-col space-y-3'>
            {
              questionSuggestions.length>0 && (   
                questionSuggestions.map((question,index)=>(
                  <div key={index} className='hover:bg-gray-100 cursor-pointer p-4 border rounded-md bg-gray-50 text-center' onClick={()=>copysuggestionMessage(question)}>
                    {question}
                  </div>
                )
              )
            )
            }
          </div>

          <Separator className="my-6" />
            <div className="text-center mb-10">
              <div className="mb-4">Get Your Message Board</div>
              <Link href={'/sign-up'}>
                <Button>Create Your Account</Button>
              </Link>
            </div>
          </div>
            
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message may be inappropriate</DialogTitle>
            <DialogDescription>
              Your message may come across as harsh. You can rewrite it to sound
              more respectful without changing its meaning.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border p-3 text-sm">
            <strong>Suggested rewrite:</strong>
            <p className="mt-1">{aiImprovedMessage}</p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleEditManually}>
              Edit myself
            </Button>
            <Button onClick={handleAcceptRewrite}>
              Use AI rewrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message cannot be sent</DialogTitle>
            <DialogDescription>
              This message contains inappropriate content and cannot be submitted.
              Please rewrite the message using respectful language.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setShowBlockedDialog(false)}>
              Rewrite message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>




        </div>
  )
}

export default page
