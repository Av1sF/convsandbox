"use client";
import React from "react";
import { cn } from "@/utils/cn";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Extra classes for the card (size, padding, bg override, etc.). Wins over defaults via twMerge. */
  className?: string;
  /** Extra classes for the overlay (bg, padding, backdrop). Wins over defaults via twMerge. */
  overlayClassName?: string;
  /** Render the top-right ✕ close button. */
  showCloseButton?: boolean;
  /** Clicking the backdrop calls onClose. Clicking the card never closes. */
  closeOnBackdropClick?: boolean;
}

export default function Modal({
  onClose,
  children,
  className,
  overlayClassName,
  showCloseButton = false,
  closeOnBackdropClick = false,
}: ModalProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4",
        overlayClassName
      )}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        className={cn("bg-bg rounded-2xl relative", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-2xl sm:text-xl text-foreground/70 hover:text-foreground transition"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
