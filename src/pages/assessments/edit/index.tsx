import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
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
import { AssessmentEditor } from '../components/assessments-editor'

export default function AssessmentsEditPage() {
  const navigate = useNavigate()
  const { assessmentId } = useParams({
    from: '/_authenticated/assessments/$assessmentId/edit',
  })

  // 1. Fetch Assessment Data
  const {
    data: assessment,
    isLoading: isLoadingAssessment,
    error,
  } = useAssessmentQuery(assessmentId)

  // 2. Fetch Subjects for the dropdown
  const { data: subjectData } = useQuery({
    queryKey: ['subjects-options'],
    queryFn: async () => {
      const res = await getAllSubjects()
      return res.items.map((s: any) => ({ id: s.id, title: s.title }))
    },
  })
  const subjects = subjectData || []

  // 3. Mutation for saving changes
  const updateMutation = useUpdateAssessmentMutation()

  const handleSave = async (finalData: any) => {
    try {
      await updateMutation.mutateAsync({ id: assessmentId, data: finalData })
      toast.success('Assessment updated successfully')
      navigate({ to: '/assessments' })
    } catch (err) {
      console.error(err)
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

        <div className='mt-4'>
          {isLoadingAssessment ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-1/2' />
            </div>
          ) : error ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-destructive">
               <p className='font-semibold'>Error loading assessment</p>
               <p className='text-sm text-muted-foreground'>Please try again later.</p>
            </div>
          ) : assessment ? (
            <AssessmentEditor
              assessment={assessment}
              subjects={subjects}
              onUpdateAssessment={handleSave}
              onBack={() => navigate({ to: '/assessments' })}
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Assessment not found.
            </div>
          )}
        </div>
      </Main>
    </>
  )
}