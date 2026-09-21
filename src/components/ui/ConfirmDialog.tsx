"use client";

import { AlertTriangle, CheckCircle2, MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger" | "success";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  const Icon = tone === "danger" ? AlertTriangle : tone === "success" ? CheckCircle2 : MessageCircleMore;
  const iconStyle = tone === "danger" ? "bg-red-50 text-red-600" : tone === "success" ? "bg-[var(--soft-green)] text-[var(--primary)]" : "bg-[var(--soft-green)] text-[var(--primary)]";
  const confirmStyle = tone === "danger" ? "bg-red-600 text-white hover:bg-red-700" : "";

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-[0_28px_80px_rgba(13,45,37,0.28)] sm:p-7">
        <div className={`grid size-14 place-items-center rounded-2xl ${iconStyle}`}><Icon className="size-7" aria-hidden="true" /></div>
        <h2 id="confirm-dialog-title" className="mt-5 text-2xl font-extrabold tracking-[-0.02em]">{title}</h2>
        <p id="confirm-dialog-description" className="mt-2 leading-7 text-[var(--ink-muted)]">{description}</p>
        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          {onCancel ? <Button type="button" variant="secondary" onClick={onCancel}>{cancelLabel}</Button> : null}
          <Button type="button" onClick={onConfirm} className={`${confirmStyle} ${onCancel ? "" : "sm:col-span-2"}`}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
