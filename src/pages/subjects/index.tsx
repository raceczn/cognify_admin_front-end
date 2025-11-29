import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SubjectsProvider, useSubjects } from './components/subjects-provider'
import { SubjectsDialogs } from './components/subjects-dialogs'
import { SubjectsPrimaryButtons } from './components/subjects-primary-buttons'
import { DataTable } from './components/subjects-table' // [FIX] This import now works
import { subjectsColumns } from './components/subjects-columns'
import { Library, Table as TableIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SubjectsPage() {
  return (
    <SubjectsProvider>
      <SubjectsPageContent />
    </SubjectsProvider>
  )
}

function SubjectsPageContent() {
  const { subjects } = useSubjects()
  
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
            <h2 className='text-2xl font-bold tracking-tight'>Subjects</h2>
            <p className='text-muted-foreground'>
              Manage curriculum and core subjects.
            </p>
          </div>
          <SubjectsPrimaryButtons />
        </div>

        <Tabs defaultValue="manage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse" className="gap-2">
                <Library size={16} /> Browse
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
                <TableIcon size={16} /> Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(s => (
                    <Card key={s.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                                PQF Level {s.pqf_level}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {s.description || 'No description available.'}
                            </p>
                        </CardContent>
                    </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
              <DataTable data={subjects} columns={subjectsColumns} />
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <SubjectsDialogs />
    </>
  )
}