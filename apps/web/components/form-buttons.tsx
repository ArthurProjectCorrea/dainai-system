'use client'

import * as React from 'react'
import { ChevronLeft, Save, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface FormButtonsProps {
  onCancel?: () => void
  loading?: boolean
  mode: 'create' | 'edit' | 'view'
  formId?: string
  saveLabel?: string
  cancelLabel?: string
  onEdit?: () => void
}

export function FormButtons({
  onCancel = () => window.history.back(),
  loading,
  mode,
  formId,
  saveLabel,
  cancelLabel,
  onEdit,
}: FormButtonsProps) {
  const isView = mode === 'view'

  const defaultSaveLabel = mode === 'create' ? 'Criar Registro' : 'Salvar Alterações'
  const defaultCancelLabel = isView ? 'Voltar' : 'Cancelar'

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="gap-2"
        disabled={loading}
      >
        <ChevronLeft className="h-4 w-4" />
        {cancelLabel || defaultCancelLabel}
      </Button>

      {!isView && (
        <Button type="submit" form={formId} disabled={loading} className="min-w-[120px] gap-2">
          {loading ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saveLabel || defaultSaveLabel}
        </Button>
      )}
      {isView && onEdit && (
        <Button type="button" onClick={onEdit} disabled={loading} className="min-w-[120px] gap-2">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      )}
    </>
  )
}
