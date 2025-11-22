'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SimpleBarItem {
  name: string
  value: number
}

interface SimpleBarListProps {
  items: SimpleBarItem[]
  barClass?: string
  valueFormatter?: (n: number) => string
}

const SimpleBarList: React.FC<SimpleBarListProps> = ({
  items,
  barClass = '',
  valueFormatter = (n) => n.toString(),
}) => {
  return (
    <div className='space-y-4'>
      {items.map((item) => (
        <div key={item.name}>
          <div className='mb-1 flex justify-between text-sm font-medium'>
            <span>{item.name}</span>
            <span>{valueFormatter(item.value)}</span>
          </div>
          <div className='h-3 w-full rounded-full bg-secondary'>
            <div
              className={`${barClass} h-3 rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CoreSubjectsPage() {
  return (
    // --- FIX: Full height ---
    <Card className='w-full h-full flex flex-col'>
      <CardHeader>
        <CardTitle>Core Subjects</CardTitle>
        <CardDescription>Class performance by subject</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <SimpleBarList
          items={[
            { name: 'Psychological Assessment', value: 74 },
            { name: 'Abnormal Psychology', value: 22 },
            { name: 'Developmental Psychology', value: 65 },
            { name: 'Industrial/Org Psychology', value: 48 },
          ]}
          barClass='bg-primary'
          valueFormatter={(n) => `${n}%`}
        />
      </CardContent>
    </Card>
  )
}