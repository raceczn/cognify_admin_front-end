import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useAssessmentsQuery } from '@/lib/assessment-hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { assessmentsColumns } from './components/assessments-columns'
import { AssessmentsDataTable } from './components/assessments-table'

export function Assessments() {
  const navigate = useNavigate()
  const { data: assessments = [] } = useAssessmentsQuery()

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Assessments</h2>
            <p className='text-muted-foreground'>
              Create and manage quizzes and exams.
            </p>
          </div>
          <Button
            className='space-x-1'
            onClick={() => navigate({ to: '/assessments/new' })}
          >
            <span>Create Assessment</span>
            <Plus size={18} />
          </Button>
        </div>

        <Tabs defaultValue='manage' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='manage'>Manage</TabsTrigger>
          </TabsList>
          <TabsContent value='manage'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
              <AssessmentsDataTable
                data={assessments}
                columns={assessmentsColumns}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
