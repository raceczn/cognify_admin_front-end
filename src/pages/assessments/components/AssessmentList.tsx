// src/pages/assessments/components/AssessmentList.tsx
// This component should ONLY render the list of assessments based on props.
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Assessment } from '../data/schema'

// Assuming cn is available globally/imported

// --- 1. Define Props (Correctly enforced on the component function) ---
interface AssessmentListProps {
  assessments: Assessment[]
  selectedAssessment: Assessment | null
  onSelectAssessment: (assessment: Assessment) => void
  onNewAssessment: () => void
}

// --- 2. Export the component receiving props ---
// The original file contained the whole page logic here, which is wrong.
// This is the correct, fixed version that resolves the "assessments are not params" issue.
export function AssessmentList({
  assessments,
  selectedAssessment,
  onSelectAssessment,
}: AssessmentListProps) {
  if (assessments.length === 0) {
    return (
      <div className='text-muted-foreground mt-4 rounded-lg border border-dashed py-12 text-center'>
        <p>No matching assessments found.</p>
        <p className='mt-2 text-sm'>Try adjusting your search filter.</p>
      </div>
    )
  }

  // NOTE: This assumes the visual style uses Card/div elements for rows.
  return (
    <div className='divide-y'>
      {assessments.map((assessment) => (
        <Card
          key={assessment.id || assessment.title}
          // Highlight selected assessment
          className={cn(
            'hover:bg-muted/50 cursor-pointer rounded-none border-x-0 border-t-0 p-3 shadow-none transition-colors last:border-b-0',
            selectedAssessment?.id === assessment.id &&
              'bg-accent/30 hover:bg-accent/40'
          )}
          onClick={() => onSelectAssessment(assessment)}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-base font-semibold'>{assessment.title}</h4>
              <p className='text-muted-foreground text-xs'>
                {assessment.purpose} &bull; {assessment.questions?.length || 0}{' '}
                items
              </p>
            </div>
            <ArrowRight size={16} className='text-muted-foreground' />
          </div>
        </Card>
      ))}
    </div>
  )
}

// NOTE: The previous conflicting 'export default Assessments' is removed.
