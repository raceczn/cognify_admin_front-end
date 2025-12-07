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
import { AssessmentsProvider, useAssessments } from './components/assessments-provider'
import { AssessmentsDataTable } from './components/assessments-table'
import { Library, Table as TableIcon, BadgeCheck } from 'lucide-react' 
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function Assessments() {
  return (
    <AssessmentsProvider>
      <AssessmentsPageContent />
    </AssessmentsProvider>
  )
}

function AssessmentsPageContent() {
  const { assessments } = useAssessments()

  const verifiedAssessments = assessments.filter(a => a.is_verified)

  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects:list'],
    queryFn: getAllSubjects,
  })

  const subjectOptions = subjectsRes?.items ?? []
  const getSubjectTitle = (id: string) =>
    subjectOptions.find((s) => s.id === id)?.title || id

  const getTypeColor = (type: string) => {
      const val = (type || '').toLowerCase()
      if (val === 'pre-assessment') return 'bg-amber-500/10 text-amber-600 border-amber-200'
      if (val === 'quiz') return 'bg-blue-500/10 text-blue-600 border-blue-200'
      if (val === 'post-assessment') return 'bg-green-500/10 text-green-600 border-green-200'
      if (val === 'diagnostic') return 'bg-rose-500/10 text-rose-600 border-rose-200'
      return 'bg-gray-500/10 text-gray-600'
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
            <h2 className='text-2xl font-bold tracking-tight'>Assessments</h2>
            <p className='text-muted-foreground'>
              Create and manage quizzes and exams.
            </p>
          </div>
          <AssessmentsPrimaryButtons />
        </div>

        <Tabs defaultValue='browse' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='browse' className='gap-2'>
                <Library size={16} /> Browse
            </TabsTrigger>
            <TabsTrigger value='manage' className="gap-2">
                <TableIcon size={16} /> Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value='browse'>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedAssessments.map(a => (
                    <Card key={a.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <h3 className="font-bold text-lg line-clamp-1 flex items-center gap-1.5" title={a.title}>
                                    {a.title}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          {/* Verified Badge: Green Check Only */}
                                          <BadgeCheck className="h-5 w-5 text-emerald-500 fill-emerald-50 flex-shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent>Verified Assessment</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                </h3>
                                <Badge variant="outline" className={cn("text-[10px] uppercase shrink-0 font-semibold", getTypeColor(a.type || "red"))}>
                                    {a.type}
                                </Badge>
                            </div>
                            
                            <div className="mb-4">
                                <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-700 hover:bg-slate-200">
                                    {getSubjectTitle(a.subject_id)}
                                </Badge>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-gray-100">
                                <span className="font-medium">{a.questions?.length || 0} Questions</span>
                                {a.bloom_levels && a.bloom_levels.length > 0 && (
                                    <span className="capitalize">{a.bloom_levels[0]} {a.bloom_levels.length > 1 && `+${a.bloom_levels.length - 1}`}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {verifiedAssessments.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No verified assessments available.
                    </div>
                )}
             </div>
          </TabsContent>

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