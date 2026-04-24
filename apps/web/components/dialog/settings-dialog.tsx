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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { ModeToggle } from '@/components/layouts/mode-toggle'
import { useIsMobile } from '@/hooks/use-mobile'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const isMobile = useIsMobile()

  const content = (
    <div className="py-6 flex flex-col gap-4">
      <FieldLabel htmlFor="theme-toggle" className="w-full cursor-pointer">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Modo Escuro</FieldTitle>
            <FieldDescription>Alternar o sistema para o tema escuro.</FieldDescription>
          </FieldContent>
          <ModeToggle id="theme-toggle" />
        </Field>
      </FieldLabel>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Configurações</DrawerTitle>
            <DrawerDescription>
              Personalize sua experiência no sistema, como o tema e outras preferências.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Personalize sua experiência no sistema, como o tema e outras preferências.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
