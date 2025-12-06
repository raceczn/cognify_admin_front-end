import { createFileRoute } from '@tanstack/react-router'
// IMPORT THE DEFAULT EXPORT from your pages folder
import Assessments from '@/pages/assessments' 

export const Route = createFileRoute('/_authenticated/assessments/')({
  component: Assessments,
})