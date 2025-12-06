"use client";

import { useEffect, useState } from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@radix-ui/react-toast";
import { X } from "lucide-react";

export type ToastType = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent<Omit<ToastType, "id">>) => {
      const toast = {
        id: Math.random().toString(36).substr(2, 9),
        ...event.detail,
      };
      setToasts((prev) => [...prev, toast]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    window.addEventListener("show-toast", handleShowToast as EventListener);

    return () => {
      window.removeEventListener(
        "show-toast",
        handleShowToast as EventListener
      );
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getVariantClasses = (variant: ToastType["variant"]) => {
    switch (variant) {
      case "success":
        return "bg-green-2 border-green-6 text-green-11";
      case "error":
        return "bg-red-2 border-red-6 text-red-11";
      case "warning":
        return "bg-amber-2 border-amber-6 text-amber-11";
      default:
        return "bg-gray-2 border-gray-6 text-gray-12";
    }
  };

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          className={`${getVariantClasses(toast.variant)} rounded-lg border p-4`}
        >
          <div className="flex justify-between items-start">
            <div>
              <ToastTitle className="font-semibold">{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription className="text-sm mt-1">
                  {toast.description}
                </ToastDescription>
              )}
            </div>
            <ToastClose onClick={() => removeToast(toast.id)} className="ml-4">
              <X className="w-4 h-4" />
            </ToastClose>
          </div>
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col gap-2 w-full max-w-md p-6 z-50" />
    </ToastProvider>
  );
}
