'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MdEditor } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { toast } from 'sonner'
import { Send, Hash, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Separator } from '@/components/ui/separator'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { FormLayout } from '@/components/layouts/form-layout'
import { FormSection, FormGrid } from '@/components/form-section'
import { CreatableCombobox } from '@/components/creatable-combobox'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  createDocumentAction,
  updateDocumentAction,
  publishDocumentAction,
  getCategoriesAction,
  createCategoryAction,
} from '@/lib/action/document-actions'
import type { Document, Category, DocumentStatus } from '@/types/document'
import type { Project } from '@/types/project'

interface DocumentFormProps {
  mode: 'create' | 'edit' | 'view'
  initialData?: Document | null
  projects: Project[]
  onSuccess?: () => void
  onCancel?: () => void
  canApprove?: boolean
  onEdit?: () => void
}

export function DocumentForm({
  mode,
  initialData,
  projects,
  onSuccess,
  onCancel,
  canApprove = true,
  onEdit,
}: DocumentFormProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>(
    initialData?.categories.map(c => c.id) || [],
  )

  const [name, setName] = React.useState(initialData?.name || '')
  const [content, setContent] = React.useState(initialData?.content || '')
  const [projectId, setProjectId] = React.useState(initialData?.projectId || '')
  const [status, setStatus] = React.useState<DocumentStatus>(initialData?.status || 'Draft')
  const [saveWarningOpen, setSaveWarningOpen] = React.useState(false)

  const isView = mode === 'view'

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setContent(initialData.content)
      setProjectId(initialData.projectId)
      setStatus(initialData.status)
      setSelectedCategoryIds(initialData.categories.map(c => c.id))
    }
  }, [initialData])

  React.useEffect(() => {
    async function loadCategories() {
      const res = await getCategoriesAction()
      if (res.data) setCategories(res.data)
    }
    loadCategories()
  }, [])

  async function handleSubmit(e?: React.FormEvent, forceStatus?: DocumentStatus) {
    if (e) e.preventDefault()

    // Validation
    if (!projectId) return toast.error('Selecione um projeto.')
    if (!name) return toast.error('O nome é obrigatório.')

    // Confirmation for Published docs
    if (status === 'Published' && !forceStatus) {
      setSaveWarningOpen(true)
      return
    }

    const effectiveStatus = forceStatus || status

    setLoading(true)
    try {
      if (mode === 'edit' && initialData) {
        const res = await updateDocumentAction(initialData.id, {
          name,
          content,
          status: effectiveStatus,
          categoryIds: selectedCategoryIds,
        })
        if (res.error) throw new Error(res.error)
        toast.success('Documento atualizado!')
        if (forceStatus === 'Draft') {
          setStatus('Draft')
          toast.info('Documento voltou para rascunho para aprovação.')
        }
      } else {
        const res = await createDocumentAction({
          projectId,
          name,
          content,
          status: effectiveStatus,
          categoryIds: selectedCategoryIds,
        })
        if (res.error) throw new Error(res.error)
        toast.success('Documento criado!')
        // After create, we keep them on the edit page for this document
        router.push(`/documents/${res.data!.id}/edit`)
      }
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar documento')
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish() {
    if (!initialData) return
    setLoading(true)
    try {
      const res = await publishDocumentAction(initialData.id)
      if (res.error) throw new Error(res.error)
      toast.success(`Documento publicado! Versão: ${res.data!.currentVersion}`)
      setStatus('Published')
      router.push('/documents')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao publicar documento')
    } finally {
      setLoading(false)
    }
  }

  async function handleCategoryChange(value: string, isNew: boolean) {
    if (isNew) {
      const res = await createCategoryAction(value)
      if (res.data) {
        setCategories(prev => [...prev, res.data!])
        setSelectedCategoryIds(prev => [...prev, res.data!.id])
      } else {
        toast.error(res.error || 'Erro ao criar categoria.')
      }
    } else {
      const catId = parseInt(value)
      if (!selectedCategoryIds.includes(catId)) {
        setSelectedCategoryIds(prev => [...prev, catId])
      }
    }
  }

  const removeCategory = (id: number) => {
    setSelectedCategoryIds(prev => prev.filter(cId => cId !== id))
  }

  // Publish button ONLY appears if status is Completed
  const publishButton = initialData && mode === 'edit' && canApprove && status === 'Completed' && (
    <Button type="button" className="gap-2 min-w-32" onClick={handlePublish} disabled={loading}>
      <Send className="h-4 w-4" />
      Publicar Versão
    </Button>
  )

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <FormLayout
          className="flex-1 min-h-0"
          title={
            mode === 'create'
              ? 'Novo Documento'
              : isView
                ? 'Visualizar Documento'
                : 'Editar Documento'
          }
          description={
            isView ? 'Conteúdo técnico do repositório' : 'Gerencie conteúdo Markdown e metadados'
          }
          mode={mode}
          loading={loading}
          onCancel={onCancel}
          onEdit={onEdit}
          variant="page"
          extraActions={publishButton}
        >
          <FormGrid className="lg:grid-cols-4 flex-1 min-h-0">
            {/* Sidebar: All Inputs */}
            <FormSection className="lg:col-span-1" contentClassName="p-3 md:p-4">
              <div className="flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="projectId" className="text-xs mb-1">
                    Projeto Relacionado
                  </FieldLabel>
                  <Select
                    value={projectId}
                    onValueChange={setProjectId}
                    disabled={mode !== 'create' || isView}
                  >
                    <SelectTrigger id="projectId" className="h-9 text-xs">
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="name" className="text-xs mb-1">
                    Nome do Documento
                  </FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: API Setup Guide"
                    disabled={isView}
                    className="h-9 text-xs"
                    required
                  />
                </Field>

                <Separator className="my-1" />

                <Field>
                  <FieldLabel className="text-xs mb-1">Categorias</FieldLabel>
                  <div className="space-y-3">
                    {!isView && (
                      <CreatableCombobox
                        options={categories
                          .filter(c => !selectedCategoryIds.includes(c.id))
                          .map(c => ({ value: c.id.toString(), label: c.name }))}
                        onValueChange={handleCategoryChange}
                        placeholder="Adicionar..."
                      />
                    )}
                    <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/5 min-h-9">
                      {selectedCategoryIds.length === 0 && (
                        <span className="text-xs text-muted-foreground/40 italic">
                          Sem categorias
                        </span>
                      )}
                      {selectedCategoryIds.map(id => {
                        const cat = categories.find(c => c.id === id)
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 h-5 text-xs"
                          >
                            {cat?.name || id}
                            {!isView && (
                              <button
                                type="button"
                                onClick={() => removeCategory(id)}
                                className="text-muted-foreground hover:text-destructive p-0.5"
                              >
                                <XIcon className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </Field>

                <div className="space-y-3 pt-3 border-t">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle className="text-xs font-medium">Status</FieldTitle>
                      <FieldDescription className="text-xs">
                        {status === 'Published'
                          ? 'Publicado'
                          : status === 'Completed'
                            ? 'Concluído'
                            : 'Rascunho'}
                      </FieldDescription>
                    </FieldContent>
                    <div className="flex flex-col items-end gap-1.5">
                      <Switch
                        id="status-toggle"
                        checked={status !== 'Draft'}
                        onCheckedChange={checked => setStatus(checked ? 'Completed' : 'Draft')}
                        disabled={isView || status === 'Published' || mode === 'create'}
                        className="scale-90"
                      />
                      <Badge
                        variant={status === 'Published' ? 'default' : 'secondary'}
                        className="h-4 text-xs px-1.5"
                      >
                        {status === 'Published'
                          ? 'Publicado'
                          : status === 'Completed'
                            ? 'Concluído'
                            : 'Rascunho'}
                      </Badge>
                    </div>
                  </Field>

                  {initialData?.currentVersion && (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle className="text-xs font-medium">Versão</FieldTitle>
                      </FieldContent>
                      <div className="flex items-center gap-1 font-bold text-xs">
                        <Hash className="h-3 w-3 text-primary" />
                        {initialData.currentVersion}
                      </div>
                    </Field>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Main Area: Markdown Editor - Removed from Card Layout */}
            <div className="lg:col-span-3 border rounded-md overflow-hidden bg-background shadow-sm">
              <MdEditor
                modelValue={content}
                onChange={setContent}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                language="en-US"
                className="border-none"
                style={{ height: 'calc(100vh - 12rem)' }}
                disabled={isView}
                toolbars={
                  isView
                    ? ['fullscreen', 'catalog']
                    : [
                        'bold',
                        'italic',
                        'strikeThrough',
                        'title',
                        'quote',
                        'unorderedList',
                        'orderedList',
                        'task',
                        '-',
                        'codeRow',
                        'code',
                        'link',
                        'image',
                        'table',
                        'mermaid',
                        'katex',
                        '-',
                        'revoke',
                        'next',
                        'save',
                        '=',
                        'pageFullscreen',
                        'fullscreen',
                        'preview',
                        'htmlPreview',
                        'catalog',
                      ]
                }
                onSave={() => !isView && handleSubmit()}
              />
            </div>
          </FormGrid>
        </FormLayout>
      </form>

      <AlertDialog open={saveWarningOpen} onOpenChange={setSaveWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja salvar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Este documento já possui uma versão publicada. Ao salvar estas alterações, a
              <strong>versão atual continuará visível</strong> para os usuários, mas as novas
              modificações voltarão para o status de <strong>Rascunho</strong> e precisarão ser
              aprovadas novamente para se tornarem a nova versão oficial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSaveWarningOpen(false)
                handleSubmit(undefined, 'Draft')
              }}
            >
              Confirmar e Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
