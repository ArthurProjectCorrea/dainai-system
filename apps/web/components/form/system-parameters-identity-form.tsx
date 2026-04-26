'use client'

import * as React from 'react'
import { FormSection, FormGrid } from '@/components/layouts/form-section'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  CloudUpload,
  FileCode,
  LayoutTemplate,
  Monitor,
  ChevronRight,
  Building2
} from 'lucide-react'
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyContent 
} from '@/components/ui/empty'
import { LoginBannerDialog } from '@/components/dialog/login-banner-dialog'

// --- Main Identity Form ---
export function SystemParametersIdentityForm() {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = React.useState<string | null>(null)
  
  const [isBannerDialogOpen, setIsBannerDialogOpen] = React.useState(false)

  return (
    <FormGrid>
      {/* Seção: Informações da Empresa */}
      <FormSection title="Informações da Empresa" description="Dados básicos que identificam sua organização no sistema." className="h-full">
        <div className="space-y-6">
          <Field>
            <FieldLabel htmlFor="company-name">Nome da Empresa</FieldLabel>
            <Input id="company-name" placeholder="Ex: DAINAI System" defaultValue="DAINAI System" />
            <FieldDescription>Este nome será exibido em títulos de página e comunicações.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="company-description">Descrição / Slogan</FieldLabel>
            <Textarea 
              id="company-description" 
              placeholder="Ex: Gestão inteligente de documentos e projetos." 
              className="min-h-[100px] resize-none"
              defaultValue="Gestão inteligente de documentos e projetos para empresas modernas."
            />
            <FieldDescription>Uma breve descrição sobre o propósito da organização.</FieldDescription>
          </Field>
        </div>
      </FormSection>

      {/* Seção: Identidade Visual */}
      <FormSection title="Identidade Visual" description="Elementos fundamentais da marca." className="h-full">
        <div className="space-y-6">
          <Field>
            <FieldLabel>Logotipo do Sistema</FieldLabel>
            <div className="mt-2">
              {logoUrl ? (
                <div className="relative group w-full h-48 rounded-xl border overflow-hidden bg-muted/20">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-6" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                    <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>Trocar</Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setLogoUrl(null)}>Remover</Button>
                  </div>
                </div>
              ) : (
                <Empty className="border border-dashed h-48">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><CloudUpload className="size-5" /></EmptyMedia>
                    <EmptyTitle>Upload de Logotipo</EmptyTitle>
                    <EmptyDescription>Arraste ou clique para enviar. PNG ou SVG.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent><Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>Selecionar Arquivo</Button></EmptyContent>
                </Empty>
              )}
              <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setLogoUrl(URL.createObjectURL(e.target.files![0]))} />
            </div>
          </Field>

          <Field>
            <FieldLabel>Favicon (.ico)</FieldLabel>
            <div className="mt-2">
              {faviconUrl ? (
                <div className="relative group w-full h-32 rounded-xl border overflow-hidden bg-muted/5 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-12 rounded border bg-background flex items-center justify-center shadow-sm">
                      <img src={faviconUrl} alt="Favicon" className="size-8" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">favicon.ico</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                    <Button type="button" variant="secondary" size="xs" onClick={() => document.getElementById('favicon-upload')?.click()}>Trocar</Button>
                    <Button type="button" variant="destructive" size="xs" onClick={() => setFaviconUrl(null)}>Remover</Button>
                  </div>
                </div>
              ) : (
                <Empty className="border border-dashed h-32">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><FileCode className="size-5" /></EmptyMedia>
                    <EmptyTitle className="text-xs">Favicon do Navegador</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent><Button type="button" variant="outline" size="xs" onClick={() => document.getElementById('favicon-upload')?.click()}>Upload .ico</Button></EmptyContent>
                </Empty>
              )}
              <input id="favicon-upload" type="file" className="hidden" accept=".ico" onChange={(e) => setFaviconUrl(URL.createObjectURL(e.target.files![0]))} />
            </div>
          </Field>
        </div>
      </FormSection>

      {/* Seção: Apresentação do Sistema */}
      <FormSection title="Apresentação do Sistema" description="Configure como o sistema se apresenta para os usuários." className="h-full">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
              <LayoutTemplate className="size-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Banners Disponíveis</h3>
            </div>
            
            <div className="divide-y divide-border/40">
              {/* Item de Banner de Autenticação */}
              <button 
                type="button"
                onClick={() => setIsBannerDialogOpen(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Monitor className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors">Banner de Autenticação</h4>
                    <p className="text-xs text-muted-foreground">Configurações de cores e frases da tela de login.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Removido o ícone duplicado Settings2 */}
                  <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Placeholder para futuros itens */}
              <div className="p-4 flex items-center gap-4 grayscale opacity-40 select-none">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Banner de Boas Vindas</h4>
                  <p className="text-xs text-muted-foreground italic">(Em breve)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-primary/80 leading-relaxed italic">
              Dica: Você pode personalizar múltiplos banners para diferentes momentos da jornada do usuário no sistema.
            </p>
          </div>
        </div>

        {/* Dialog Component Wrapper */}
        <LoginBannerDialog 
          open={isBannerDialogOpen} 
          onOpenChange={setIsBannerDialogOpen} 
        />
      </FormSection>
    </FormGrid>
  )
}
