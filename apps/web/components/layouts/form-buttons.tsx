'use client'

import * as React from 'react'
import { ChevronLeft, Save, Pencil, MoreVertical, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-mobile'
import { useFormLayoutContext } from './form-layout'
import { cn } from '@/lib/utils'

interface FormButtonsProps {
  onCancel?: () => void
  loading?: boolean
  mode: 'create' | 'edit' | 'view'
  formId?: string
  saveLabel?: string
  cancelLabel?: string
  onEdit?: () => void
  extraActions?: React.ReactNode
  hideCancel?: boolean
}

export function FormButtons({
  onCancel = () => window.history.back(),
  loading,
  mode,
  formId,
  saveLabel,
  cancelLabel,
  onEdit,
  extraActions,
  hideCancel,
}: FormButtonsProps) {
  const isMobile = useIsMobile()
  const { variant } = useFormLayoutContext()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [position, setPosition] = React.useState({ y: 24 }) // bottom offset in px
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStartY = React.useRef(0)
  const dragStartPos = React.useRef(0)

  const isView = mode === 'view'
  const defaultSaveLabel = mode === 'create' ? 'Criar Registro' : 'Salvar Alterações'
  const defaultCancelLabel = isView ? 'Voltar' : 'Cancelar'

  // Drag logic for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return
    setIsDragging(true)
    dragStartY.current = e.touches[0].clientY
    dragStartPos.current = position.y
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaY = dragStartY.current - e.touches[0].clientY
    // Limit between 24px from bottom and 150px from top
    const newY = Math.max(24, Math.min(window.innerHeight - 150, dragStartPos.current + deltaY))
    setPosition({ y: newY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (isMobile && variant === 'page') {
    const expandDirection = position.y < window.innerHeight / 2 ? 'up' : 'down'

    const Actions = (
      <div
        className={cn(
          'flex flex-col gap-3 transition-all duration-300 items-center',
          expandDirection === 'up' ? 'mb-3 origin-bottom' : 'mt-3 origin-top',
          isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none',
        )}
      >
        {!hideCancel && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => {
              onCancel()
              setIsExpanded(false)
            }}
            className="size-12 rounded-full shadow-lg border-primary/10 bg-background/90 backdrop-blur-md"
            disabled={loading}
            title={cancelLabel || defaultCancelLabel}
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}

        {isView && onEdit && (
          <Button
            type="button"
            size="icon"
            onClick={() => {
              onEdit()
              setIsExpanded(false)
            }}
            disabled={loading}
            className="size-12 rounded-full shadow-xl"
            title="Editar"
          >
            <Pencil className="size-5" />
          </Button>
        )}

        {!isView && (
          <Button
            type="submit"
            form={formId}
            size="icon"
            disabled={loading}
            className="size-12 rounded-full shadow-xl"
            title={saveLabel || defaultSaveLabel}
          >
            {loading ? <Spinner className="size-5" /> : <Save className="size-5" />}
          </Button>
        )}

        {/* Extra Actions (e.g., Publish) */}
        {extraActions && (
          <div className="form-fab-actions flex flex-col gap-3 items-center">{extraActions}</div>
        )}
      </div>
    )

    return (
      <div
        className={cn(
          'fixed right-6 z-50 flex flex-col items-center transition-all duration-300 ease-in-out select-none',
          isDragging ? 'transition-none' : 'animate-in fade-in slide-in-from-bottom-4',
        )}
        style={{ bottom: `${position.y}px` }}
      >
        {expandDirection === 'up' && Actions}

        {/* Main Toggle Button */}
        <div
          className="relative group touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Indicator */}
          {!isExpanded && (
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-active:opacity-100 transition-opacity">
              <GripVertical className="size-4 text-muted-foreground/50" />
            </div>
          )}

          <Button
            type="button"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'size-12 rounded-full shadow-2xl transition-all duration-500 ring-4 ring-primary/10',
              isExpanded ? 'bg-destructive hover:bg-destructive rotate-90' : 'bg-primary',
            )}
          >
            {isExpanded ? (
              <ChevronLeft className="size-5 rotate-180" />
            ) : (
              <MoreVertical className="size-5" />
            )}
          </Button>
        </div>

        {expandDirection === 'down' && Actions}
      </div>
    )
  }

  return (
    <>
      {!hideCancel && (
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
      )}

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
      {extraActions}
    </>
  )
}
