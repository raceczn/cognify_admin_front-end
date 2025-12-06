import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubjectMutateForm } from '../components/subjects-mutate-drawer'
import { SubjectsProvider } from '../components/subjects-provider'

export default function SubjectsNewPage() {
  // 1. Lifted state to control tabs from the parent, exactly like the Edit page
  const [activeTab, setActiveTab] = useState('general')

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Add Subject</h1>
          <p className='text-muted-foreground'>Create a new subject curriculum.</p>
        </div>

        <div className='flex w-full flex-col gap-6'>
          {/* 2. Consistent Shadcn Tabs Navigation */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
              <TabsTrigger value="general">General Details</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="media">Cover Image</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 3. Consistent Content Container (White box with border, no internal Card) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
            <SubjectsProvider>
              {/* Pass the activeTab state down so the form knows what to display */}
              <SubjectMutateForm activeTab={activeTab} />
            </SubjectsProvider>
          </div>
        </div>
      </Main>
    </>
  )
}