'use client'

import * as React from 'react'
import { ListIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TableOfContents } from './table-of-contents'
import { type Heading } from '@/lib/utils/toc-utils'

interface MobileTocProps {
  headings: Heading[]
}

export function MobileToc({ headings }: MobileTocProps) {
  const [open, setOpen] = React.useState(false)

  if (headings.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 2xl:hidden">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="default" size="icon" className="h-10 w-10 rounded-xl ">
                  <ListIcon className="size-5 text-primary-foreground" />
                  <span className="sr-only">Sumário do Documento</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] border-l border-border/50 bg-background p-0"
              >
                <SheetHeader className="p-6 pb-2 border-b border-border/30">
                  <SheetTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                    <ListIcon className="size-5 text-primary" />
                    Nesta Página
                  </SheetTitle>
                </SheetHeader>
                <div className="px-4 py-6 h-full overflow-y-auto">
                  <TableOfContents
                    headings={headings}
                    onItemClick={() => setOpen(false)}
                    hideTitle
                  />
                </div>
              </SheetContent>
            </Sheet>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={10}>
            Sumário do Documento
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
