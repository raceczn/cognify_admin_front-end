import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AssessmentList } from './AssessmentList'
import { AssessmentEditor } from './AssessmentEditor' 
import { ClipboardList, PlusCircle, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAssessmentsQuery, useCreateAssessmentMutation, useUpdateAssessmentMutation } from '@/lib/assessment-hooks'
import { Assessment } from './data/assessment'
import { toast } from 'sonner'

// --- COMPONENT PROPS TYPES ---
interface AssessmentListProps {
  assessments: Assessment[]
  selectedAssessment: Assessment | null
  onSelectAssessment: (assessment: Assessment) => void
  onNewAssessment: () => void
}

export function AssessmentList() {
  // [FIX] Use React Query Hooks
  const { data: assessments = [], isLoading } = useAssessmentsQuery()
  const createMutation = useCreateAssessmentMutation()
  const updateMutation = useUpdateAssessmentMutation()

  // [FIX] State management for view switching
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  // Handlers
  const handleSelect = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setView('editor')
  }

  const handleCreateNew = () => {
    // Initialize a blank assessment template
    const newAssessment: Assessment = {
      id: '', // Will be assigned by backend
      title: 'New Assessment',
      purpose: 'Quiz',
      subject_id: '',
      questions: []
    }
    setSelectedAssessment(newAssessment)
    setView('editor')
  }

  const handleBack = () => {
    setSelectedAssessment(null)
    setView('list')
  }

  const handleSave = async (updatedAssessment: Assessment) => {
    try {
      if (updatedAssessment.id) {
        // Update existing
        await updateMutation.mutateAsync({ 
          id: updatedAssessment.id, 
          data: updatedAssessment 
        })
        toast.success('Assessment updated')
      } else {
        // Create new
        await createMutation.mutateAsync(updatedAssessment)
        toast.success('Assessment created')
      }
      setView('list')
    } catch (error) {
      toast.error('Failed to save assessment')
      console.error(error)
    }
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Assessments</h2>
            <p className='text-muted-foreground'>
              Create and manage quizzes and exams.
            </p>
          </div>
          {/* Only show Create button if in list view to avoid clutter */}
          {view === 'list' && (
            <Button onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Assessment
            </Button>
          )}
        </div>

        {view === 'editor' ? (
            // [FIX] Editor View
            <AssessmentEditor 
                assessment={selectedAssessment} 
                onUpdateAssessment={handleSave} 
                onBack={handleBack} 
            />
        ) : (
            // [FIX] List/Browse View
            <Tabs defaultValue="manage" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="browse" className="gap-2">
                        <LayoutGrid size={16} /> Browse
                    </TabsTrigger>
                    <TabsTrigger value="manage" className="gap-2">
                        <ClipboardList size={16} /> Manage
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="browse">
                    <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <p>Browse view coming soon...</p>
                        <Button variant="link" onClick={() => document.querySelector<HTMLElement>('[value="manage"]')?.click()}>
                            Go to Manage View
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="manage">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <div className="bg-card rounded-md border p-2">
                            <AssessmentList 
                                assessments={assessments}
                                selectedAssessment={selectedAssessment}
                                onSelectAssessment={handleSelect}
                                onNewAssessment={handleCreateNew}
                            />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        )}
      </Main>
    </>
  )
}

// Named export for the Router
export default Assessments