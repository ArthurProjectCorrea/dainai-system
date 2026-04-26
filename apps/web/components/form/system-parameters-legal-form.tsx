'use client'

import * as React from 'react'
import { FormSection, FormGrid } from '@/components/layouts/form-section'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function SystemParametersLegalForm() {
  return (
    <div className="space-y-6">
      <FormSection title="Tipografia" description="Selecione as fontes globais do sistema (Google Fonts).">
        <FormGrid>
          <Field>
            <FieldLabel>Fonte Principal (Sans)</FieldLabel>
            <Input defaultValue="Geist Sans" />
          </Field>
          <Field>
            <FieldLabel>Fonte de Títulos (Heading)</FieldLabel>
            <Input defaultValue="Geist Sans" />
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Textos Legais" description="Edite as políticas e termos de uso do sistema.">
        <div className="space-y-4">
          <Field>
            <FieldLabel>Termos de Uso (Markdown)</FieldLabel>
            <Textarea rows={6} placeholder="## Termos de Uso..." />
          </Field>
          <Field>
            <FieldLabel>Política de Privacidade (Markdown)</FieldLabel>
            <Textarea rows={6} placeholder="## Política de Privacidade..." />
          </Field>
        </div>
      </FormSection>
    </div>
  )
}
