import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AssessmentEditor } from '@/pages/assessments/components/assessments-editor'
import { ModuleMutateForm } from '@/pages/modules/components/modules-mutate-drawer'
import { ModulesProvider } from '@/pages/modules/components/modules-provider'
import { SubjectMutateForm } from '@/pages/subjects/components/subjects-mutate-drawer'
import { SubjectsProvider } from '@/pages/subjects/components/subjects-provider'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateAssessmentMutation } from '@/lib/assessment-hooks'
import api from '@/lib/axios-client'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute(
  '/_authenticated/admin/review/$type/$itemId'
)({
  component: VerificationDetailPage,
})

function VerificationDetailPage() {
  const { type, itemId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // [FIX] State to manage tabs for review
  const [activeTab, setActiveTab] = useState('general')

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
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      rejectMutation.mutate(reason)
    }
  }

  const Header = () => (
    <div className='mb-6 flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate({ to: '/admin/verification' })}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold capitalize tracking-tight'>Review {type}</h1>
          <p className='text-muted-foreground text-sm'>Verify content accuracy and compliance.</p>
        </div>
      </div>
    </div>
  )

  // --- RENDERERS ---

  if (type === 'module') {
    return (
      <Main>
        <div className='p-6 max-w-6xl mx-auto'>
          <Header />
          <ModulesProvider>
            <div className='space-y-6'>
                {/* [FIX] Add Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                        <TabsTrigger value="general">Overview</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="view">Preview</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                <div className='border rounded-xl bg-white shadow-sm overflow-hidden'>
                    <ModuleMutateForm
                        moduleId={itemId}
                        isVerificationMode={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        activeTab={activeTab} // [FIX] Pass active tab
                    />
                </div>
            </div>
          </ModulesProvider>
        </div>
      </Main>
    )
  }

  if (type === 'subject') {
    return (
      <Main>
        <div className='p-6 max-w-6xl mx-auto'>
          <Header />
          <SubjectsProvider>
             <div className='space-y-6'>
                {/* [FIX] Add Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                        <TabsTrigger value="general">Info</TabsTrigger>
                        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className='border rounded-xl bg-white shadow-sm overflow-hidden'>
                    <SubjectMutateForm
                        subjectId={itemId}
                        isVerificationMode={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        activeTab={activeTab} // [FIX] Pass active tab
                    />
                </div>
            </div>
          </SubjectsProvider>
        </div>
      </Main>
    )
  }

  if (type === 'assessment') {
    return (
      <Main>
        <div className='p-6 max-w-6xl mx-auto'>
          <Header />
          <div className='space-y-6'>
             {/* Assessments typically show all data at once, wrapped for consistency */}
             <div className="bg-white">
                <AssessmentVerificationWrapper
                    id={itemId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
             </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='flex h-[50vh] items-center justify-center text-muted-foreground'>
        Unknown Item Type
      </div>
    </Main>
  )
}

// Wrapper to load assessment data before rendering editor
function AssessmentVerificationWrapper({
  id,
  onApprove,
  onReject,
}: {
  id: string
  onApprove: () => void
  onReject: () => void
}) {
  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => {
      const res = await api.get(`/assessments/${id}`)
      return res.data
    },
  })
  const updateAssessment = useUpdateAssessmentMutation()

  if (isLoading)
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='text-muted-foreground animate-spin h-8 w-8' />
      </div>
    )

  return (
    <AssessmentEditor
      assessment={assessment}
      onUpdateAssessment={async (data) => {
        await updateAssessment.mutateAsync({ id, data })
        toast.success('Assessment saved')
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