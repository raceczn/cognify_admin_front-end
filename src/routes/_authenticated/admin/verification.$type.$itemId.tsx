import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios-client'

// Import Editors and Providers
import { ModulesProvider } from '@/pages/modules/components/modules-provider'
import { ModuleMutateForm } from '@/pages/modules/components/modules-mutate-drawer'
import { SubjectsProvider } from '@/pages/subjects/components/subjects-provider'
import { SubjectMutateForm } from '@/pages/subjects/components/subjects-mutate-drawer'
import { AssessmentEditor } from '@/pages/assessments/components/AssessmentEditor'
import { useUpdateAssessmentMutation } from '@/lib/assessment-hooks'

export const Route = createFileRoute('/_authenticated/admin/verification/$type/$itemId')({
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
    // This function is passed to forms. 
    // The forms should SAVE first, then call this.
    await verifyMutation.mutateAsync()
  }

  const handleReject = () => {
    const reason = prompt("Enter rejection reason:")
    if (reason) {
      rejectMutation.mutate(reason)
    }
  }

  // --- RENDERERS ---

  if (type === 'module') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: "/admin/verification" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Verify Module</h1>
            <p className="text-muted-foreground">Review content, make edits if necessary, then approve.</p>
          </div>
        </div>
        <ModulesProvider>
            <ModuleMutateForm 
                moduleId={itemId} 
                isVerificationMode={true}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </ModulesProvider>
      </div>
    )
  }

  if (type === 'subject') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: "/admin/verification" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Verify Subject</h1>
            <p className="text-muted-foreground">Review syllabus, make edits if necessary, then approve.</p>
          </div>
        </div>
        <SubjectsProvider>
            <SubjectMutateForm 
                subjectId={itemId}
                isVerificationMode={true}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </SubjectsProvider>
      </div>
    )
  }

  if (type === 'assessment') {
     return <AssessmentVerificationWrapper id={itemId} onApprove={handleApprove} onReject={handleReject} />
  }

  return <div className="p-8 text-center">Unknown Item Type</div>
}

// --- SPECIAL WRAPPER FOR ASSESSMENT ---
function AssessmentVerificationWrapper({ id, onApprove, onReject }: { id: string, onApprove: () => void, onReject: () => void }) {
    const navigate = useNavigate()
    const { data: assessment, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: async () => {
            const res = await api.get(`/assessments/${id}`)
            return res.data
        }
    })
    const updateAssessment = useUpdateAssessmentMutation()

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate({ to: "/admin/verification" })}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Verify Assessment</h1>
                    <p className="text-muted-foreground">Review questions, make edits if necessary, then approve.</p>
                </div>
            </div>
            
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
        </div>
    )
}