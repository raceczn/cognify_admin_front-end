import { useState } from 'react'
import {Search, LayoutGrid, ClipboardList, PlusCircle } from 'lucide-react'
// import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
// import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// [FIX] Use local imports for components and data
import { AssessmentList } from './components/AssessmentList'
import { AssessmentEditor } from './components/AssessmentEditor'
import { Assessment } from './data/assessment'
import { useAssessmentsQuery, useCreateAssessmentMutation, useUpdateAssessmentMutation } from '@/lib/assessment-hooks'

export function Assessments() {
  const { data: assessments = [], isLoading } = useAssessmentsQuery()
  const createMutation = useCreateAssessmentMutation()
  const updateMutation = useUpdateAssessmentMutation()

  const [view, setView] = useState<'list' | 'editor'>('list')
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [search, setSearch] = useState('')

  const handleSelect = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setView('editor')
  }

  const handleCreateNew = () => {
    // [FIX] Ensure all non-optional required fields are present, especially is_verified
    const newAssessment: Assessment = {
      title: 'New Assessment',
      purpose: 'Quiz', // Default purpose
      subject_id: '',
      is_verified: false, // [FIX] Add the missing required boolean field
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
        await updateMutation.mutateAsync({ 
          id: updatedAssessment.id, 
          data: updatedAssessment 
        })
        toast.success('Assessment updated')
      } else {
        await createMutation.mutateAsync(updatedAssessment)
        toast.success('Assessment created')
      }
      handleBack()
    } catch (error) {
      toast.error('Failed to save assessment')
      console.error(error)
    }
  }
  
  const filteredAssessments = assessments.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
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
          {view === 'list' && (
            <Button onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Assessment
            </Button>
          )}
        </div>

        {view === 'editor' ? (
            <AssessmentEditor 
                assessment={selectedAssessment} 
                onUpdateAssessment={handleSave} 
                onBack={handleBack} 
            />
        ) : (
            <Tabs defaultValue="manage" className="space-y-4">
                {/* Tabs List */}
                <TabsList>
                    <TabsTrigger value="browse" className="gap-2">
                        <LayoutGrid size={16} /> Browse
                    </TabsTrigger>
                    <TabsTrigger value="manage" className="gap-2">
                        <ClipboardList size={16} /> Manage
                    </TabsTrigger>
                </TabsList>

                {/* Tabs Content */}
                <TabsContent value="browse">
                    <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <p>Browse view coming soon...</p>
                    </div>
                </TabsContent>

                <TabsContent value="manage">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <div className="bg-card rounded-md border p-2">
                            <div className="flex items-center mb-3">
                                {/* Search input */}
                                <input
                                    type='text'
                                    className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden border rounded-md h-10 px-3'
                                    placeholder='Filter assessments by title...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <AssessmentList 
                                // [FIX] Passing filtered list and correct handlers
                                assessments={filteredAssessments}
                                selectedAssessment={selectedAssessment}
                                onSelectAssessment={handleSelect}
                                onNewAssessment={handleCreateNew} // This is used to handle creation from the list view if needed
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