import { z } from 'zod'
import { format } from 'date-fns'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Eye,
  FileText,
  HelpCircle,
  ClipboardList,
  Loader2,
  BookOpen,
  Ban,
} from 'lucide-react'
import { useVerificationQueue } from '@/lib/admin-hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

const searchSchema = z.object({
  type: z.enum(['module', 'assessment', 'question', 'subject']).optional(),
})

export const Route = createFileRoute('/_authenticated/admin/verification')({
  component: VerificationPage,
  // [FIX] Return result.data so 'search' is strongly typed
  validateSearch: (search) => {
    const result = searchSchema.safeParse(search)
    return result.success ? result.data : {}
  },
})

function VerificationPage() {
  const { data: queue, isLoading } = useVerificationQueue()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const filterType = search?.type

  const filteredQueue =
    queue?.filter((item) => {
      if (!filterType) return true
      return item.type === filterType
    }) || []

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module':
        return <FileText className='h-4 w-4 text-blue-500' />
      case 'question':
        return <HelpCircle className='h-4 w-4 text-orange-500' />
      case 'assessment':
        return <ClipboardList className='h-4 w-4 text-purple-500' />
      case 'subject':
        return <BookOpen className='h-4 w-4 text-green-500' />
      default:
        return <Eye className='h-4 w-4' />
    }
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Pending Approvals
          </h1>
          <p className='text-muted-foreground'>
            Review content submitted by faculty members. Click "Review" to edit
            and verify.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Verification Queue</CardTitle>
              {filterType && (
                <Badge variant='secondary' className='capitalize'>
                  Filtering by: {filterType}s
                </Badge>
              )}
            </div>
            <CardDescription>
              {filteredQueue.length} items waiting...
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-10'>
                <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                <p>Loading queue...</p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className='text-muted-foreground bg-muted/10 flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
                {filterType ? (
                  <>
                    <Ban className='text-muted-foreground mb-2 h-10 w-10 opacity-50' />
                    <p>No pending {filterType}s found.</p>
                  </>
                ) : (
                  <p>All caught up! No pending items.</p>
                )}
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader className='bg-[#dcf1ec] dark:bg-[#FDCFFA]/10'>
                    <TableRow>
                      <TableHead className='w-[120px]'>Type</TableHead>
                      <TableHead>Title & Details</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell>
                          <div className='flex items-center gap-2 font-medium capitalize'>
                            {getTypeIcon(item.type)}
                            {item.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-semibold'>{item.title}</span>
                            <span className='text-muted-foreground max-w-[300px] truncate text-xs'>
                              {item.details}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span>{item.submitted_by}</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {format(new Date(item.submitted_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            variant='secondary'
                            onClick={() =>
                              navigate({
                                // [NOTE] This route string will become valid once the file above is saved
                                to: `/admin/review/$type/$itemId`,
                                params: {
                                  type: item.type,
                                  itemId: item.item_id,
                                },
                              })
                            }
                          >
                            <Eye className='mr-2 h-4 w-4' /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
