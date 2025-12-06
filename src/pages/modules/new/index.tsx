import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModuleMutateForm } from '../components/modules-mutate-drawer'
import { ModulesProvider } from '../components/modules-provider'

export default function ModulesNewPage() {
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
          <h1 className='text-2xl font-bold tracking-tight'>Add Module</h1>
          <p className='text-muted-foreground'>Create a new learning module.</p>
        </div>

        <div className='flex w-full flex-col gap-6'>
          
          {/* [FIX] Updated Grid Cols to 3 and Added View Trigger */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
              <TabsTrigger value="general">General Details</TabsTrigger>
              <TabsTrigger value="content">Content & Settings</TabsTrigger>
              <TabsTrigger value="view">View Material</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
            <ModulesProvider>
              <ModuleMutateForm activeTab={activeTab} />
            </ModulesProvider>
          </div>
        </div>
      </Main>
    </>
  )
}