"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, SlidersHorizontal, ShoppingBag, X, Info } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "cart" | "filter" | "info";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "cart":
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case "filter":
        return <SlidersHorizontal className="w-4 h-4 text-emerald-600" />;
      case "info":
        return <Info className="w-4 h-4 text-amber-600" />;
      case "success":
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pointer-events-auto bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-800 flex items-start gap-3 relative overflow-hidden group"
    >
      <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/50 shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="font-extrabold text-xs text-stone-100 tracking-tight leading-snug">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-[11px] text-stone-400 leading-normal">
            {toast.message}
          </p>
        )}
        {toast.actionLabel && toast.onAction && (
          <button
            onClick={() => {
              toast.onAction?.();
              onDismiss(toast.id);
            }}
            className="mt-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            {toast.actionLabel} &rarr;
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle bottom progress bar line */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 3200) / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-0.5 bg-emerald-500"
      />
    </motion.div>
  );
}
