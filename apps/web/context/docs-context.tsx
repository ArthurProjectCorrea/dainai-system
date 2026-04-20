'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface DocsContextType {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
}

const DocsContext = createContext<DocsContextType | undefined>(undefined)

export function DocsProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  return (
    <DocsContext.Provider value={{ activeProjectId, setActiveProjectId }}>
      {children}
    </DocsContext.Provider>
  )
}

export function useDocs() {
  const context = useContext(DocsContext)
  if (context === undefined) {
    throw new Error('useDocs must be used within a DocsProvider')
  }
  return context
}
