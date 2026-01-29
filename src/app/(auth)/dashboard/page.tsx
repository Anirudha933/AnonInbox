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
import { Loader2, RefreshCcw, Copy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const Dashboard = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const { data: session } = useSession();
  // console.log("Session in dashboard page",session);

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');
  const fetchAcceptMessages = useCallback(
    async () => {
      setIsSwitchLoading(true);
      try {
        const response = await axios.get('/api/accept-message');
        console.log("Response from accept message", response);
        setValue('acceptMessages', response.data.isacceptingMessage);
      } catch (error) {
        const axiosError = error as AxiosError<apiResponse>;
        toast.error(axiosError.response?.data.message ?? 'Error in accepting messages');
      }
      finally {
        setIsSwitchLoading(false);
      }
    }, [setValue]
  );
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get('/api/get-messages');
        console.log("Response from fetching message", response);
        setMessages(response.data.data || []);
        if (refresh) {
          toast.success("Messages fetched successfully");
        }
      } catch (error) {
        const axiosError = error as AxiosError<apiResponse>;
        toast.error(axiosError.response?.data.message ?? 'Error in fetching messages');
      }
      finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    }, [setIsLoading, setMessages]
  )
  useEffect(() => {
    if (!session || !session.user) {
      return;
    }
    fetchAcceptMessages();
    fetchMessages();
  }, [session, setValue, fetchAcceptMessages, fetchMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<apiResponse>('/api/accept-message', { acceptMessage: !acceptMessages });
      console.log("Response from post request accept message", response);
      setValue('acceptMessages', !acceptMessages);
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<apiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Error in accepting messages');
    }
  }

  const userName = session?.user.userName;
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.userName) {
      const baseURL = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseURL}/u/${userName}`);
    }
  }, [session]);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success('Copied to clipboard');
    })
  }
  if (!session || !session.user) {
    return <div>Please Login</div>
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-card backdrop-blur-md border border-border rounded-2xl w-full max-w-6xl shadow-2xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">User Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Copy Your Unique Link</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-3 rounded-lg bg-muted/50 border-input text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <Button onClick={copyToClipboard} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[100px]">
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <Switch.Root
            className={`cursor-pointer relative h-[28px] w-[50px] rounded-full shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black transition-colors duration-300 ${acceptMessages ? 'bg-green-500' : 'bg-slate-700'}`}
            {...register('acceptMessages')}
            id="airplane-mode"
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          >
            <Switch.Thumb className={`block size-[24px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-300 will-change-transform ${acceptMessages ? 'translate-x-[22px]' : ''}`} />
          </Switch.Root>
          <label htmlFor="airplane-mode" className="text-foreground font-medium">
            Accept Messages: <span className={`${acceptMessages ? 'text-green-400' : 'text-muted-foreground'} font-bold`}>{acceptMessages ? 'On' : 'Off'}</span>
          </label>
        </div>
      </div>

      <Separator className="bg-border my-6" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Your Messages</h2>
        <Button
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
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
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border border-dashed">
            <p>No messages to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard
