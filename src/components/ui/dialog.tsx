import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

// ── Primitives pass-through ──────────────────────────────────────────────────

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ children, className, ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close data-slot="dialog-close" className={className} {...props}>
      {children}
    </DialogPrimitive.Close>
  )
}

// ── Overlay ──────────────────────────────────────────────────────────────────

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0 duration-150",
        className
      )}
      {...props}
    />
  )
}

// ── DialogContent ────────────────────────────────────────────────────────────
// • max-h-[90vh] + overflow-y-auto → le contenu est scrollable
// • DialogHeader sticky top-0, DialogFooter sticky bottom-0
// • Rétrocompatible : tout code existant fonctionne sans modification

function DialogContent({
  className,
  children,
  showCloseButton = false,
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // Centrage
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          // Dimensions
          "w-full max-w-[calc(100%-2rem)] sm:max-w-2xl",
          "max-h-[90vh] overflow-y-auto",
          // Padding horizontal — fournit l'indentation par défaut au contenu
          "px-6",
          // Style identique à la capture d'écran
          "bg-white dark:bg-zinc-900",
          "border border-slate-300 dark:border-zinc-700",
          "rounded-lg shadow-xl",
          "outline-none",
          // Animation
          "duration-150",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}

        {/* Bouton ✕ flottant — visible seulement si le consumer n'inclut pas
            de DialogHeader (qui a son propre bouton de fermeture) */}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-btn"
            className={cn(
              "absolute top-3 right-3 z-20",
              "flex h-7 w-7 items-center justify-center rounded-full",
              "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
              "dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700",
              "transition-colors focus:outline-none"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

// ── DialogHeader ─────────────────────────────────────────────────────────────
// Sticky en haut du scroll, fond blanc, séparateur en bas + bouton ✕ intégré

function DialogHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        // Sticky dans la zone scrollable
        "sticky top-0 z-10",
        // -mx-6 annule le px-6 du parent DialogContent → border-b pleine largeur
        "-mx-6",
        // Style
        "flex items-center justify-between gap-4",
        "px-6 py-4",
        "bg-white dark:bg-zinc-900",
        "border-b border-slate-200 dark:border-zinc-700",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>

      {/* Bouton ✕ intégré dans le header */}
      <DialogPrimitive.Close
        className={cn(
          "flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full",
          "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
          "dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-700",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </DialogPrimitive.Close>
    </div>
  )
}

// ── DialogBody ────────────────────────────────────────────────────────────────
// Zone de contenu principale avec padding standard

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("-mx-6 px-6 py-5", className)}
      {...props}
    />
  )
}

// ── DialogFooter ─────────────────────────────────────────────────────────────
// Sticky en bas du scroll, fond légèrement grisé, séparateur en haut

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // Sticky en bas
        "sticky bottom-0 z-10",
        // -mx-6 annule le px-6 du parent DialogContent → border-t pleine largeur
        "-mx-6",
        // Style
        "flex flex-wrap items-center justify-end gap-3",
        "px-6 py-4",
        "bg-slate-50 dark:bg-zinc-800/60",
        "border-t border-slate-200 dark:border-zinc-700",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          className={cn(
            "inline-flex items-center justify-center rounded-md",
            "border border-slate-300 dark:border-zinc-600",
            "px-4 py-2 text-sm font-medium",
            "text-slate-700 dark:text-zinc-200",
            "hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
          )}
        >
          Fermer
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

// ── DialogTitle ──────────────────────────────────────────────────────────────

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-xl font-bold text-slate-900 dark:text-zinc-100 leading-tight",
        className
      )}
      {...props}
    />
  )
}

// ── DialogDescription ────────────────────────────────────────────────────────

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-slate-500 dark:text-zinc-400 mt-0.5", className)}
      {...props}
    />
  )
}

// ── Exports ──────────────────────────────────────────────────────────────────

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
