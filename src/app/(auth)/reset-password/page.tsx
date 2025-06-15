"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordRequestSchema } from "@/schemas/resetPasswordSchema";
import { useState } from "react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordRequestSchema>>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordRequestSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reset-password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);

        // We need the username for the reset flow
        // We'll try to extract it from the identifier first
        const identifier = data.identifier;
        let username = identifier;

        // If identifier contains @ symbol, it's likely an email, so we need to ask the user for username
        if (identifier.includes("@")) {
          router.push(
            `/reset-password/verify?identifier=${encodeURIComponent(identifier)}`
          );
        } else {
          // If identifier is likely a username, proceed directly
          router.push(
            `/reset-password/verify?username=${encodeURIComponent(identifier)}`
          );
        }
      } else {
        toast.error(result.message || "Failed to request password reset");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground transition-colors px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-lg border transition-colors">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email or username to receive a verification code
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <Input {...field} type="text" />
                  <FormDescription className="text-muted-foreground text-sm">
                    Enter your registered email address or username.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Remember your password?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
