import * as React from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

interface UseAdminModuleOptions<TData> {
  moduleKey: string
  /** API endpoint to fetch from. Leave undefined/empty to skip auto-fetching (manage data manually). */
  endpoint?: string
  dataKey?: string // e.g., 'users'. If empty, uses result.data directly
  indicatorsKey?: string // e.g., 'indicators' or 'positionIndicators'
  onFetchSuccess?: (data: TData[]) => void
}

export function useAdminModule<TData, TIndicators = unknown>({
  moduleKey,
  endpoint,
  dataKey,
  indicatorsKey,
  onFetchSuccess,
}: UseAdminModuleOptions<TData>) {
  const { hasPermission, loading: authLoading, activeAccesses } = useAuth()
  const [data, setData] = React.useState<TData[]>([])
  const [indicators, setIndicators] = React.useState<TIndicators | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const canView = hasPermission(moduleKey, 'view')
  const canCreate = hasPermission(moduleKey, 'create')
  const canUpdate = hasPermission(moduleKey, 'update')
  const canDelete = hasPermission(moduleKey, 'delete')

  const fetchData = React.useCallback(
    async (options?: { silent?: boolean }) => {
      // If no endpoint is provided, the caller manages its own fetching
      if (!endpoint) return

      if (!options?.silent) {
        setIsLoading(true)
      }

      try {
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error('Falha ao carregar dados')
        const result = await response.json()

        const payload = result.data

        // Extract data
        let extractedData: TData[] = []
        if (!dataKey) {
          extractedData = Array.isArray(payload) ? payload : payload.data || []
        } else {
          extractedData = payload[dataKey] || []
        }
        setData(extractedData)

        // Extract indicators
        if (indicatorsKey && payload[indicatorsKey]) {
          setIndicators(payload[indicatorsKey])
        } else if (payload.indicators) {
          setIndicators(payload.indicators)
        }

        onFetchSuccess?.(extractedData)
      } catch (error) {
        toast.error('Erro ao atualizar dados')
        console.error(error)
      } finally {
        if (!options?.silent) {
          setIsLoading(false)
        }
      }
    },
    [endpoint, dataKey, indicatorsKey, onFetchSuccess],
  )

  React.useEffect(() => {
    // Only auto-fetch if an endpoint is provided
    if (!authLoading && canView && endpoint) {
      fetchData()
    }
  }, [authLoading, canView, endpoint, fetchData])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === moduleKey)?.name || ''
  }, [activeAccesses, moduleKey])

  return {
    data,
    setData,
    indicators,
    setIndicators,
    isLoading,
    setIsLoading,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    screenName,
    fetchData,
    authLoading,
  }
}
