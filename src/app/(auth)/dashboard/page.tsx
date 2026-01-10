'use client'
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Message } from '@/models/User';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { apiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { Switch } from "radix-ui";
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const page = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  
  const handleDeleteMessage=async(messageId:string)=>{
    setMessages(messages.filter((message)=>message._id!==messageId));
  }

  const {data:session}=useSession();
  // console.log("Session in dashboard page",session);

  const form=useForm({
    resolver:zodResolver(acceptMessageSchema),
  });

  const {register,watch,setValue}=form;
  const acceptMessages=watch('acceptMessages');
  const fetchAcceptMessages=useCallback(
    async()=>{
      setIsSwitchLoading(true);
      try {
        const response=await axios.get('/api/accept-message');
        console.log("Response from accept message",response);
        setValue('acceptMessages',response.data.isacceptingMessage);
      } catch (error) {
        const axiosError=error as AxiosError<apiResponse>;
        toast.error(axiosError.response?.data.message??'Error in accepting messages');
      }
      finally{
        setIsSwitchLoading(false);
      }
    },[setValue]
  );
  const fetchMessages=useCallback(
    async(refresh:boolean=false)=>{
      setIsLoading(true);
      setIsSwitchLoading(false);
       try {
        const response=await axios.get('/api/get-messages');
        console.log("Response from fetching message",response);
        setMessages(response.data.data|| []);
        if(refresh){
          toast.success("Messages fetched successfully");
        }
      } catch (error) {
        const axiosError=error as AxiosError<apiResponse>;
        toast.error(axiosError.response?.data.message??'Error in fetching messages');
      }
      finally{
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },[setIsLoading,setMessages]
  )
  useEffect(()=>{
    if(!session || !session.user){
      return;
    }
    fetchAcceptMessages();
    fetchMessages();
  },[session,setValue,fetchAcceptMessages,fetchMessages])

  const handleSwitchChange=async()=>{
    try {
      const response=await axios.post<apiResponse>('/api/accept-message',{acceptMessage:!acceptMessages});
      console.log("Response from post request accept message",response);
      setValue('acceptMessages',!acceptMessages);
      if(response.data.success){
        toast.success(response.data.message);
      }
    } catch (error) {
      const axiosError=error as AxiosError<apiResponse>;
        toast.error(axiosError.response?.data.message??'Error in accepting messages');
    }
  }

  const userName=session?.user.userName;
  useEffect(() => {
  if (typeof window !== 'undefined' && session?.user?.userName) {
    const baseURL = `${window.location.protocol}//${window.location.host}`;
    setProfileUrl(`${baseURL}/u/${userName}`);
  }
}, [session]);
  const copyToClipboard=()=>{
    navigator.clipboard.writeText(profileUrl).then(()=>{
      toast.success('Copied to clipboard');
    })
  }
  if(!session || !session.user){
    return <div>Please Login</div>
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">

      <Switch.Root
				className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black"
				 {...register('acceptMessages')}
        id="airplane-mode"
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
			>
				<Switch.Thumb className="block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
			</Switch.Root>
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default page
