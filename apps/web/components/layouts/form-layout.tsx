'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { FormHeader } from './form-header'
import { FormButtons } from './form-buttons'

export type FormVariant = 'page' | 'dialog'

interface FormLayoutContextValue {
  variant: FormVariant
  mode: 'create' | 'edit' | 'view'
  loading?: boolean
}

const FormLayoutContext = React.createContext<FormLayoutContextValue | undefined>(undefined)

export function useFormLayoutContext() {
  const context = React.useContext(FormLayoutContext)
  if (!context) {
    throw new Error('useFormLayoutContext must be used within a FormLayout')
  }
  return context
}

interface FormLayoutProps {
  title: string
  description?: string
  mode: 'create' | 'edit' | 'view'
  loading?: boolean
  onCancel?: () => void
  variant?: FormVariant | Partial<Record<'create' | 'edit' | 'view', FormVariant>>
  children: React.ReactNode
  extraActions?: React.ReactNode
  className?: string
  formId?: string
  saveLabel?: string
  cancelLabel?: string
  onEdit?: () => void
  hideButtons?: boolean
  /** @deprecated use variant="dialog" instead */
  isDialog?: boolean
  /** @deprecated handled by variant and FormSection */
  noCardWrapper?: boolean
  hideCancel?: boolean
}

export function FormLayout({
  title,
  description,
  mode,
  loading,
  onCancel,
  variant = 'page',
  children,
  className,
  formId,
  saveLabel,
  cancelLabel,
  onEdit,
  isDialog,
  extraActions,
  hideButtons,
  hideCancel,
}: FormLayoutProps) {
  const getEffectiveVariant = (): FormVariant => {
    if (isDialog) return 'dialog'
    if (typeof variant === 'string') return variant
    return variant[mode] || 'page'
  }

  const effectiveVariant = getEffectiveVariant()

  const contextValue = React.useMemo(
    () => ({
      variant: effectiveVariant,
      mode,
      loading,
    }),
    [effectiveVariant, mode, loading],
  )

  if (effectiveVariant === 'dialog') {
    return (
      <FormLayoutContext.Provider value={contextValue}>
        <div className={cn('space-y-6', className)}>
          <div className="w-full space-y-4">{children}</div>
          {!hideButtons && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
              {extraActions}
              <FormButtons
                mode={mode}
                loading={loading}
                onCancel={onCancel}
                formId={formId}
                saveLabel={saveLabel}
                cancelLabel={cancelLabel}
                onEdit={onEdit}
                extraActions={extraActions}
                hideCancel={hideCancel}
              />
            </div>
          )}
        </div>
      </FormLayoutContext.Provider>
    )
  }

  return (
    <FormLayoutContext.Provider value={contextValue}>
      <div className={cn('flex flex-col flex-1 relative', className)}>
        <FormHeader title={title} description={description}>
          <div className="hidden md:block">{extraActions}</div>
          {!hideButtons && (
            <FormButtons
              mode={mode}
              loading={loading}
              onCancel={onCancel}
              formId={formId}
              saveLabel={saveLabel}
              cancelLabel={cancelLabel}
              onEdit={onEdit}
              extraActions={extraActions}
              hideCancel={hideCancel}
            />
          )}
        </FormHeader>

        <div className="w-full flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </FormLayoutContext.Provider>
  )
}
