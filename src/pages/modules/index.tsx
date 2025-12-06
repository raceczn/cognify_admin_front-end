import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Library, Table as TableIcon, Loader2, Plus } from 'lucide-react'
import { ModulesProvider, useModules } from './components/modules-provider'
import { ModulesDialogs } from './components/modules-dialogs'
import { ModulesDataTable } from './components/modules-table'
import { columns } from './components/modules-columns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Module } from './data/schema'
import { useNavigate } from '@tanstack/react-router'

// The page content is placed inside a wrapper component
function ModulesPageContent() {
  const navigate = useNavigate()
  const {
    modules,
    isLoading,
    setCurrentRow,
    setOpen,
    subjects,
  } = useModules()

  const verifiedModules = modules.filter((m) => m.is_verified)

  // [FIX] Updated to navigate to the Edit Route
  const handleEditModule = (module: Module) => {
    navigate({ to: '/modules/$moduleId/edit', params: { moduleId: module.id } })
  }

  // [NOTE] Delete still uses the dialog, which is correct
  const handleDeleteModule = (module: Module) => {
    setCurrentRow(module)
    setOpen('delete')
  }

  const getSubjectTitle = (id: string) => subjects.find((s) => s.id === id)?.title || id
  const moduleColumns = columns(handleEditModule, handleDeleteModule, getSubjectTitle)

  const subjectBadgeColor = (title: string) => {
    const palette = [
      'bg-blue-500/10 text-blue-600',
      'bg-green-500/10 text-green-600',
      'bg-amber-500/10 text-amber-600',
      'bg-violet-500/10 text-violet-600',
      'bg-rose-500/10 text-rose-600',
      'bg-cyan-500/10 text-cyan-600',
      'bg-fuchsia-500/10 text-fuchsia-600',
    ]
    const hash = Array.from(title).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return palette[hash % palette.length]
  }

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
              Manage learning materials, lectures, and resource files.
            </p>
          </div>
          {/* [FIX] Replaced Component with Direct Navigation Button */}
          <Button onClick={() => navigate({ to: '/modules/new' })}>
            <Plus className='mr-2 h-4 w-4' /> Add Module
          </Button>
        </div>

        <Tabs defaultValue='manage' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='browse' className='gap-2'>
              <Library size={16} /> Browse
            </TabsTrigger>
            <TabsTrigger value='manage' className='gap-2'>
              <TableIcon size={16} /> Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value='browse'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 '>
              {verifiedModules.map((m) => (
                <Card 
                  key={m.id} 
                  className='hover:shadow-md transition-shadow cursor-pointer'
                  onClick={() => handleEditModule(m)} // Also navigate on card click
                >
                  <CardContent className='p-6'>
                    <h3 className='font-semibold text-lg mb-1'>{m.title}</h3>
                    {(() => {
                      const title = getSubjectTitle(m.subject_id)
                      const color = subjectBadgeColor(title)
                      return (
                        <div className='mb-2'>
                          <Badge variant='outline' className={cn('text-xs uppercase', color)}>
                            {title}
                          </Badge>
                        </div>
                      )
                    })()}
                    <p className='text-xs text-muted-foreground uppercase tracking-wider mb-4'>
                      {m.bloom_level ? `Bloom: ${m.bloom_level}` : 'Unspecified Bloom'}
                    </p>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {m.purpose || 'No description available.'}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {verifiedModules.length === 0 && (
                <div className='col-span-full py-12 text-center text-muted-foreground'>
                  No verified modules available.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='manage'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
              {isLoading ? (
                <div className='flex items-center justify-center py-10'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <ModulesDataTable data={modules} columns={moduleColumns} subjectOptions={subjects} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <ModulesDialogs />
    </>
  )
}

// Export the main component wrapped in the Provider
export default function ModulesPage() {
    return (
        <ModulesProvider> 
            <ModulesPageContent />
        </ModulesProvider>
    )
}