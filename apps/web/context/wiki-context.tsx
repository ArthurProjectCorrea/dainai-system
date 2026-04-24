'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface WikiContextType {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
}

const WikiContext = createContext<WikiContextType | undefined>(undefined)

export function WikiProvider({
  children,
  initialProjectId = null,
}: {
  children: ReactNode
  initialProjectId?: string | null
}) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId)

  return (
    <WikiContext.Provider value={{ activeProjectId, setActiveProjectId }}>
      {children}
    </WikiContext.Provider>
  )
}

export function useWiki() {
  const context = useContext(WikiContext)
  if (context === undefined) {
    throw new Error('useWiki must be used within a WikiProvider')
  }
  return context
}
