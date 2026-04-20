'use client'

import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import {
  FolderPlusIcon,
  GripVerticalIcon,
  Trash2Icon,
  HelpCircleIcon,
  LibraryIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SidebarGroup, SidebarGroupType, SidebarItem } from '@/types/project'
import { Document } from '@/types/document'
import { getDocumentsAction } from '@/lib/action/document-actions'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Helpers ---

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  // Normaliza o nome do ícone: kebab-case -> PascalCase
  const normalizedName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/Icon$/i, '')

  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >
  const Icon = icons[normalizedName] || icons[`${normalizedName}Icon`] || HelpCircleIcon
  return <Icon className={className} />
}

// --- Sortable Item Component ---

interface SortableItemProps {
  id: string
  groupId: string
  item: SidebarItem
  readOnly?: boolean
  isOutros?: boolean
  onRemove: () => void
}

function SortableDocumentItem({
  id,
  groupId,
  item,
  readOnly,
  isOutros,
  onRemove,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: 'item',
      groupId,
      item,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between p-2 rounded-lg bg-background border shadow-sm group/item mb-1.5',
        isDragging && 'border-primary ring-2 ring-primary/20 shadow-lg z-50',
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
        >
          <GripVerticalIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
        </div>
        <span className="text-sm font-medium truncate">{item.documentName || 'Documento...'}</span>
      </div>

      {!readOnly && !isOutros && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive transition-all hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100"
          onClick={onRemove}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

// --- Sortable Group Component ---

interface SortableGroupProps {
  id: string
  group: SidebarGroup
  readOnly?: boolean
  documents: Document[]
  allGroups: SidebarGroup[]
  onUpdate: (data: Partial<SidebarGroup>) => void
  onRemove: () => void
  onRemoveItem: (itemId: string) => void
}

function SortableGroupCard({
  id,
  group,
  readOnly,
  onUpdate,
  onRemove,
  onRemoveItem,
}: SortableGroupProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: 'group',
      group,
    },
  })

  const isOutros = group.title.toLowerCase() === 'outros'

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const itemIds = React.useMemo(() => group.items.map(item => item.id), [group.items])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/card relative border rounded-xl bg-muted/10 p-4 transition-all mb-4',
        isDragging && 'border-primary ring-4 ring-primary/10 shadow-2xl z-40 bg-background',
        isOutros && 'border-muted-foreground/20 bg-muted/5 opacity-90',
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted transition-colors"
        >
          <GripVerticalIcon className="h-4 w-4 text-muted-foreground/40" />
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              Título do Grupo
            </Label>
            <Input
              value={group.title}
              onChange={e => onUpdate({ title: e.target.value })}
              placeholder="Ex: Primeiros Passos"
              disabled={readOnly || isOutros}
              className={cn(
                'font-semibold bg-background h-9 text-xs',
                isOutros && 'bg-muted cursor-not-allowed',
              )}
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              Estilo Sidebar
            </Label>
            <Select
              value={group.type}
              onValueChange={val => onUpdate({ type: val as SidebarGroupType })}
              disabled={readOnly}
            >
              <SelectTrigger className="bg-background h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solo">Solo (Link)</SelectItem>
                <SelectItem value="List">Lista (Aberto)</SelectItem>
                <SelectItem value="Collapse">Collapse (Árvore)</SelectItem>
                <SelectItem value="Dropdown">Dropdown (Menu)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              Ícone
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-9 w-9 shrink-0 border rounded-md bg-background text-primary">
                <DynamicIcon name={group.icon || 'Folder'} className="h-4 w-4" />
              </div>
              <Input
                value={group.icon || ''}
                onChange={e => onUpdate({ icon: e.target.value })}
                placeholder="Ex: Book, Settings..."
                disabled={readOnly}
                className="bg-background flex-1 h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {!readOnly && !isOutros && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="mt-4 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-1 pl-10">
        <div className="flex items-center justify-between mb-2 px-1">
          <Badge variant="secondary" className="text-[10px] font-semibold py-0 h-4.5 uppercase">
            {group.items.length} {group.items.length === 1 ? 'documento' : 'documentos'}
          </Badge>
          {isOutros && (
            <Badge
              variant="outline"
              className="text-[10px] font-semibold py-0 h-4.5 uppercase border-primary/30 text-primary"
            >
              Principal
            </Badge>
          )}
        </div>

        <SortableContext id={group.id} items={itemIds} strategy={verticalListSortingStrategy}>
          <div
            className={cn(
              'min-h-[40px] rounded-lg border-2 border-dashed border-transparent p-1 transition-colors',
              group.items.length === 0 &&
                'border-muted/30 bg-muted/5 flex items-center justify-center',
            )}
          >
            {group.items.length === 0 && (
              <span className="text-[10px] text-muted-foreground italic">Vazio</span>
            )}
            {group.items.map(item => (
              <SortableDocumentItem
                key={item.id}
                id={item.id}
                groupId={group.id}
                item={item}
                readOnly={readOnly}
                isOutros={isOutros}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </div>
        </SortableContext>

        {/* O botão "Adicionar Documento" foi removido a pedido para simplificar e focar no Drag and Drop */}
      </div>
    </div>
  )
}

// --- Main Component ---

interface SidebarConfigCardProps {
  projectId: string
  initialConfig?: SidebarGroup[]
  onChange: (config: SidebarGroup[]) => void
  readOnly?: boolean
}

export function SidebarConfigCard({
  projectId,
  initialConfig = [],
  onChange,
  readOnly,
}: SidebarConfigCardProps) {
  const [groups, setGroups] = React.useState<SidebarGroup[]>(initialConfig)
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = React.useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  React.useEffect(() => {
    async function fetchDocs() {
      setLoadingDocs(true)
      const result = await getDocumentsAction()
      if (result.data) {
        setDocuments(result.data.documents.filter(d => d.projectId === projectId))
      }
      setLoadingDocs(false)
    }
    fetchDocs()
  }, [projectId])

  const handleUpdate = (newGroups: SidebarGroup[]) => {
    setGroups(newGroups)
    onChange(newGroups)
  }

  const findContainer = (id: string) => {
    if (groups.some(g => g.id === id)) return id
    return groups.find(g => g.items.some(i => i.id === id))?.id
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    if (active.data.current?.type === 'item') {
      const activeGroup = groups.find(g => g.id === activeContainer)
      const overGroup = groups.find(g => g.id === overContainer)

      if (!activeGroup || !overGroup) return

      const activeItems = activeGroup.items
      const overItems = overGroup.items

      const activeIndex = activeItems.findIndex(i => i.id === activeId)
      const overIndex =
        overGroup.id === overId ? overItems.length : overItems.findIndex(i => i.id === overId)

      const itemMove = activeItems[activeIndex]

      const newGroups = groups.map(g => {
        if (g.id === activeContainer) {
          return { ...g, items: g.items.filter(i => i.id !== activeId) }
        }
        if (g.id === overContainer) {
          const newItems = [...g.items]
          newItems.splice(overIndex, 0, itemMove)
          return { ...g, items: newItems }
        }
        return g
      })
      setGroups(newGroups)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (active.data.current?.type === 'group') {
      if (activeId !== overId) {
        const oldIndex = groups.findIndex(g => g.id === activeId)
        const newIndex = groups.findIndex(g => g.id === overId)
        handleUpdate(arrayMove(groups, oldIndex, newIndex).map((g, i) => ({ ...g, order: i })))
      }
      return
    }

    if (active.data.current?.type === 'item') {
      const activeContainer = findContainer(activeId)
      const overContainer = findContainer(overId)

      if (activeContainer && overContainer && activeContainer === overContainer) {
        const groupIndex = groups.findIndex(g => g.id === activeContainer)
        const group = groups[groupIndex]
        const oldIndex = group.items.findIndex(i => i.id === activeId)
        const newIndex = group.items.findIndex(i => i.id === overId)

        if (oldIndex !== newIndex) {
          const newItems = arrayMove(group.items, oldIndex, newIndex).map((item, i) => ({
            ...item,
            order: i,
          }))
          const newGroups = [...groups]
          newGroups[groupIndex] = { ...group, items: newItems }
          handleUpdate(newGroups)
        }
      } else {
        handleUpdate(groups)
      }
    }
  }

  const moveItemToOutros = (fromGroupId: string, itemId: string) => {
    const fromGroup = groups.find(g => g.id === fromGroupId)
    const outrosGroup = groups.find(g => g.title.toLowerCase() === 'outros')

    if (!fromGroup || !outrosGroup) return

    const itemToMove = fromGroup.items.find(i => i.id === itemId)
    if (!itemToMove) return

    const newGroups = groups.map(g => {
      if (g.id === fromGroupId) {
        return { ...g, items: g.items.filter(i => i.id !== itemId) }
      }
      if (g.id === outrosGroup.id) {
        return { ...g, items: [...g.items, itemToMove] }
      }
      return g
    })
    handleUpdate(newGroups)
  }

  return (
    <Card className="shadow-sm overflow-hidden border-muted/40">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Configuração da Sidebar</CardTitle>
            <CardDescription className="text-xs">
              Organize os documentos do projeto na navegação lateral.
            </CardDescription>
          </div>
          {!readOnly && (
            <Button
              onClick={() =>
                handleUpdate([
                  ...groups,
                  {
                    id: crypto.randomUUID(),
                    title: 'Novo Grupo',
                    type: 'List',
                    order: groups.length,
                    icon: 'Folder',
                    items: [],
                  },
                ])
              }
              type="button"
              size="sm"
              variant="outline"
              className="gap-2 h-8 text-xs"
            >
              <FolderPlusIcon className="h-3.5 w-3.5" />
              Adicionar Grupo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-6 py-4 pt-0">
        {groups.length === 0 && !loadingDocs ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg bg-muted/5">
            <LibraryIcon className="h-10 w-10 text-muted/30 mb-3" />
            <p className="text-xs text-muted-foreground font-semibold">
              Nenhum agrupamento definido.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4 pt-2">
              <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {groups.map(group => (
                  <SortableGroupCard
                    key={group.id}
                    id={group.id}
                    group={group}
                    readOnly={readOnly}
                    documents={documents}
                    allGroups={groups}
                    onUpdate={data =>
                      handleUpdate(groups.map(g => (g.id === group.id ? { ...g, ...data } : g)))
                    }
                    onRemove={() => handleUpdate(groups.filter(g => g.id !== group.id))}
                    onRemoveItem={itemId => moveItemToOutros(group.id, itemId)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}
