"use client"

/**
 * Select components — implémentation native <select>
 * ───────────────────────────────────────────────────────────────────────────
 * API identique à l'ancienne (Select, SelectTrigger, SelectContent,
 * SelectItem, SelectValue, SelectGroup, SelectLabel, SelectSeparator…)
 * mais le rendu utilise un <select> HTML natif :
 *   • border violette, flèche custom, look identique à la capture d'écran
 *   • liste déroulante native du navigateur avec scrollbar intégrée
 *   • toutes les options sont des <option> ou <optgroup> natifs
 * ───────────────────────────────────────────────────────────────────────────
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDownIcon } from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────

interface OptionItem {
  value: string
  label: string
  disabled?: boolean
}

interface OptGroup {
  label: string
  options: OptionItem[]
}

interface SelectCtxValue {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  options: OptionItem[]
  optGroups: OptGroup[]
  placeholder?: string
  size?: "sm" | "default"
}

// ── Context ──────────────────────────────────────────────────────────────────

const SelectCtx = React.createContext<SelectCtxValue>({
  options: [],
  optGroups: [],
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function childrenToString(children: React.ReactNode): string {
  if (children === null || children === undefined) return ""
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (typeof children === "boolean") return ""
  if (Array.isArray(children)) return children.map(childrenToString).join("")
  if (React.isValidElement(children)) {
    return childrenToString((children.props as any).children)
  }
  return String(children)
}

function getCompName(el: React.ReactElement): string {
  const t = el.type
  if (typeof t === "string") return t
  if (typeof t === "function") return (t as any).displayName || (t as any).name || ""
  return ""
}

interface Collected {
  options: OptionItem[]
  optGroups: OptGroup[]
  placeholder?: string
}

function collectData(children: React.ReactNode): Collected {
  const options: OptionItem[] = []
  const optGroups: OptGroup[] = []
  let placeholder: string | undefined

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const name = getCompName(child)
    const p = child.props as any

    if (name === "SelectContent") {
      const inner = collectData(p.children)
      options.push(...inner.options)
      optGroups.push(...inner.optGroups)
      if (inner.placeholder) placeholder = inner.placeholder

    } else if (name === "SelectGroup") {
      // Cherche un SelectLabel dans ce groupe
      let groupLabel = ""
      React.Children.forEach(p.children, (gc: any) => {
        if (React.isValidElement(gc) && getCompName(gc) === "SelectLabel") {
          groupLabel = childrenToString((gc.props as any).children)
        }
      })
      const inner = collectData(p.children)
      if (groupLabel && inner.options.length > 0) {
        optGroups.push({ label: groupLabel, options: inner.options })
      } else {
        options.push(...inner.options)
      }

    } else if (name === "SelectItem") {
      options.push({
        value: p.value ?? "",
        label: childrenToString(p.children),
        disabled: !!p.disabled,
      })

    } else if (name === "SelectTrigger") {
      // Cherche SelectValue dans le trigger pour récupérer le placeholder
      React.Children.forEach(p.children, (tc: any) => {
        if (React.isValidElement(tc) && getCompName(tc) === "SelectValue") {
          if ((tc.props as any).placeholder) placeholder = (tc.props as any).placeholder
        }
      })

    } else if (name === "SelectValue") {
      if (p.placeholder) placeholder = p.placeholder

    } else if (p?.children) {
      const inner = collectData(p.children)
      options.push(...inner.options)
      optGroups.push(...inner.optGroups)
      if (inner.placeholder) placeholder = inner.placeholder
    }
  })

  return { options, optGroups, placeholder }
}

// ── Select (racine) ──────────────────────────────────────────────────────────

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children?: React.ReactNode
  name?: string
  /** Taille du trigger */
  size?: "sm" | "default"
  // props ignorées (compat. API ancienne)
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Select({
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  size = "default",
}: SelectProps) {
  const { options, optGroups, placeholder } = collectData(children)

  return (
    <SelectCtx.Provider
      value={{ value, defaultValue, onValueChange, disabled, options, optGroups, placeholder, size }}
    >
      {children}
    </SelectCtx.Provider>
  )
}

// ── SelectTrigger — rendu du <select> natif ──────────────────────────────────

export interface SelectTriggerProps {
  className?: string
  size?: "sm" | "default"
  children?: React.ReactNode // ignoré (compat. API ancienne)
  style?: React.CSSProperties
}

function SelectTrigger({ className, size: sizeProp, style }: SelectTriggerProps) {
  const ctx = React.useContext(SelectCtx)
  const size = sizeProp ?? ctx.size ?? "default"

  return (
    <div className={cn("relative w-full", className)} style={style}>
      <select
        value={ctx.value ?? ""}
        defaultValue={ctx.defaultValue}
        disabled={ctx.disabled}
        onChange={(e) => {
          const v = e.target.value
          ctx.onValueChange?.(v)
        }}
        className={cn(
          // Style de base
          "w-full appearance-none rounded-md border bg-white text-sm text-slate-800 cursor-pointer",
          "pl-3 pr-8 transition-colors outline-none",
          // Bordure violette comme la capture
          "border-violet-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-300/40",
          // Dark mode
          "dark:bg-zinc-800 dark:text-zinc-100 dark:border-violet-500 dark:focus:border-violet-400",
          // Disabled
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Hauteur selon taille
          size === "sm" ? "h-8 text-xs" : "h-9",
        )}
      >
        {/* Option placeholder si défini */}
        {ctx.placeholder && (
          <option value="" disabled={ctx.value !== undefined && ctx.value !== ""}>
            {ctx.placeholder}
          </option>
        )}

        {/* Options plates */}
        {ctx.options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}

        {/* Groupes d'options */}
        {ctx.optGroups.map((grp) => (
          <optgroup key={grp.label} label={grp.label}>
            {grp.options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Flèche custom (la flèche native est cachée par appearance-none) */}
      <ChevronDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-400"
        aria-hidden
      />
    </div>
  )
}

// ── Composants "fantômes" — présents pour compat. API, ne rendent rien ────────
// Le rendu réel est dans SelectTrigger via le contexte.

export interface SelectContentProps {
  children?: React.ReactNode
  className?: string
  side?: string
  sideOffset?: number
  align?: string
  alignOffset?: number
  alignItemWithTrigger?: boolean
}
function SelectContent({ children }: SelectContentProps) {
  // Rien à rendre — les options sont collectées par Select via collectData()
  return null
}

export interface SelectItemProps {
  value: string
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}
function SelectItem(_props: SelectItemProps) {
  return null
}

export interface SelectValueProps {
  placeholder?: string
  className?: string
  children?: React.ReactNode
}
function SelectValue(_props: SelectValueProps) {
  return null
}

export interface SelectGroupProps {
  children?: React.ReactNode
  className?: string
}
function SelectGroup({ children }: SelectGroupProps) {
  // Juste un conteneur logique, pas de rendu visuel
  return <>{children}</>
}

export interface SelectLabelProps {
  children?: React.ReactNode
  className?: string
}
function SelectLabel(_props: SelectLabelProps) {
  return null
}

function SelectSeparator({ className }: { className?: string }) {
  return null
}

function SelectScrollUpButton(_props: any) {
  return null
}

function SelectScrollDownButton(_props: any) {
  return null
}

// ── Exports ──────────────────────────────────────────────────────────────────

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
