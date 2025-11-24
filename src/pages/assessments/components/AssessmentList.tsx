// src/components/AssessmentList.tsx
import { Fragment } from 'react'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Assessment } from '@/pages/assessments/data/assessment' // Import Assessment type

// --- COMPONENT PROPS TYPES ---
interface AssessmentListProps {
  assessments: Assessment[] // This list is already filtered from the hook
  selectedAssessment: Assessment | null
  onSelectAssessment: (assessment: Assessment) => void
  onNewAssessment: () => void
}

// --- COMPONENT: AssessmentList (Replaces Student List) ---
export function AssessmentList({ 
  assessments, // assessments is now the *filtered* list from the hook
  selectedAssessment, 
  onSelectAssessment, 
  onNewAssessment 
}: AssessmentListProps) {
  
  // NOTE: The filtering logic was moved to useAssessments.ts

  return (
    <ScrollArea className='-mx-3 h-full overflow-scroll p-3'>
      <Button 
        onClick={onNewAssessment} 
        className='w-full mb-3 gap-2'
      >
        <PlusCircle size={16} /> Create New 
      </Button>
      
      {/* --- Loading State (Simulated) --- */}
      {false ? ( // Use the actual isLoading state here
        <div className='space-y-2'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
        </div>
      ) : (
        assessments.map((assessment) => (
          <Fragment key={assessment.id}>
            <button
              type='button'
              className={cn(
                'group hover:bg-accent hover:text-accent-foreground',
                'flex w-full flex-col rounded-md px-3 py-2 text-start text-sm',
                selectedAssessment?.id === assessment.id && 'bg-muted'
              )}
              onClick={() => onSelectAssessment(assessment)}
            >
              <div className='flex items-center justify-between'>
                <span className='font-medium line-clamp-1'>
                  {assessment.title}
                </span>
                {/* --- MODIFIED CODE START: Status replaced with Purpose --- */}
                <Badge 
                  // Use 'default' variant for Practice_Exam, otherwise 'secondary'
                  variant={assessment.purpose === 'Practice_Exam' ? 'default' : 'secondary'} 
                  className={cn(
                    'ml-2 text-xs',
                    // Practice Exam: Highlighted (Green-ish)
                    assessment.purpose === 'Practice_Exam' && 'bg-[#63A361] text-white text-xs hover:bg-[#63A361]/80',
                    // Post-Test: Blue
                    assessment.purpose === 'Post-Test' && 'bg-blue-500 text-white text-xs hover:bg-blue-500/80',
                    // Pre-Test: Indigo
                    assessment.purpose === 'Pre-Test' && 'bg-indigo-500 text-white text-xs hover:bg-indigo-500/80',
                    // Diagnostic: Red/Pink
                    assessment.purpose === 'Diagnostic' && 'bg-rose-500 text-white text-xs hover:bg-rose-500/80',
                    // Quiz: Gray (Secondary/Muted)
                    assessment.purpose === 'Quiz' && 'bg-gray-400 hover:bg-gray-400/80 text-gray-900',
                  )}
                >
                  {assessment.purpose.replace(/_/g, ' ')} {/* Display purpose, replacing underscores */}
                </Badge>
                {/* --- MODIFIED CODE END --- */}
              </div>
              <span className='text-muted-foreground group-hover:text-accent-foreground/90 line-clamp-1 text-xs mt-1'>
                {assessment.subject_id || 'No subject connected.'}
              </span>
            </button>
            <Separator className='my-1' />
          </Fragment>
        ))
      )}
    </ScrollArea>
  )
}