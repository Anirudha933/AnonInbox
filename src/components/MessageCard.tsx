'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { X } from 'lucide-react'
import { Message } from '@/models/User'
import axios from 'axios'
import { toast } from "sonner"
import { apiResponse } from '@/types/ApiResponse'
type MessageCardProp={
  message:Message;
  onMessageDelete:(messageId:string)=>void
}
function MessageCard({message,onMessageDelete}:MessageCardProp) {

  const handleDeleteConfirm=async()=>{
    const response=await axios.delete<apiResponse>(`/api/delete-message/${message._id}`);
    console.log("Response from deleting message",response);
    toast.success('Message deleted successfully');
    onMessageDelete(message?._id);
  }

  return (
    <Card className="w-[350px] p-3">
      <CardHeader>
        <CardTitle>Anonymous</CardTitle>
        {/* <CardDescription>{message.content}</CardDescription> */}
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            {message.content}
          </div>
        </form>
      </CardContent>
      <CardContent className='flex flex-row text-center items-center gap-2'>
        <span>Created At: </span>
        <p className="text-sm text-muted-foreground">{new Date(message.createdAt).getDate()}/{new Date(message.createdAt).getMonth()}/{new Date(message.createdAt).getFullYear()}</p>
      </CardContent>
       <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
        <AlertDialogTrigger asChild>
        <Button variant="destructive"><X className='w-2 h-4 text-center'/></Button>
      </AlertDialogTrigger>
    </AlertDialog>
    </Card>
  )
}

export default MessageCard
