'use client'

import * as React from 'react'
import { FormSection, FormGrid } from '@/components/layouts/form-section'
import { Field, FieldLabel, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  CloudUpload,
  Image as ImageIcon,
  FileCode,
  XIcon
} from 'lucide-react'
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyContent 
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Sortable Item ---
interface SortablePhraseProps {
  id: string
  phrase: string
  onRemove: () => void
  onUpdate: (val: string) => void
}

function SortablePhrase({ id, phrase, onRemove, onUpdate }: SortablePhraseProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 group/phrase bg-background border rounded-lg p-1 pr-2 shadow-xs transition-shadow',
        isDragging && 'shadow-lg z-50 ring-2 ring-primary/20 opacity-80'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-muted transition-colors touch-none shrink-0"
      >
        <GripVertical className="size-4 text-muted-foreground/40" />
      </div>
      
      <Input 
        value={phrase} 
        onChange={(e) => onUpdate(e.target.value)} 
        placeholder="Sua frase aqui..."
        className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 h-9"
      />
      
      <Button 
        type="button"
        variant="ghost" 
        size="icon-sm" 
        className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/phrase:opacity-100 transition-opacity shrink-0"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

// --- Main Form Component ---
export function SystemParametersAuthForm() {
  const [phrases, setPhrases] = React.useState<{ id: string, text: string }[]>([
    { id: '1', text: "Inovação tecnológica para sua empresa." },
    { id: '2', text: "Segurança e performance em um só lugar." },
    { id: '3', text: "Gestão inteligente de documentos." }
  ])

  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = React.useState<string | null>(null)
  const [bgColor, setBgColor] = React.useState('oklch(0 0 0)')
  const [orbColor, setOrbColor] = React.useState('oklch(1 0 0)')

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPhrases((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addPhrase = () => setPhrases([...phrases, { id: crypto.randomUUID(), text: "" }])
  
  const removePhrase = (id: string) => {
    setPhrases(phrases.filter((p) => p.id !== id))
  }

  const updatePhrase = (id: string, value: string) => {
    setPhrases(phrases.map((p) => p.id === id ? { ...p, text: value } : p))
  }

  return (
    <FormGrid>
      <FormSection title="Identidade Visual" description="Elementos fundamentais da marca." className="h-full">
        <div className="space-y-6">
          <Field>
            <FieldLabel>Logotipo do Sistema</FieldLabel>
            <div className="mt-2">
              {logoUrl ? (
                <div className="relative group size-full aspect-video rounded-xl border overflow-hidden bg-muted/20">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                      Trocar
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setLogoUrl(null)}>
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <Empty className="border border-dashed h-48">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CloudUpload className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Upload de Logotipo</EmptyTitle>
                    <EmptyDescription>
                      Arraste ou clique para enviar. PNG ou SVG (Fundo Transparente).
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                      Selecionar Arquivo
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
              <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setLogoUrl(URL.createObjectURL(e.target.files![0]))} />
            </div>
          </Field>

          <Field>
            <FieldLabel>Favicon (.ico)</FieldLabel>
            <div className="mt-2">
              {faviconUrl ? (
                <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/10">
                  <div className="size-10 rounded border bg-background flex items-center justify-center">
                    <img src={faviconUrl} alt="Favicon" className="size-6" />
                  </div>
                  <div className="flex-1 text-xs text-muted-foreground truncate">favicon.ico</div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setFaviconUrl(null)}>
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <Empty className="border border-dashed h-32">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileCode className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-xs">Favicon do Navegador</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button type="button" variant="outline" size="xs" onClick={() => document.getElementById('favicon-upload')?.click()}>
                      Upload .ico
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
              <input id="favicon-upload" type="file" className="hidden" accept=".ico" onChange={(e) => setFaviconUrl(URL.createObjectURL(e.target.files![0]))} />
            </div>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Banner de Login" description="Apresentação da tela de autenticação." className="h-full">
        <div className="space-y-6 flex flex-col h-full">
          {/* Cores da Animação movidas para o topo */}
          <div className="pb-6 border-b border-muted/40 mb-2">
            <FieldTitle className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">Cores da Animação</FieldTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-[10px]">Background</FieldLabel>
                <div className="flex items-center gap-2">
                  <div className="relative size-10 rounded-md border shrink-0 overflow-hidden shadow-sm">
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor.includes('oklch') ? 'black' : bgColor }} />
                    <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" onChange={(e) => setBgColor(e.target.value)} />
                  </div>
                  <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 text-xs font-mono" />
                </div>
              </Field>

              <Field>
                <FieldLabel className="text-[10px]">Orbs</FieldLabel>
                <div className="flex items-center gap-2">
                  <div className="relative size-10 rounded-md border shrink-0 overflow-hidden shadow-sm">
                    <div className="absolute inset-0" style={{ backgroundColor: orbColor.includes('oklch') ? 'white' : orbColor }} />
                    <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" onChange={(e) => setOrbColor(e.target.value)} />
                  </div>
                  <Input value={orbColor} onChange={(e) => setOrbColor(e.target.value)} className="h-10 text-xs font-mono" />
                </div>
              </Field>
            </div>
          </div>

          <Field className="flex-1">
            <FieldLabel>Mensagens do Banner</FieldLabel>
            <FieldDescription>Arraste para reordenar as frases do carrossel.</FieldDescription>
            
            <div className="mt-2 space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={phrases.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {phrases.map((phrase) => (
                    <SortablePhrase 
                      key={phrase.id} 
                      id={phrase.id} 
                      phrase={phrase.text}
                      onRemove={() => removePhrase(phrase.id)}
                      onUpdate={(val) => updatePhrase(phrase.id, val)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              <Button type="button" variant="ghost" size="sm" className="w-full h-9 border border-dashed hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98]" onClick={addPhrase}>
                <Plus className="size-4 mr-2" />
                Adicionar Frase
              </Button>
            </div>
          </Field>
        </div>
      </FormSection>
    </FormGrid>
  )
}
