'use client'

import * as React from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface FormButtonsProps {
  onCancel: () => void
  loading?: boolean
  mode: 'create' | 'edit' | 'view'
  formId?: string
  saveLabel?: string
  cancelLabel?: string
}

export function FormButtons({
  onCancel,
  loading,
  mode,
  formId,
  saveLabel,
  cancelLabel,
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
    </>
  )
}
