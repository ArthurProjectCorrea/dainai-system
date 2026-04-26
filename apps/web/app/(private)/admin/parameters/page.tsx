'use client'

import * as React from 'react'
import { FormLayout } from '@/components/layouts/form-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  ShieldCheck, 
  Type, 
  TableProperties
} from 'lucide-react'

// Importando os novos componentes de formulário
import { PageHeader } from '@/components/layouts/page-header'
import { SystemParametersAuthForm } from '@/components/form/system-parameters-auth-form'
import { SystemParametersThemeForm } from '@/components/form/system-parameters-theme-form'
import { SystemParametersLegalForm } from '@/components/form/system-parameters-legal-form'
import { SystemParametersScreensForm } from '@/components/form/system-parameters-screens-form'

export default function ParametersPage() {
  const [activeTab, setActiveTab] = React.useState('general')

  return (
    <div className="flex flex-1 flex-col relative">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: 'Parâmetros do Sistema' },
        ]}
      />

      <div className="w-full px-4 flex-1 pb-8 pt-2">
        <form id="parameters-form" className="flex flex-col flex-1 h-full">
          <FormLayout
            title="Parâmetros do Sistema"
            description="Gerencie a identidade visual, temas e configurações globais do sistema."
            mode="edit"
            hideCancel={true}
            saveLabel="Salvar Alterações"
            formId="parameters-form"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList variant="line" className="mb-4">
                <TabsTrigger value="general" className="gap-2">
                  <ShieldCheck className="size-4" />
                  Identidade Visual
                </TabsTrigger>
                <TabsTrigger value="theme" className="gap-2">
                  <Palette className="size-4" />
                  Temas e Cores
                </TabsTrigger>
                <TabsTrigger value="legal" className="gap-2">
                  <Type className="size-4" />
                  Fontes e Jurídico
                </TabsTrigger>
                <TabsTrigger value="screens" className="gap-2">
                  <TableProperties className="size-4" />
                  Telas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="outline-none">
                <SystemParametersAuthForm />
              </TabsContent>

              <TabsContent value="theme" className="outline-none">
                <SystemParametersThemeForm />
              </TabsContent>

              <TabsContent value="legal" className="outline-none">
                <SystemParametersLegalForm />
              </TabsContent>

              <TabsContent value="screens" className="outline-none">
                <SystemParametersScreensForm />
              </TabsContent>
            </Tabs>
          </FormLayout>
        </form>
      </div>
    </div>
  )
}
