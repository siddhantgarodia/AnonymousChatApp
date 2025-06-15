"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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

const resetPasswordVerifyFormSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" }),
    code: z
      .string()
      .length(6, { message: "Verification code must be 6 digits long" }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, { message: "Confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [usernameFromParam, setUsernameFromParam] = useState<string | null>(
    null
  );
  const [isUsernameLocked, setIsUsernameLocked] = useState(false);

  useEffect(() => {
    const username = searchParams.get("username");
    const identifier = searchParams.get("identifier");

    if (username) {
      setUsernameFromParam(username);
      setIsUsernameLocked(true);
    } else if (identifier && !identifier.includes("@")) {
      setUsernameFromParam(identifier);
      setIsUsernameLocked(true);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof resetPasswordVerifyFormSchema>>({
    resolver: zodResolver(resetPasswordVerifyFormSchema),
    defaultValues: {
      username: usernameFromParam || "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form when usernameFromParam changes
  useEffect(() => {
    if (usernameFromParam) {
      form.setValue("username", usernameFromParam);
    }
  }, [usernameFromParam, form]);
  const onSubmit = async (
    data: z.infer<typeof resetPasswordVerifyFormSchema>
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reset-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          code: data.code,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push("/sign-in");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    }
    setIsSubmitting(false);
  };
  const handleResendCode = async () => {
    const username = form.getValues("username");

    if (!username) {
      toast.error("Username is required to resend the verification code");
      return;
    }

    setIsResending(true);
    try {
      const identifier = searchParams.get("identifier");
      let email = "";

      // If we have an identifier that contains @, use it as email
      if (identifier && identifier.includes("@")) {
        email = identifier;
      } else {
        // Otherwise, we need the user to provide their email
        const emailInput = window.prompt(
          "Please enter your email address to resend the verification code:"
        );
        if (!emailInput) {
          setIsResending(false);
          return;
        }
        email = emailInput;
      }

      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to resend verification code");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    }
    setIsResending(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground transition-colors px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-lg border transition-colors">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Verify & Reset</h1>
          <p className="text-muted-foreground text-sm">
            Enter the verification code and your new password
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input {...field} type="text" disabled={isUsernameLocked} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} type="text" maxLength={6} />
                  <FormDescription className="text-muted-foreground text-sm">
                    Enter the 6-digit code sent to your email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>{" "}
        <div className="text-center text-sm text-muted-foreground">
          {" "}
          <p>
            Didn&apos;t receive a code?{" "}
            <button
              onClick={handleResendCode}
              className="text-primary hover:underline"
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
