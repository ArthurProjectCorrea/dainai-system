'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'

interface ModeToggleProps {
  className?: string
  id?: string
}

export function ModeToggle({ className, id }: ModeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if dark mode is active (always evaluate to boolean to keep it controlled)
  const isDark = mounted
    ? theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
    : false

  return (
    <Switch
      id={id}
      className={className}
      checked={isDark}
      disabled={!mounted}
      onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
    />
  )
}
