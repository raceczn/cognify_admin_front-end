import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getModule } from '@/lib/modules-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ModuleMutateForm } from '../components/modules-mutate-drawer'
import { ModulesProvider } from '../components/modules-provider'

export default function ModulesEditPage() {
  // @ts-ignore
  const { moduleId } = useParams({
    from: '/_authenticated/modules/$moduleId/edit',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => getModule(moduleId),
    enabled: !!moduleId,
  })

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Module</h1>
          <p className='text-muted-foreground'>Update module information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-1/2' />
              </div>
            ) : error ? (
              <p className='text-destructive'>Error loading module.</p>
            ) : data ? (
              <ModulesProvider>
                <ModuleMutateForm moduleId={data.id} />
              </ModulesProvider>
            ) : (
              <p className='text-muted-foreground'>Module not found.</p>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
