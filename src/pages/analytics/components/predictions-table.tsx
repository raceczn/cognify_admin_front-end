// src/pages/analytics/components/predictions-table.tsx
'use client'

import { useNavigate } from '@tanstack/react-router'
import { Loader2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LongText } from '@/components/long-text' // Import LongText

// --- 1. FIX: Updated interface to match /analytics/global_predictions ---
// This now matches the 'predictions_list' from analytics_service.py
interface Prediction {
  student_id: string
  first_name: string | null
  last_name: string | null
  predicted_to_pass: boolean
  overall_score: number // This is the field from the backend
}
// --- END FIX ---

interface PredictionData {
  summary: {
    total_students_predicted: number
    count_predicted_to_pass: number
    count_predicted_to_fail: number
    predicted_pass_rate: number
  }
  predictions: Prediction[]
}

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
  const navigate = useNavigate()

  const handleRowClick = (studentId: string) => {
    navigate({
      to: '/analytics/student/$studentId',
      params: { studentId },
    })
  }

  if (isLoading) {
    return (
      <Card className='bg-background/60 border-border/50 border shadow-sm backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='text-primary h-5 w-5' />
            AI Pass/Fail Predictions
          </CardTitle>
          <CardDescription>
            Running predictive model on all active students...
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[220px] items-center justify-center'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className='border-border/50 border shadow-sm'>
        <CardHeader>
          <CardTitle>AI Pass/Fail Predictions</CardTitle>
          <CardDescription>Could not load model data.</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[220px] items-center justify-center'>
          <span className='text-destructive'>
            {error?.message || 'Failed to load predictions.'}
          </span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='border-border/50 bg-background/70 border shadow-sm backdrop-blur-sm'>
      <CardHeader>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='text-primary h-5 w-5' />
              AI Pass/Fail Predictions
            </CardTitle>
            <CardDescription>
              Click on a student row to view detailed analytics.
            </CardDescription>
          </div>
          <div className='mt-3 flex flex-wrap gap-2 md:mt-0'>
            <Badge variant='outline'>
              Total: {data.summary.total_students_predicted}
            </Badge>
            <Badge variant='success'>
              Pass: {data.summary.count_predicted_to_pass}
            </Badge>
            <Badge variant='destructive'>
              Fail: {data.summary.count_predicted_to_fail}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className='h-[600px] rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead className='text-right'>Overall Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.predictions.length > 0 ? (
                data.predictions.map((p) => (
                  <TableRow
                    key={p.student_id}
                    onClick={() => handleRowClick(p.student_id)}
                    className='hover:bg-muted/60 cursor-pointer transition-all hover:shadow-sm'
                  >
                    {/* --- 2. FIX: Display name and ID --- */}
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {`${p.first_name || ''} ${p.last_name || ''}`.trim() ||
                            'Unknown User'}
                        </span>
                        <LongText className='text-muted-foreground w-48 text-xs'>
                          {p.student_id}
                        </LongText>
                      </div>
                    </TableCell>
                    {/* --- END FIX --- */}

                    <TableCell>
                      <Badge
                        variant='outline'
                        className='text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 text-sm'
                      >
                        {p.predicted_to_pass ? (
                          <CheckCircle2 className='h-4 w-4 text-green-500 dark:text-green-400' />
                        ) : (
                          <XCircle className='h-4 w-4 text-red-500 dark:text-red-400' />
                        )}
                        {p.predicted_to_pass ? 'Predicted to Pass' : 'At Risk'}
                      </Badge>
                    </TableCell>

                    {/* --- 3. FIX: Use overall_score and Progress component --- */}
                    <TableCell className='text-right'>
                      <div className='flex flex-col items-end gap-1'>
                        <span className='font-semibold'>
                          {p.overall_score.toFixed(2)}%
                        </span>
                        <Progress
                          value={p.overall_score}
                          className={`h-2 w-[120px] ${
                            p.predicted_to_pass
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}
                        />
                      </div>
                    </TableCell>
                    {/* --- END FIX --- */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className='text-muted-foreground h-24 text-center'
                  >
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