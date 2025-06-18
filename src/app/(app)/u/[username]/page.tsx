"use client";

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const router = useRouter();
  const params = useParams();
  const username = typeof params.username === "string" ? params.username : "";

  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isAcceptingMessages, setIsAcceptingMessages] =
    useState<boolean>(false);
  const [isCheckingUser, setIsCheckingUser] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserExists = async () => {
      try {
        setIsCheckingUser(true);
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("reload") === "true") {
          router.replace(`/u/${username}`);
        }

        const response = await axios.get<ApiResponse>(
          `/api/check-message-eligibility?username=${username}`
        );

        if (response.data.success) {
          setUserExists(response.data.exists === true);
          setIsAcceptingMessages(response.data.acceptsMessages === true);
        } else {
          toast.error("Error checking username: " + response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          setUserExists(false);
          setIsAcceptingMessages(false);
        } else {
          toast.error("Could not verify user. Try again later.");
        }
      } finally {
        setIsCheckingUser(false);
      }
    };

    if (username) {
      checkUserExists();
    } else {
      setUserExists(false);
      setIsAcceptingMessages(false);
      setIsCheckingUser(false);
    }
  }, [username, router]);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast.success(response.data.message || "Message sent successfully!");
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ?? "Failed to send message";
      toast.error(errorMessage);

      if (axiosError.response?.status === 404) {
        setUserExists(false);
        router.replace(`/u/${username}?reload=true`);
      } else if (axiosError.response?.status === 403) {
        setIsAcceptingMessages(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setSuggestError(null);
    try {
      const res = await axios.post("/api/suggest-messages");
      const questions = res.data.questions;

      if (Array.isArray(questions)) {
        setSuggestions(questions);
      } else {
        setSuggestions([]);
        setSuggestError("Unexpected format from server.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setSuggestError("Could not fetch suggestions.");
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-card rounded-lg shadow-sm max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-foreground">
        Send Honest Feedback
      </h1>

      {isCheckingUser ? (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Checking user profile...</p>
        </div>
      ) : userExists === false ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-xl mb-4 text-foreground">
            User @{username} does not exist.
          </p>
          <Link href="/sign-up">
            <Button className="mt-2">Create Your Account</Button>
          </Link>
        </div>
      ) : !isAcceptingMessages ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-xl mb-4 text-muted-foreground">
            @{username} is not accepting feedback at this time.
          </p>
          <Link href="/">
            <Button className="mt-2">Back to Home</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-muted to-muted/50 p-6 rounded-lg mb-6 border border-border shadow-sm">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium text-foreground">
                        Send Feedback to{" "}
                        <span className="text-primary font-semibold">
                          @{username}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your honest feedback here..."
                          className="resize-none min-h-[120px] bg-background text-foreground border-border focus:border-ring focus:ring-ring shadow-inner"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between mt-1">
                        <FormMessage />
                        <div className="text-xs text-muted-foreground">
                          {messageContent?.length || 0}/500 characters
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-center pt-2">
                  {isLoading ? (
                    <Button disabled className="px-6">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!messageContent}
                      className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Send Feedback
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </>
      )}

      {userExists && isAcceptingMessages && (
        <div className="space-y-4 my-8">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-muted to-muted/40 p-4 rounded-lg border border-border">
              <div className="flex items-center">
                <Button
                  onClick={fetchSuggestedMessages}
                  className="mb-2 sm:mb-0 bg-background border-border text-foreground hover:bg-muted"
                  variant="outline"
                  disabled={isSuggestLoading}
                >
                  {isSuggestLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating suggestions...
                    </>
                  ) : (
                    "Generate Message Ideas"
                  )}
                </Button>
                <span className="hidden sm:inline ml-3 text-sm text-muted-foreground">
                  Need inspiration?
                </span>
              </div>
              <p className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                Click any suggestion to use it
              </p>
            </div>
          </div>

          <Card className="border border-border shadow-md overflow-hidden">
            <CardHeader className="pb-2 bg-muted border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">
                Message Suggestions
              </h3>
            </CardHeader>
            <CardContent className="pt-3 bg-background">
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {suggestError ? (
                  <p className="text-destructive col-span-2 p-3 bg-muted rounded border border-destructive">
                    {suggestError}
                  </p>
                ) : suggestions.length > 0 ? (
                  suggestions.map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto py-3 px-4 justify-start border-border hover:bg-muted transition-all duration-200 
                     break-words whitespace-pre-wrap w-full max-w-full overflow-hidden"
                      onClick={() => handleMessageClick(message)}
                    >
                      {message}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2 py-4 text-center">
                    Click “Generate Message Ideas” to get AI-powered message
                    suggestions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator className="my-6" />
      <div className="text-center bg-muted p-6 rounded-lg">
        <div className="mb-4 font-medium text-foreground">
          Want your own feedback page?
        </div>
        <Link href="/sign-up">
          <Button className="px-6">Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
