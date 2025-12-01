import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getAllSubjects } from '@/lib/subjects-hooks'
import { useCreateAssessmentMutation } from '@/lib/assessment-hooks'
import { Assessment } from '@/pages/assessments/data/schema'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AssessmentEditor } from '@/pages/assessments/components/AssessmentEditor'
import { toast } from 'sonner'

export default function AssessmentsNewPage() {
  const navigate = useNavigate()
  const createMutation = useCreateAssessmentMutation()

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subjects-options'],
    queryFn: async () => {
      const res = await getAllSubjects()
      return res.items.map((s: any) => ({ id: s.id, title: s.title }))
    },
  })
  const subjects = subjectData || []

  const handleSave = async (finalData: Assessment) => {
    try {
      const { id, ...payload } = finalData
      await createMutation.mutateAsync(payload)
      toast.success('Assessment created')
      navigate({ to: '/assessments' })
    } catch (error) {
      toast.error('Failed to create assessment')
    }
  }

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
          <h1 className='text-2xl font-bold tracking-tight'>Create Assessment</h1>
          <p className='text-muted-foreground'>Define the assessment details and questions.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-1/2' />
              </div>
            ) : (
              <AssessmentEditor
                assessment={{
                  id: '',
                  title: '',
                  subject_id: '',
                  purpose: 'quiz',
                  bloom_levels: [],
                  questions: [],
                  is_verified: false,
                } as Assessment}
                subjects={subjects}
                onUpdateAssessment={handleSave}
                onBack={() => navigate({ to: '/assessments' })}
              />
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
