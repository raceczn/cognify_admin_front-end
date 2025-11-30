'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, Eye, FileText, HelpCircle, ClipboardList, Loader2, BookOpen } from 'lucide-react'
import { useVerificationQueue, useVerifyItem, useRejectItem } from '@/lib/admin-hooks'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useSearch, useNavigate } from '@tanstack/react-router'

export default function VerificationPage() {
  const { data: queue, isLoading } = useVerificationQueue()
  const search = useSearch({ from: '/_authenticated/admin/verification' }) as { type?: string }
  const navigate = useNavigate({ from: '/admin/verification' })
  
  const verifyMutation = useVerifyItem()
  const rejectMutation = useRejectItem()
  
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filterType = search?.type
  
  // Logic is correct here
  const filteredQueue = queue?.filter(item => {
    if (!filterType || filterType === 'all') return true 
    return item.type === filterType
  })

  const handleVerify = async (id: string, type: string) => {
    setProcessingId(id)
    try {
      await verifyMutation.mutateAsync({ id, type })
      toast.success('Item verified successfully')
    } catch (err) {
      toast.error('Failed to verify item')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string, type: string) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return

    setProcessingId(id)
    try {
      await rejectMutation.mutateAsync({ id, type, reason })
      toast.success('Item rejected')
    } catch (err) {
      toast.error('Failed to reject item')
    } finally {
      setProcessingId(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return <FileText className="h-4 w-4 text-blue-500" />
      case 'assessment': return <ClipboardList className="h-4 w-4 text-purple-500" />
      case 'subject': return <BookOpen className="h-4 w-4 text-green-500" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  return (
    <>
      <Header>
        <div className="flex items-center gap-4 ml-auto">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      
      <Main>
        <div className="mb-6">
            <h1 className='text-2xl font-bold tracking-tight'>Pending Approvals</h1>
            <p className='text-muted-foreground'>
                Review content submitted by faculty members.
            </p>
        </div>

        <Tabs 
          defaultValue="all" 
          value={filterType || 'all'}
          onValueChange={(val) => navigate({ search: (prev) => ({ ...prev, type: val === 'all' ? undefined : val }) })}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="all">All Pending</TabsTrigger>
            <TabsTrigger value="module">Modules</TabsTrigger>
            <TabsTrigger value="subject">Subjects</TabsTrigger>
            <TabsTrigger value="assessment">Assessments</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>{filteredQueue?.length || 0} items waiting...</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading queue...</p>
              </div>
            ) : !filteredQueue || filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                <Check className="h-10 w-10 mb-2 text-green-500 opacity-50" />
                <p>No pending items found for this filter.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead>Title & Details</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {/* [FIX] Use filteredQueue instead of queue here */}
                    {filteredQueue.map((item) => (
                        <TableRow key={item.item_id}>
                        <TableCell>
                            <div className="flex items-center gap-2 font-medium capitalize">
                            {getTypeIcon(item.type)}
                            {item.type}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                            <span className="font-semibold">{item.title}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {item.details}
                            </span>
                            </div>
                        </TableCell>
                        <TableCell>{item.submitted_by}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(item.submitted_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                disabled={processingId === item.item_id}
                                onClick={() => handleVerify(item.item_id, item.type)}
                            >
                                <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                disabled={processingId === item.item_id}
                                onClick={() => handleReject(item.item_id, item.type)}
                            >
                                <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            </div>
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