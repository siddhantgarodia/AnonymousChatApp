"use client";

import { toast as sonnerToast } from "sonner";

// Reexporting Sonner toast functions with the same API shape as the previous custom toast
// This makes migration simpler

// Type definitions to match previous implementation
type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

// Simple wrapper around Sonner to maintain API compatibility
function toast(props: ToastProps) {
  const { title, description, variant, duration, ...rest } = props;

  if (variant === "destructive") {
    return sonnerToast.error(title as string, {
      description,
      duration,
      ...rest,
    });
  } else if (variant === "success") {
    return sonnerToast.success(title as string, {
      description,
      duration,
      ...rest,
    });
  } else {
    return sonnerToast(title as string, {
      description,
      duration,
      ...rest,
    });
  }
}

// Custom hook that returns the toast function
// This maintains compatibility with code that uses useToast().toast(...)
function useToast() {
  return {
    toast,
    // These replicate the original implementation's API
    success: (message: string, options = {}) =>
      sonnerToast.success(message, options),
    error: (message: string, options = {}) =>
      sonnerToast.error(message, options),
    warning: (message: string, options = {}) =>
      sonnerToast.warning(message, options),
    info: (message: string, options = {}) => sonnerToast(message, options),
    dismiss: (id?: string) => sonnerToast.dismiss(id),
  };
}

// Direct methods for common toast types
toast.success = sonnerToast.success;
toast.error = sonnerToast.error;
toast.warning = sonnerToast.warning;
toast.info = sonnerToast;
toast.dismiss = sonnerToast.dismiss;
toast.promise = sonnerToast.promise;

export { useToast, toast };
