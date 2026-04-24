'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ProfileForm } from '@/components/form/profile-form'
import { useIsMobile } from '@/hooks/use-mobile'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Meu Perfil</DrawerTitle>
            <DrawerDescription>
              Visualize seus dados pessoais e seus vínculos com times, cargos e departamentos.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto">
            <ProfileForm variant="dialog" onCancel={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

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
