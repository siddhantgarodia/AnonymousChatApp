"use client";

import { MessageCard } from "@/components/MessageCard";
import { MessageSummary } from "@/components/MessageSummary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw, MessageCircleX, KeyRound } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { verifySchema } from "@/schemas/acceptMessageSchema";
import { toast } from "sonner";

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      // Initialize with false to prevent uncontrolled-to-controlled warning
      acceptMessages: false,
    },
  });
  const router = useRouter();

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessage || false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to fetch message settings"
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages");
      setMessages(response.data.messages || []);
      if (refresh) toast.success("Refreshed Messages: Showing latest messages");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to fetch messages"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to update message settings"
      );
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied to clipboard.");
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        User Dashboard
      </h1>

      {/* Copy Link */}
      <div className="mb-6 bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Share your profile to receive messages
        </h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input w-full p-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-100"
          />
          <Button onClick={copyToClipboard} className="rounded-l-none">
            Copy
          </Button>{" "}
        </div>
      </div>

      {/* Accept Messages Toggle */}
      <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg border border-blue-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
            className="mr-3"
          />
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-300">
              Accept Messages:
            </span>
            <span
              className={`ml-1 font-semibold ${
                acceptMessages
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {acceptMessages ? "On" : "Off"}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {acceptMessages
            ? "Users can send you anonymous messages"
            : "Message receiving is turned off"}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Header + Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">
          Your Messages
        </h2>
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
          className="flex items-center bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2 text-blue-600" />
          )}
          Refresh Messages
        </Button>
      </div>

      {/* Message Summary */}
      <MessageSummary isVisible={messages.length > 0} />

      {/* Message Grid or Empty State */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id?.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-12 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-center mb-4">
              <MessageCircleX
                size={64}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No messages to display yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Share your profile link to receive anonymous messages.
            </p>
            {acceptMessages ? (
              <div className="text-xs text-green-600 dark:text-green-400 inline-block px-3 py-1 bg-green-50 dark:bg-green-900 rounded-full border border-green-100 dark:border-green-700">
                Message receiving is active
              </div>
            ) : (
              <div className="text-xs text-red-600 dark:text-red-400 inline-block px-3 py-1 bg-red-50 dark:bg-red-900 rounded-full border border-red-100 dark:border-red-700">
                Message receiving is turned off
              </div>
            )}
          </div>
        )}{" "}
      </div>
      {/* Change Password Section */}
      <div className="mb-6 bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Account Security
        </h2>
        <div className="flex items-center justify-between">
          {" "}
          <div>
            {" "}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              For security reasons, it&apos;s recommended to change your
              password regularly.
            </p>
          </div>
          <Button
            onClick={() => router.push("/reset-password")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
