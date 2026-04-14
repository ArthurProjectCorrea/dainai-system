'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({ columnCount, rowCount = 5 }: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell key={j} className="h-12">
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
