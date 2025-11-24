// src/components/AssessmentList.tsx
import { Fragment } from 'react'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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

  // Function to get the color class for the purpose dot
  const getPurposeDotColor = (purpose: Assessment['purpose']): string => {
    switch (purpose) {
      case 'Practice_Exam':
        return 'bg-[#63A361]' // Green
      case 'Post-Test':
        return 'bg-[#8CA9FF]' // Blue
      case 'Pre-Test':
        return 'bg-[#FFA239]' // Orange
      case 'Diagnostic':
        return 'bg-[#D34E4E]' // Red
      case 'Quiz':
        return 'bg-gray-400' // Gray
      default:
        return 'bg-gray-500' // Default color
    }
  }

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
                
                {/* --- MODIFIED CODE START --- */}
                <div className='flex items-center text-xs ml-2 opacity-80 flex-shrink-0'>
                  {/* Colored Dot */}
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full mr-1',
                      getPurposeDotColor(assessment.purpose)
                    )}
                    aria-hidden="true"
                  />
                  {/* Label */}
                  <span className='text-gray-600 dark:text-gray-400'>
                    {assessment.purpose.replace(/_/g, ' ')} {/* Display purpose, replacing underscores */}
                  </span>
                </div>
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