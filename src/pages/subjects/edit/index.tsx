import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getSubject } from '@/lib/subjects-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { SubjectMutateForm } from '../components/subjects-mutate-drawer'
import { SubjectsProvider } from '../components/subjects-provider'

export default function SubjectsEditPage() {
  const { subjectId } = useParams({
    from: '/_authenticated/subjects/$subjectId/edit',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubject(subjectId),
    enabled: !!subjectId,
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
          <h1 className='text-2xl font-bold tracking-tight'>Edit Subject</h1>
          <p className='text-muted-foreground'>Update subject information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-1/2' />
              </div>
            ) : error ? (
              <p className='text-destructive'>Error loading subject.</p>
            ) : data ? (
              <SubjectsProvider>
                <SubjectMutateForm subjectId={data.id} />
              </SubjectsProvider>
            ) : (
              <p className='text-muted-foreground'>Subject not found.</p>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
