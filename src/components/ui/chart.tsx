"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TooltipProps } from "recharts"

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
  }
>

export function ChartContainer({
  children,
  config,
  className,
}: {
  children: React.ReactNode
  config: ChartConfig
  className?: string
}) {
  return (
    <div
      className={cn("relative w-full h-full", className)}
      style={
        Object.fromEntries(
          Object.entries(config).map(([key, value]) => [
            `--color-${key}`,
            value.color,
          ])
        ) as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

export function ChartTooltip({
  content,
}: {
  content: React.ReactNode
}) {
  return content
}

export function ChartTooltipContent({
  className,
  nameKey,
  labelFormatter,
}: {
  className?: string
  nameKey?: string
  labelFormatter?: (value: string) => string
}) {
  return (
    <div className={cn("p-2 rounded-md bg-popover shadow", className)}>
      <div className="text-sm font-medium">
        {nameKey && <div>{nameKey}</div>}
        {labelFormatter && <div>{labelFormatter(new Date().toString())}</div>}
      </div>
    </div>
  )
}
