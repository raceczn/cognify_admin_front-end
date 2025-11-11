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
    <div className='space-y-2'>
      {items.map((item) => (
        <div key={item.name}>
          <div className='mb-1 flex justify-between'>
            <span>{item.name}</span>
            <span>{valueFormatter(item.value)}</span>
          </div>
          <div className='h-6 w-full rounded bg-gray-200'>
            <div
              className={`${barClass} h-6 rounded`}
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
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Core Subjects</CardTitle>
        <CardDescription>Students' knowledge in each subject.</CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleBarList
          items={[
            { name: 'Psychological Assessment', value: 74 },
            { name: 'Abnormal Psychology', value: 22 },
            { name: 'Developmental Psychology', value: 4 },
            { name: 'Industrial/Organizational Psychology', value: 4 },
          ]}
          barClass='bg-muted-foreground'
          valueFormatter={(n) => `${n}%`}
        />
      </CardContent>
    </Card>
  )
}
