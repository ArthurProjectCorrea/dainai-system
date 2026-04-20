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
    onEdit?: () => void
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
  readOnly: initialReadOnly,
  canEdit,
}: DataTableDialogProps<T> & { canEdit?: boolean }) {
  const [isReadOnly, setIsReadOnly] = React.useState(initialReadOnly)

  React.useEffect(() => {
    setIsReadOnly(initialReadOnly)
  }, [initialReadOnly, open])

  if (!Form) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? title : title.replace('Visualizar', 'Editar')}</DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os campos abaixo para concluir a ação.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form
            data={formData}
            readOnly={isReadOnly}
            onCancel={() => onOpenChange(false)}
            onEdit={canEdit ? () => setIsReadOnly(false) : undefined}
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
