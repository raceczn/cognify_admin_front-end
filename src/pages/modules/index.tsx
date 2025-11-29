import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ModulesProvider, useModules } from './components/modules-provider'
import { ModulesDialogs } from './components/modules-dialogs'
// [FIX] Ensure this file exists (Step 1)
import { ModulesPrimaryButtons } from './components/modules-primary-buttons' 
// [FIX] Ensure DataTable is exported (Step 3)
import { DataTable } from './components/modules-table' 
import { modulesColumns } from './components/modules-columns'
import { BookOpen, Table as TableIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ModulesPage() {
  return (
    <ModulesProvider>
      <ModulesPageContent />
    </ModulesProvider>
  )
}

function ModulesPageContent() {
  const { modules, isLoading } = useModules()

  // [FIX] Schema update (Step 2) makes is_verified valid
  const verifiedModules = modules.filter(m => m.is_verified)

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
            <h2 className='text-2xl font-bold tracking-tight'>Modules</h2>
            <p className='text-muted-foreground'>
              Manage and organize learning materials.
            </p>
          </div>
          <ModulesPrimaryButtons />
        </div>

        <Tabs defaultValue="manage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse" className="gap-2">
                <BookOpen size={16} /> Browse
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
                <TableIcon size={16} /> Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
             {/* BROWSE VIEW: Grid of Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedModules.length > 0 ? (
                    verifiedModules.map(m => (
                        <Card key={m.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-2">{m.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {m.purpose || 'No description provided.'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="capitalize bg-secondary px-2 py-1 rounded">
                                        {m.bloom_level || 'General'}
                                    </span>
                                    <span>PDF</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full h-40 flex items-center justify-center text-muted-foreground">
                        No verified modules available.
                    </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="manage">
            {/* MANAGE VIEW: Data Table */}
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
              <DataTable data={modules} columns={modulesColumns} />
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <ModulesDialogs />
    </> 
    // [FIX] Changed from </ModulesProvider> to </>
  )
}