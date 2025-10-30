// src/pages/analytics/components/predictions-table.tsx
// --- 1. Import `useNavigate` ---
import { useNavigate } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

// Define the types for the prediction data
interface Prediction {
  student_id: string
  predicted_to_pass: boolean
  pass_probability: number
}
interface PredictionData {
  summary: {
    total_students_predicted: number
    count_predicted_to_pass: number
    count_predicted_to_fail: number
    predicted_pass_rate: number
  }
  predictions: Prediction[]
}

// --- 2. Accept data as props ---
interface PredictionsTableProps {
  data: PredictionData | null | undefined
  isLoading: boolean
  error: Error | null
}

export function PredictionsTable({
  data,
  isLoading,
  error,
}: PredictionsTableProps) {
  // --- 3. Get the navigate function ---
  const navigate = useNavigate()

  const handleRowClick = (studentId: string) => {
    navigate({
      // This is the new route you created
      to: '/analytics/student/$studentId',
      params: { studentId },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Pass/Fail Predictions</CardTitle>
          <CardDescription>
            Running the predictive model on all active students...
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[200px] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Pass/Fail Predictions</CardTitle>
          <CardDescription>Could not load AI model data.</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[200px] items-center justify-center'>
          <span className='text-destructive'>
            {error?.message || 'Failed to load predictions.'}
          </span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Pass/Fail Predictions</CardTitle>
        <CardDescription>
          Click on a student row to see their detailed analytics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* --- 4. Add ScrollArea for the table --- */}
        <ScrollArea className='h-[400px]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead className='text-right'>Pass Probability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.predictions.length > 0 ? (
                data.predictions.map((p) => (
                  <TableRow
                    key={p.student_id}
                    // --- 5. Add click handler and styling ---
                    onClick={() => handleRowClick(p.student_id)}
                    className='cursor-pointer hover:bg-muted/50'
                  >
                    <TableCell className='font-medium'>{p.student_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.predicted_to_pass ? 'success' : 'destructive'}
                      >
                        {p.predicted_to_pass ? 'Pass' : 'Fail'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      {p.pass_probability.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className='h-24 text-center'>
                    No student predictions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

