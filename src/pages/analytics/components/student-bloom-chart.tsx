'use client'

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const BLOOM_ORDER = ["remembering", "understanding", "applying", "analyzing", "evaluating", "creating"];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface StudentBloomChartProps {
  data: Record<string, number> | undefined 
}

export function StudentBloomChart({ data }: StudentBloomChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-4">
          <CardTitle>Cognitive Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-[250px] flex items-center justify-center">
           <div className="text-muted-foreground text-sm">No Activity Recorded</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = BLOOM_ORDER.map(level => ({
    subject: level.charAt(0).toUpperCase() + level.slice(1),
    score: data[level] || 0,
    fullMark: 100
  }));

  return (
    // --- FIX: Full height ---
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-4">
        <CardTitle>Cognitive Performance</CardTitle>
        <CardDescription>Class average by Bloom's level</CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex-1">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] w-full">
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="var(--color-score)"
              fill="var(--color-score)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}