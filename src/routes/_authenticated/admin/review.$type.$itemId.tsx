import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import api from '@/lib/axios-client'
import { Main } from '@/components/layout/main' // [FIX] Import Main layout

// Import Editors and Providers
import { ModulesProvider } from '@/pages/modules/components/modules-provider'
import { ModuleMutateForm } from '@/pages/modules/components/modules-mutate-drawer'
import { SubjectsProvider } from '@/pages/subjects/components/subjects-provider'
import { SubjectMutateForm } from '@/pages/subjects/components/subjects-mutate-drawer'
import { AssessmentEditor } from '@/pages/assessments/components/AssessmentEditor'
import { useUpdateAssessmentMutation } from '@/lib/assessment-hooks'

export const Route = createFileRoute('/_authenticated/admin/review/$type/$itemId')({
  component: VerificationDetailPage,
})

function VerificationDetailPage() {
  const { type, itemId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // --- ACTIONS ---
  const verifyMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/${type}s/${itemId}/verify`)
    },
    onSuccess: () => {
      toast.success('Item verified successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-verification-queue'] })
      navigate({ to: '/admin/verification' })
    },
    onError: () => toast.error('Failed to verify item'),
  })

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      await api.post(`/${type}s/${itemId}/reject`, null, { params: { reason } })
    },
    onSuccess: () => {
      toast.success('Item rejected')
      queryClient.invalidateQueries({ queryKey: ['admin-verification-queue'] })
      navigate({ to: '/admin/verification' })
    },
    onError: () => toast.error('Failed to reject item'),
  })

  const handleApprove = async () => {
    await verifyMutation.mutateAsync()
  }

  const handleReject = () => {
    const reason = prompt("Enter rejection reason:")
    if (reason) {
      rejectMutation.mutate(reason)
    }
  }

  // --- RENDERERS ---
  // [FIX] Wrap everything in <Main> to match system layout
  
  if (type === 'module') {
    return (
      <Main>
        <ModulesProvider>
            <ModuleMutateForm 
                moduleId={itemId} 
                isVerificationMode={true}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </ModulesProvider>
      </Main>
    )
  }

  if (type === 'subject') {
    return (
      <Main>
        <SubjectsProvider>
            <SubjectMutateForm 
                subjectId={itemId}
                isVerificationMode={true}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </SubjectsProvider>
      </Main>
    )
  }

  if (type === 'assessment') {
     return (
       <Main>
         <AssessmentVerificationWrapper id={itemId} onApprove={handleApprove} onReject={handleReject} />
       </Main>
     )
  }

  return <Main><div className="p-8 text-center text-muted-foreground">Unknown Item Type</div></Main>
}

// Wrapper to load assessment data before rendering editor
function AssessmentVerificationWrapper({ id, onApprove, onReject }: { id: string, onApprove: () => void, onReject: () => void }) {
    const { data: assessment, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: async () => {
            const res = await api.get(`/assessments/${id}`)
            return res.data
        }
    })
    const updateAssessment = useUpdateAssessmentMutation()

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

    return (
        <AssessmentEditor 
            assessment={assessment}
            onUpdateAssessment={async (data) => {
                await updateAssessment.mutateAsync({ id, data })
                toast.success("Assessment saved")
            }}
            isVerificationMode={true}
            onApprove={async (currentData) => {
                await updateAssessment.mutateAsync({ id, data: currentData })
                onApprove()
            }}
            onReject={onReject}
        />
    )
}