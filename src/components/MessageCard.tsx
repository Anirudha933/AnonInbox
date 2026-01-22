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
type MessageCardProp = {
  message: Message;
  onMessageDelete: (messageId: string) => void
}
function MessageCard({ message, onMessageDelete }: MessageCardProp) {

  const handleDeleteConfirm = async () => {
    const response = await axios.delete<apiResponse>(`/api/delete-message/${message._id}`);
    console.log("Response from deleting message", response);
    toast.success('Message deleted successfully');
    onMessageDelete(message?._id);
  }

  return (
    <Card className="card-bordered bg-card backdrop-blur-sm border-border text-card-foreground hover:bg-accent transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-xl text-orange-400">Anonymous Message</CardTitle>
        <div className="absolute top-4 right-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-popover border-border text-popover-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action cannot be undone. This will permanently delete and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {/* <CardDescription>{message.content}</CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="text-lg font-medium text-foreground">
          {message.content}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between items-center text-xs text-muted-foreground mt-2'>
        <span>Received: {new Date(message.createdAt).toLocaleDateString()}</span>
        <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
      </CardFooter>

    </Card>
  )
}

export default MessageCard
