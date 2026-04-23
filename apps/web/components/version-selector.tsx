'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PublishedDocument } from '@/types/document'

interface VersionSelectorProps {
  versions: PublishedDocument[]
  currentVersionId: string
}

export function VersionSelector({ versions, currentVersionId }: VersionSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  if (versions.length <= 1) return null

  const handleVersionChange = (value: string) => {
    if (value === 'latest') {
      router.push(pathname)
    } else {
      router.push(`${pathname}?v=${value}`)
    }
  }

  return (
    <Select value={currentVersionId || 'latest'} onValueChange={handleVersionChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione a versão" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">Versão Atual</SelectItem>
        {versions.slice(1).map(v => (
          <SelectItem key={v.id} value={v.id}>
            {v.version}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
