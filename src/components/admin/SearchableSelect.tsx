import { useState, useRef, useEffect, useCallback } from 'react'
import { CaretDownIcon, MagnifyingGlassIcon, CheckIcon } from '@phosphor-icons/react'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  /** Extra option rendered at the bottom (e.g. "+ Digitar manualmente") */
  extraOption?: { value: string; label: string }
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  className = '',
  error = false,
  extraOption,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIdx, setHighlightIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  // All visible items (filtered + optional extra)
  const visibleItems: SelectOption[] = extraOption ? [...filtered, extraOption] : filtered

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0)
  }, [filtered.length])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Focus input when opening
  useEffect(() => {
    if (open) {
      // Small delay so the dropdown is rendered
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.children[highlightIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlightIdx, open])

  const select = useCallback(
    (val: string) => {
      onChange(val)
      setOpen(false)
      setSearch('')
    },
    [onChange],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((i) => Math.min(i + 1, visibleItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (visibleItems[highlightIdx]) select(visibleItems[highlightIdx].value)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
    }
  }

  const inputClass =
    'w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8'
  const errorBorder = '!border-red-500/50 !hover:border-red-500/60 !focus:border-red-500/70'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} appearance-none cursor-pointer text-left flex items-center justify-between gap-2 ${error ? errorBorder : ''}`}
      >
        <span className={value ? 'text-cream' : 'text-cream/20'}>
          {selectedLabel || placeholder}
        </span>
        <CaretDownIcon
          size={14}
          className={`text-cream/40 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gold-primary/25 bg-dark-warm shadow-lg shadow-black/40 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gold-primary/10">
            <MagnifyingGlassIcon size={14} className="text-cream/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Filtrar..."
              className="flex-1 bg-transparent text-cream text-sm placeholder-cream/20 outline-none"
            />
          </div>

          {/* Options list */}
          <ul ref={listRef} className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
            {visibleItems.length === 0 && (
              <li className="px-4 py-2.5 text-cream/30 text-xs text-center">
                Nenhum resultado
              </li>
            )}
            {visibleItems.map((opt, idx) => {
              const isExtra = extraOption && opt.value === extraOption.value
              const isSelected = opt.value === value
              const isHighlighted = idx === highlightIdx

              return (
                <li
                  key={opt.value}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  onClick={() => select(opt.value)}
                  className={`flex items-center justify-between gap-2 px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                    isHighlighted ? 'bg-gold-primary/10' : ''
                  } ${isExtra ? 'text-gold-light border-t border-gold-primary/10 mt-1' : 'text-cream/80'} ${
                    isSelected && !isExtra ? 'text-gold-light font-medium' : ''
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && !isExtra && (
                    <CheckIcon size={14} weight="bold" className="text-gold-primary shrink-0" />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
