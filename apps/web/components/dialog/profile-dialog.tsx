'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsIcon, UserPen } from 'lucide-react'
import { ProfileForm } from '@/components/form/profile-form'
import { ModeToggle } from '@/components/mode-toggle'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl max-h-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Perfil</DialogTitle>
          <DialogDescription>
            Visualize seus dados pessoais e seus vínculos com times, cargos e departamentos.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="geral">
          <TabsList className="w-full">
            <TabsTrigger value="geral">
              <UserPen />
              Geral
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <SettingsIcon />
              Configurações
            </TabsTrigger>
          </TabsList>
          <TabsContent value="geral" className="space-y-4 py-4">
            <ProfileForm variant="dialog" onCancel={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="configuracoes" className="space-y-4 py-4">
            <ModeToggle />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
