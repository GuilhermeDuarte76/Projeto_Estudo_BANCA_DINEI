import { useState, useRef, useEffect } from 'react'
import { XIcon, PlusIcon, CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

interface Props {
  value: string[]
  onChange: (chips: string[]) => void
  suggestions: string[]
  loading?: boolean
  error?: string
  placeholder?: string
}

export default function ChipInput({ value, onChange, suggestions, loading, error, placeholder }: Props) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // All suggestions not yet selected, filtered by input
  const filtered = input.trim()
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s),
      )
    : suggestions.filter((s) => !value.includes(s))

  // Already selected ones (to show with checkmark)
  const selected = suggestions.filter((s) => value.includes(s))

  // Check if typed text is a custom value (not in suggestions)
  const inputTrimmed = input.trim()
  const isCustom = inputTrimmed && !suggestions.some((s) => s.toLowerCase() === inputTrimmed.toLowerCase())
  const alreadyAdded = inputTrimmed && value.some((v) => v.toLowerCase() === inputTrimmed.toLowerCase())

  const add = (chip: string) => {
    const trimmed = chip.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
    inputRef.current?.focus()
  }

  const toggle = (chip: string) => {
    if (value.includes(chip)) {
      onChange(value.filter((c) => c !== chip))
    } else {
      onChange([...value, chip])
    }
    inputRef.current?.focus()
  }

  const remove = (chip: string) => {
    onChange(value.filter((c) => c !== chip))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputTrimmed && !alreadyAdded) add(input)
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1])
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const showDropdown = open && (suggestions.length > 0 || inputTrimmed)

  return (
    <div ref={containerRef} className="relative">
      {/* ── Input area with chips ───────────── */}
      <div
        className={`flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 rounded-xl border transition-[border-color,background-color] duration-300 bg-white/5 cursor-text ${
          error
            ? 'border-red-500/50'
            : open
              ? 'border-gold-primary/60 bg-white/8'
              : 'border-gold-primary/15 hover:border-gold-primary/30'
        }`}
        onClick={() => { inputRef.current?.focus(); setOpen(true) }}
      >
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gold-primary/15 text-gold-light text-xs font-body whitespace-nowrap"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(chip) }}
              className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-gold-primary/30 text-gold-light/70 hover:text-gold-light transition-colors"
            >
              <XIcon size={8} weight="bold" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? (placeholder ?? 'Selecionar ou digitar...') : ''}
          className="flex-1 min-w-[80px] bg-transparent text-cream placeholder-cream/20 text-sm outline-none py-0.5"
        />
      </div>

      {/* ── Dropdown ───────────────────────── */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-gold-primary/20 bg-[#191309] shadow-[0_8px_32px_rgba(0,0,0,0.55)] py-1">
          {loading ? (
            <div className="px-4 py-3 text-cream/30 text-xs font-body">Carregando...</div>
          ) : (
            <>
              {/* Search hint */}
              {!inputTrimmed && suggestions.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 text-cream/25 text-[10px] font-body border-b border-gold-primary/8 mb-1">
                  <MagnifyingGlassIcon size={10} />
                  Digite para filtrar ou adicionar novo
                </div>
              )}

              {/* Selected items (shown at top with checkmark) */}
              {!inputTrimmed && selected.length > 0 && (
                <>
                  {selected.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      className="flex items-center justify-between w-full px-4 py-2 text-gold-light hover:bg-white/5 text-xs font-body transition-colors duration-150"
                    >
                      <span>{s}</span>
                      <CheckIcon size={12} weight="bold" className="text-gold-primary shrink-0" />
                    </button>
                  ))}
                  {filtered.length > 0 && (
                    <div className="my-1 h-px bg-gold-primary/8" />
                  )}
                </>
              )}

              {/* Available suggestions */}
              {filtered.length > 0 ? (
                filtered.slice(0, 30).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className="flex items-center justify-between w-full px-4 py-2 text-cream/65 hover:text-cream hover:bg-white/5 text-xs font-body transition-colors duration-150"
                  >
                    <span>{s}</span>
                  </button>
                ))
              ) : inputTrimmed && !isCustom ? (
                <div className="px-4 py-2 text-cream/25 text-xs font-body">
                  Já selecionado
                </div>
              ) : !inputTrimmed && suggestions.length === 0 ? (
                <div className="px-4 py-2 text-cream/25 text-xs font-body">
                  Nenhuma opção disponível. Digite para adicionar.
                </div>
              ) : null}

              {/* Custom value option */}
              {inputTrimmed && isCustom && !alreadyAdded && (
                <>
                  {filtered.length > 0 && (
                    <div className="my-1 h-px bg-gold-primary/8" />
                  )}
                  <button
                    type="button"
                    onClick={() => { add(input); setOpen(true) }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-gold-light/80 hover:text-gold-light hover:bg-gold-primary/5 text-xs font-body transition-colors duration-150"
                  >
                    <PlusIcon size={12} weight="bold" className="shrink-0" />
                    Adicionar "<span className="font-medium">{inputTrimmed}</span>"
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-300 text-[11px] mt-1">{error}</p>}
    </div>
  )
}
