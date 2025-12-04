'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

// [FIX] Flexible Interface to match both Global and Student endpoints
export interface SubjectData {
  subject_id: string
  title?: string         // Used in Global Dashboard
  subject_title?: string // Used in Student Report
  passing_rate?: number  // Used in Global Dashboard
  average_score?: number // Used in Student Report
}

interface CoreSubjectsProps {
  data?: SubjectData[]
}

export default function CoreSubjectsPage({ data = [] }: CoreSubjectsProps) {
  return (
    <Card className='flex flex-col h-full'>
      <CardHeader>
        <CardTitle>Core Subjects Performance</CardTitle>
        <CardDescription>Performance breakdown by subject</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 p-0'>
        <ScrollArea className='h-[250px] px-6 pb-4'>
          <div className='space-y-5 pt-2'>
            {data && data.length > 0 ? (
              data.map((item) => {
                // [FIX] Normalizing data keys on the fly
                const name = item.title || item.subject_title || 'Unknown Subject'
                const score = item.passing_rate ?? item.average_score ?? 0

                return (
                  <div key={item.subject_id} className="space-y-1.5">
                    <div className='flex justify-between text-sm font-medium'>
                      <span className="truncate max-w-[180px]" title={name}>{name}</span>
                      <span className={score < 75 ? 'text-red-500' : 'text-green-600'}>
                        {score.toFixed(1)}%
                      </span>
                    </div>
                    <div className='h-2.5 w-full rounded-full bg-secondary/50 overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                          score >= 75 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(5, score)}%` }} // Min width 5% so it's visible
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                <p>No subject data available.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
