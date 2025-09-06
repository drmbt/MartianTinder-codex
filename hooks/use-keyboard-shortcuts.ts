import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string | string[]
  handler: () => void
  preventDefault?: boolean
  enabled?: boolean
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      if (shortcut.enabled === false) return

      const keys = Array.isArray(shortcut.key) ? shortcut.key : [shortcut.key]
      if (keys.includes(event.key)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.handler()
      }
    })
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Hook for Tinder-style swipe keyboard shortcuts
 */
export function useSwipeKeyboard({
  onLeft,
  onRight,
  onUp,
  onDown,
  enabled = true
}: {
  onLeft?: () => void
  onRight?: () => void
  onUp?: () => void
  onDown?: () => void
  enabled?: boolean
}) {
  useKeyboardShortcuts([
    { key: 'ArrowLeft', handler: () => onLeft?.(), enabled },
    { key: 'ArrowRight', handler: () => onRight?.(), enabled },
    { key: 'ArrowUp', handler: () => onUp?.(), enabled },
    { key: 'ArrowDown', handler: () => onDown?.(), enabled },
  ])
}