"use client"

/**
 * Select — implémentation native <select>
 * ─────────────────────────────────────────────────────────────────────────────
 * La détection des enfants utilise des RÉFÉRENCES de fonctions (child.type ===
 * SelectItem) et non des noms, car Vite minifie les noms en production.
 * Les déclarations `function` sont hissées (hoisting) donc l'ordre dans le
 * fichier n'a pas d'importance : collectData peut référencer SelectItem même
 * si SelectItem est déclaré plus bas.
 * ─────────────────────────────────────────────────────────────────────────────
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

// ── childrenToString ─────────────────────────────────────────────────────────
// Convertit n'importe quel ReactNode en chaîne lisible.
// Gère : "string", 42, ["Jean", " ", "Kouadio"], <span>text</span>, etc.

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

// ── collectData ──────────────────────────────────────────────────────────────
// Parcourt l'arbre React AVANT le rendu pour collecter options et placeholder.
// Utilise child.type === SelectItem (référence) — production-safe.
// Les fonctions sont hissées (hoisting) donc pas de problème d'ordre.

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
    const t = child.type
    const p = child.props as any

    // ── SelectContent ────────────────────────────────────────────────────
    if (t === SelectContent) {
      const inner = collectData(p.children)
      options.push(...inner.options)
      optGroups.push(...inner.optGroups)
      if (inner.placeholder) placeholder = inner.placeholder

    // ── SelectGroup ──────────────────────────────────────────────────────
    } else if (t === SelectGroup) {
      let groupLabel = ""
      React.Children.forEach(p.children, (gc: unknown) => {
        if (React.isValidElement(gc) && gc.type === SelectLabel) {
          groupLabel = childrenToString((gc.props as any).children)
        }
      })
      const inner = collectData(p.children)
      if (groupLabel && inner.options.length > 0) {
        optGroups.push({ label: groupLabel, options: inner.options })
      } else {
        options.push(...inner.options)
        optGroups.push(...inner.optGroups)
      }

    // ── SelectItem ───────────────────────────────────────────────────────
    } else if (t === SelectItem) {
      options.push({
        value: p.value ?? "",
        label: childrenToString(p.children),
        disabled: !!p.disabled,
      })

    // ── SelectTrigger — cherche SelectValue pour placeholder ─────────────
    } else if (t === SelectTrigger) {
      React.Children.forEach(p.children, (tc: unknown) => {
        if (React.isValidElement(tc)) {
          if (tc.type === SelectValue && (tc.props as any).placeholder) {
            placeholder = (tc.props as any).placeholder
          }
        }
      })

    // ── SelectValue ──────────────────────────────────────────────────────
    } else if (t === SelectValue) {
      if (p.placeholder) placeholder = p.placeholder

    // ── Fragment React ───────────────────────────────────────────────────
    } else if (t === React.Fragment) {
      const inner = collectData(p.children)
      options.push(...inner.options)
      optGroups.push(...inner.optGroups)
      if (inner.placeholder) placeholder = inner.placeholder

    // ── Tout autre conteneur (FormControl, FormItem, div…) ───────────────
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
  size?: "sm" | "default"
  // compat. API ancienne — ignorées
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
  // collectData traverse l'arbre JSX pour extraire toutes les options
  const { options, optGroups, placeholder } = collectData(children)

  return (
    <SelectCtx.Provider
      value={{ value, defaultValue, onValueChange, disabled, options, optGroups, placeholder, size }}
    >
      {children}
    </SelectCtx.Provider>
  )
}

// ── SelectTrigger — le seul composant qui rend du DOM ───────────────────────

export interface SelectTriggerProps {
  className?: string
  size?: "sm" | "default"
  /** Ignoré (compat. API) — le trigger est entièrement géré via contexte */
  children?: React.ReactNode
  style?: React.CSSProperties
}

function SelectTrigger({ className, size: sizeProp, style }: SelectTriggerProps) {
  const ctx = React.useContext(SelectCtx)
  const sz = sizeProp ?? ctx.size ?? "default"

  return (
    <div className={cn("relative w-full", className)} style={style}>
      <select
        value={ctx.value !== undefined ? ctx.value : undefined}
        defaultValue={ctx.defaultValue}
        disabled={ctx.disabled}
        onChange={(e) => ctx.onValueChange?.(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-md border bg-white text-sm text-slate-800",
          "pl-3 pr-8 transition-colors outline-none cursor-pointer",
          "border-violet-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-300/40",
          "dark:bg-zinc-800 dark:text-zinc-100 dark:border-violet-500 dark:focus:border-violet-400",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sz === "sm" ? "h-8 text-xs" : "h-9",
        )}
      >
        {/* Placeholder (option désactivée si une vraie valeur est sélectionnée) */}
        {ctx.placeholder && (
          <option value="">
            {ctx.placeholder}
          </option>
        )}

        {/* Options plates */}
        {ctx.options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}

        {/* Groupes */}
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

      {/* Flèche personnalisée */}
      <ChevronDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-400"
        aria-hidden
      />
    </div>
  )
}

// ── Composants "fantômes" — API compat, ne rendent rien ─────────────────────

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
  return <>{children}</>
}

export interface SelectLabelProps {
  children?: React.ReactNode
  className?: string
}
function SelectLabel(_props: SelectLabelProps) {
  return null
}

function SelectSeparator(_props: { className?: string }) {
  return null
}

function SelectScrollUpButton(_props: unknown) {
  return null
}

function SelectScrollDownButton(_props: unknown) {
  return null
}

// ── displayName — préservés même après minification ─────────────────────────
Select.displayName = "Select"
SelectTrigger.displayName = "SelectTrigger"
SelectContent.displayName = "SelectContent"
SelectItem.displayName = "SelectItem"
SelectValue.displayName = "SelectValue"
SelectGroup.displayName = "SelectGroup"
SelectLabel.displayName = "SelectLabel"
SelectSeparator.displayName = "SelectSeparator"
SelectScrollUpButton.displayName = "SelectScrollUpButton"
SelectScrollDownButton.displayName = "SelectScrollDownButton"

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
