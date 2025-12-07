import { useQuery } from '@tanstack/react-query'
import { getSystemUserStatistics } from '@/lib/profile-hooks'

export function useSystemStats() {
  return useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: getSystemUserStatistics,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true, 
  })
}