'use client'

import { useRef } from 'react'

type Option = { id: string; label: string }

type Props = {
  options: Option[]
  value: string | null
  onChange: (id: string) => void
  labelledBy: string
}

export function MattressToggle({ options, value, onChange, labelledBy }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const checkedIndex = options.findIndex((o) => o.id === value)
  const tabbableIndex = checkedIndex === -1 ? 0 : checkedIndex

  const moveTo = (index: number) => {
    const next = options[index]
    if (!next) return
    onChange(next.id)
    refs.current[index]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = options.length - 1
    let target: number
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = index === last ? 0 : index + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        target = index === 0 ? last : index - 1
        break
      case 'Home':
        target = 0
        break
      case 'End':
        target = last
        break
      default:
        return
    }
    event.preventDefault()
    moveTo(target)
  }

  return (
    <div className="mattress-toggle" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((option, index) => {
        const selected = index === checkedIndex
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === tabbableIndex ? 0 : -1}
            className={`mattress-toggle__option${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
