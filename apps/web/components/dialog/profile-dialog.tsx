'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProfileForm } from '@/components/form/profile-form'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl max-h-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>
            Visualize seus dados pessoais e seus vínculos com times, cargos e departamentos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProfileForm variant="dialog" onCancel={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
