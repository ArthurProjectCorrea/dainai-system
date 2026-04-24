'use client'

import * as React from 'react'
import { ChevronLeft, Save, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-mobile'
import { useFormLayoutContext } from './form-layout'

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
  const isMobile = useIsMobile()
  const { variant } = useFormLayoutContext()
  const isView = mode === 'view'

  const defaultSaveLabel = mode === 'create' ? 'Criar Registro' : 'Salvar Alterações'
  const defaultCancelLabel = isView ? 'Voltar' : 'Cancelar'

  if (isMobile && variant === 'page') {
    return (
      <div className="fixed right-6 bottom-6 flex flex-col-reverse gap-3 z-50 items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onCancel}
          className="size-14 rounded-full shadow-lg border-primary/10 bg-background/80 backdrop-blur-md"
          disabled={loading}
          title={cancelLabel || defaultCancelLabel}
        >
          <ChevronLeft className="size-6" />
        </Button>

        {!isView && (
          <Button
            type="submit"
            form={formId}
            size="icon"
            disabled={loading}
            className="size-14 rounded-full shadow-xl"
            title={saveLabel || defaultSaveLabel}
          >
            {loading ? <Spinner className="size-6" /> : <Save className="size-6" />}
          </Button>
        )}

        {isView && onEdit && (
          <Button
            type="button"
            size="icon"
            onClick={onEdit}
            disabled={loading}
            className="size-14 rounded-full shadow-xl"
            title="Editar"
          >
            <Pencil className="size-6" />
          </Button>
        )}
      </div>
    )
  }

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
        <Button type="submit" form={formId} disabled={loading} className="min-w-32 gap-2">
          {loading ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saveLabel || defaultSaveLabel}
        </Button>
      )}
      {isView && onEdit && (
        <Button type="button" onClick={onEdit} disabled={loading} className="min-w-32 gap-2">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      )}
    </>
  )
}
