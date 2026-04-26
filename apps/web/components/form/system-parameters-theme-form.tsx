'use client'

import * as React from 'react'
import { FormSection, FormGrid } from '@/components/layouts/form-section'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function SystemParametersThemeForm() {
  return (
    <div className="space-y-6">
      <FormSection title="Tokens de Cores - Modo Claro" description="Defina as cores principais do sistema para o tema Light.">
        <FormGrid>
          <Field>
            <FieldLabel>Primary (Principal)</FieldLabel>
            <Input defaultValue="oklch(0.205 0 0)" />
          </Field>
          <Field>
            <FieldLabel>Background (Fundo)</FieldLabel>
            <Input defaultValue="oklch(1 0 0)" />
          </Field>
          <Field>
            <FieldLabel>Accent (Destaque)</FieldLabel>
            <Input defaultValue="oklch(0.97 0 0)" />
          </Field>
          <Field>
            <FieldLabel>Radius (Arredondamento)</FieldLabel>
            <Input defaultValue="0.625rem" />
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Tokens de Cores - Modo Escuro" description="Defina as cores principais do sistema para o tema Dark.">
        <FormGrid>
          <Field>
            <FieldLabel>Primary (Principal)</FieldLabel>
            <Input defaultValue="oklch(0.922 0 0)" />
          </Field>
          <Field>
            <FieldLabel>Background (Fundo)</FieldLabel>
            <Input defaultValue="oklch(0.145 0 0)" />
          </Field>
          <Field>
            <FieldLabel>Accent (Destaque)</FieldLabel>
            <Input defaultValue="oklch(0.269 0 0)" />
          </Field>
          <Field>
            <FieldLabel>Card</FieldLabel>
            <Input defaultValue="oklch(0.205 0 0)" />
          </Field>
        </FormGrid>
      </FormSection>
    </div>
  )
}
