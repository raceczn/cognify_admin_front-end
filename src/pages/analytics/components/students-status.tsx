'use client'

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'

// --- FIX: Define Interface for Props ---
interface SummaryData {
  total_students_predicted: number
  count_predicted_to_pass: number
  count_predicted_to_fail: number
  predicted_pass_rate: number
}

interface StudentStatusProps {
  summary: SummaryData | undefined
}

const chartConfig = {
  pass: {
    label: 'Pass',
    color: '#007E6E',
  },
  fail: {
    label: 'At Risk',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function StudentStatus({ summary }: StudentStatusProps) {
  // --- FIX: Use Prop Data ---
  const passCount = summary?.count_predicted_to_pass || 0
  
  const chartData = [
    {
      browser: 'status',
      pass: passCount,
      fill: '#007E6E',
    },
  ]

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Students’ Status</CardTitle>
        <CardDescription>Students currently on track</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType='circle'
              radialLines={false}
              stroke='none'
              className='first:fill-muted last:fill-background'
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey='pass'
              background
              cornerRadius={10}
              fill='#007E6E'
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-4xl font-bold'
                        >
                          {passCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Likely to Pass
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
