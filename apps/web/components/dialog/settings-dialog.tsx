'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ModeToggle } from '@/components/mode-toggle'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Personalize sua experiência no sistema, como o tema e outras preferências.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-between w-full border p-4 rounded-xl">
            <span className="text-sm font-medium">Tema do Sistema</span>
            <ModeToggle />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
