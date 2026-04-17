'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DataTableDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  form: React.ComponentType<{
    data?: T | null
    onSuccess: () => void
    onCancel?: () => void
    readOnly?: boolean
  }> | null
  formData?: T | null
  onSuccess?: () => void
  readOnly?: boolean
}

export function DataTableDialog<T>({
  open,
  onOpenChange,
  title,
  form: Form,
  formData,
  onSuccess,
  readOnly,
}: DataTableDialogProps<T>) {
  if (!Form) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os campos abaixo para concluir a ação.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form
            data={formData}
            readOnly={readOnly}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false)
              onSuccess?.()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
