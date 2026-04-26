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
import { useIsMobile } from '@/hooks/use-mobile'
import { SystemParametersBannerForm } from '@/components/form/system-parameters-banner-form'

interface LoginBannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginBannerDialog({ open, onOpenChange }: LoginBannerDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="text-left px-4">
            <DrawerTitle>Personalização do Banner</DrawerTitle>
            <DrawerDescription>
              Ajuste as cores da animação e a ordem das frases que aparecem na tela de login.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto">
            <SystemParametersBannerForm 
              variant="dialog" 
              onCancel={() => onOpenChange(false)} 
              onSave={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 border-b bg-background shrink-0">
          <DialogTitle>Personalização do Banner</DialogTitle>
          <DialogDescription>
            Ajuste as cores da animação e a ordem das frases que aparecem na tela de login.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <SystemParametersBannerForm 
            variant="dialog" 
            onCancel={() => onOpenChange(false)} 
            onSave={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
