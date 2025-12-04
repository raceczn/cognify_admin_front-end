import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { AssessmentEditor } from '@/pages/assessments/components/AssessmentEditor'
import { toast } from 'sonner'
import {
  useAssessmentQuery,
  useUpdateAssessmentMutation,
} from '@/lib/assessment-hooks'
import { getAllSubjects } from '@/lib/subjects-hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export default function AssessmentsEditPage() {
  const navigate = useNavigate()
  const { assessmentId } = useParams({
    from: '/_authenticated/assessments/$assessmentId/edit',
  })

  const {
    data: assessment,
    isLoading: isLoadingAssessment,
    error,
  } = useAssessmentQuery(assessmentId)

  const { data: subjectData } = useQuery({
    queryKey: ['subjects-options'],
    queryFn: async () => {
      const res = await getAllSubjects()
      return res.items.map((s: any) => ({ id: s.id, title: s.title }))
    },
  })
  const subjects = subjectData || []

  const updateMutation = useUpdateAssessmentMutation()

  const handleSave = async (finalData: any) => {
    try {
      await updateMutation.mutateAsync({ id: assessmentId, data: finalData })
      toast.success('Assessment updated')
      navigate({ to: '/assessments' })
    } catch (err) {
      toast.error('Failed to update assessment')
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
        <div className='mb-1'>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Assessment</h1>
          <p className='text-muted-foreground'>
            Update assessment information and questions.
          </p>
        </div>

          <div>
            {isLoadingAssessment ? (
              <div className='space-y-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-1/2' />
              </div>
            ) : error ? (
              <p className='text-destructive'>Error loading assessment.</p>
            ) : assessment ? (
              <AssessmentEditor
                assessment={assessment}
                subjects={subjects}
                onUpdateAssessment={handleSave}
                onBack={() => navigate({ to: '/assessments' })}
              />
            ) : (
              <p className='text-muted-foreground'>Assessment not found.</p>
            )}
          </div>
      </Main>
    </>
  )
}
