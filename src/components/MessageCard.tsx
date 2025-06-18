"use client";

import React from "react";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (feedbackId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast.success(response.data.message || "Feedback deleted successfully");
      onMessageDelete(message._id as string);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to delete feedback"
      );
    }
  };
  return (
    <Card className="feedback-card group transition-shadow hover:shadow-md border border-border/50 dark:border-border/30 bg-background/90 dark:bg-background/70 backdrop-blur-sm rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1.5 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-primary/70 dark:bg-primary/80 mr-2 animate-pulse" />
              <span className="font-medium">
                {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
              </span>
            </div>
            <CardTitle className="text-base sm:text-lg break-words leading-relaxed text-foreground">
              {message.content}
            </CardTitle>
          </div>

          {/* Delete Button with Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out rounded-full hover:bg-destructive/10"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors duration-200" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-destructive/20 dark:border-destructive/30 shadow-xl rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive dark:text-destructive/90 font-semibold">
                  Delete this message?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border border-border rounded-full px-4">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full px-4"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-0.5 w-1/3 bg-gradient-to-r from-primary/40 to-transparent rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
}
