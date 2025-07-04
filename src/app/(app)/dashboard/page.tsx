"use client";

import { MessageCard } from "@/components/MessageCard";
import { MessageSummary } from "@/components/MessageSummary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  Loader2,
  RefreshCcw,
  MessageCircleX,
  KeyRound,
  MessageCircle,
  X,
} from "lucide-react";
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
  const [profileUrl, setProfileUrl] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const handleDeleteMessage = (feedbackId: string) => {
    setMessages(messages.filter((message) => message._id !== feedbackId));
  };

  const handleSendMessage = () => {
    if (!inputUsername || inputUsername.trim() === "") {
      setUsernameError("Please enter a username");
      return;
    }

    setUsernameError("");
    router.push(`/u/${inputUsername.trim()}`);
    setShowUsernameInput(false);
    setInputUsername("");
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

  // Username dialog component
  const UsernameInputDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            Share Anonymous Feedback
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setShowUsernameInput(false);
              setInputUsername("");
              setUsernameError("");
            }}
          >
            <X size={16} />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className={usernameError ? "border-red-500" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              autoFocus
            />
            {usernameError && (
              <p className="text-xs text-red-500 mt-1">{usernameError}</p>
            )}
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSendMessage}
          >
            <MessageCircle size={16} className="mr-2" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

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

    // Set profile URL only on the client side
    if (typeof window !== "undefined") {
      const { username } = session.user as User;
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied to clipboard.");
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm w-full max-w-6xl">
      {showUsernameInput && <UsernameInputDialog />}

      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        User Dashboard
      </h1>

      {/* Copy Link */}
      <div className="mb-6 bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Share your profile to receive feedback
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

      {/* Accept Feedback Toggle */}
      <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg border border-orange-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
            className="mr-3"
          />
          <div>
            <span className="font-medium text-orange-800 dark:text-orange-300">
              Accept Feedback:
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
            ? "Users can send you honest feedback"
            : "Feedback receiving is turned off"}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">
          Give Feedback
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUsernameInput(true)}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md py-3 transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            Give Feedback
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Header + Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">
          Your Feedback
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
            className="flex items-center bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2 text-orange-600" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2 text-orange-600" />
            )}
            Refresh Feedback
          </Button>
        </div>
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
          <div className="col-span-2 text-center py-12 bg-gradient-to-r from-slate-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-orange-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-center mb-4">
              <MessageCircleX
                size={64}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No feedback to display yet.
            </p>{" "}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Share your profile link to receive honest feedback.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
              {" "}
              <Button
                onClick={() => setShowUsernameInput(true)}
                className="flex items-center bg-blue-600 text-white hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send a Feedback
              </Button>
            </div>
            {acceptMessages ? (
              <div className="text-xs text-green-600 dark:text-green-400 inline-block px-3 py-1 bg-green-50 dark:bg-green-900 rounded-full border border-green-100 dark:border-green-700">
                Feedback receiving is active
              </div>
            ) : (
              <div className="text-xs text-red-600 dark:text-red-400 inline-block px-3 py-1 bg-red-50 dark:bg-red-900 rounded-full border border-red-100 dark:border-red-700">
                Feedback receiving is turned off
              </div>
            )}
          </div>
        )}{" "}
      </div>
      <Separator className="my-6" />
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
