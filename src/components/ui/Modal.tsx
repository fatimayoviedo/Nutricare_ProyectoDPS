"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}

const sizeClasses = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, title, children, onClose, size = "md" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className={`flex max-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-3xl bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6 ${sizeClasses[size]}`}>
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
