'use client'

import * as React from 'react'
import { FormSection, FormGrid } from '@/components/layouts/form-section'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Monitor } from 'lucide-react'

export function SystemParametersScreensForm() {
  const mockScreens = [
    { key: 'dashboard', label: 'Dashboard', sidebar: 'Dashboard' },
    { key: 'documents', label: 'Gestão de Documentos', sidebar: 'Documentos' },
    { key: 'projects', label: 'Gestão de Projetos', sidebar: 'Projetos' },
    { key: 'users', label: 'Usuários', sidebar: 'Usuários' },
  ]

  return (
    <div className="space-y-6">
      <FormSection title="Gerenciamento de Telas" description="Personalize os nomes exibidos na interface e sidebar.">
        <div className="space-y-6">
          {mockScreens.map((screen) => (
            <div key={screen.key} className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="size-4 text-muted-foreground" />
                <span className="font-semibold text-sm uppercase tracking-wider">{screen.key}</span>
              </div>
              <FormGrid>
                <Field>
                  <FieldLabel>Nome da Página</FieldLabel>
                  <Input defaultValue={screen.label} />
                </Field>
                <Field>
                  <FieldLabel>Nome na Sidebar</FieldLabel>
                  <Input defaultValue={screen.sidebar} />
                </Field>
              </FormGrid>
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  )
}
