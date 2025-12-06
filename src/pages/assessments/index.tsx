import { useQuery } from '@tanstack/react-query'
import { getAllSubjects } from '@/lib/subjects-hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { assessmentsColumns } from './components/assessments-columns'
import { AssessmentsDialogs } from './components/assessments-dialogs'
import { AssessmentsPrimaryButtons } from './components/assessments-primary-buttons'
import {
  AssessmentsProvider,
  useAssessments,
} from './components/assessments-provider'
import { AssessmentsDataTable } from './components/assessments-table'

export default function Assessments() {
  return (
    <AssessmentsProvider>
      <AssessmentsPageContent />
    </AssessmentsProvider>
  )
}

function AssessmentsPageContent() {
  const { assessments } = useAssessments()

  // Fetch subjects to map "subject_id" to "Subject Title" in the table
  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects:list'],
    queryFn: getAllSubjects,
  })

  const subjectOptions = subjectsRes?.items ?? []
  const getSubjectTitle = (id: string) =>
    subjectOptions.find((s) => s.id === id)?.title || id

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
          <AssessmentsPrimaryButtons />
        </div>

        <Tabs defaultValue='manage' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='manage'>Manage</TabsTrigger>
          </TabsList>
          <TabsContent value='manage'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
              <AssessmentsDataTable
                data={assessments}
                columns={assessmentsColumns(getSubjectTitle)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <AssessmentsDialogs />
    </>
  )
}
