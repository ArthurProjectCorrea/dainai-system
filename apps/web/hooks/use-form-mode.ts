'use client'

import { usePathname } from 'next/navigation'

export function useFormMode() {
  const pathname = usePathname()

  const isCreate = pathname.includes('/create')
  const isView = pathname.includes('/view') || pathname.endsWith('/view')
  const isEdit = pathname.includes('/edit') || (!isCreate && !isView)

  return {
    isCreate,
    isView,
    isEdit,
    readOnly: isView,
    type: isCreate ? 'create' : ('edit' as 'create' | 'edit'),
  }
}
