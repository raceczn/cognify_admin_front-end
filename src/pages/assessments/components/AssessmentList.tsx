// src/pages/assessments/components/AssessmentList.tsx
// This component should ONLY render the list of assessments based on props.

import { Assessment } from '../data/assessment'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming cn is available globally/imported

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
  onSelectAssessment 
}: AssessmentListProps) {
  
  if (assessments.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg mt-4">
        <p>No matching assessments found.</p>
        <p className="text-sm mt-2">Try adjusting your search filter.</p>
      </div>
    )
  }

  // NOTE: This assumes the visual style uses Card/div elements for rows.
  return (
    <div className='divide-y'>
      {assessments.map(assessment => (
        <Card 
          key={assessment.id || assessment.title}
          // Highlight selected assessment
          className={cn(
            "p-3 rounded-none border-x-0 border-t-0 last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors shadow-none",
            selectedAssessment?.id === assessment.id && "bg-accent/30 hover:bg-accent/40"
          )}
          onClick={() => onSelectAssessment(assessment)}
        >
            <div className='flex items-center justify-between'>
                <div>
                    <h4 className='font-semibold text-base'>{assessment.title}</h4>
                    <p className='text-xs text-muted-foreground'>
                        {assessment.purpose} &bull; {assessment.questions?.length || 0} items
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