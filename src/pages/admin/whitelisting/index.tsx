'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, UploadCloud, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useWhitelist, useAddWhitelist, useRemoveWhitelist } from '@/lib/admin-hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

const formSchema = z.object({
  email: z.string().email('Invalid email address').refine(
    (e) => e.endsWith('@cvsu.edu.ph'),
    'Must be a @cvsu.edu.ph email'
  ),
  role: z.enum(['student', 'faculty_member', 'admin']),
})

export default function WhitelistingPage() {
  const { data: whitelist, isLoading } = useWhitelist()
  const addMutation = useAddWhitelist()
  const removeMutation = useRemoveWhitelist()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'student',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addMutation.mutateAsync(values)
      toast.success(`Added ${values.email} to whitelist`)
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add user')
    }
  }

  const handleRemove = async (email: string) => {
    try {
      await removeMutation.mutateAsync(email)
      toast.success('Removed from whitelist')
    } catch (error) {
      toast.error('Failed to remove user')
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
          <h1 className='text-2xl font-bold tracking-tight'>User Whitelisting</h1>
          <p className='text-muted-foreground'>
            Pre-register authorized emails. Users can only sign up if their email is listed here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: Manual Add */}
          <Card>
            <CardHeader>
              <CardTitle>Add Single User</CardTitle>
              <CardDescription>Manually approve an email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="email@cvsu.edu.ph" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="faculty_member">Faculty Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={addMutation.isPending}>
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* RIGHT: Bulk Upload (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload</CardTitle>
              <CardDescription>Upload a CSV file containing emails and roles.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center border-2 border-dashed rounded-md h-[130px] bg-muted/10">
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">Drag and drop CSV or click to browse</p>
              <Button variant="outline" size="sm" disabled>
                Upload CSV (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* BOTTOM: List */}
        <Card>
          <CardHeader>
            <CardTitle>Whitelisted Users</CardTitle>
            <CardDescription>
              Users currently allowed to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelist?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="capitalize">
                        {/* [FIX] Safe access: Fallback to 'Unknown' if role is missing */}
                        {(user.assigned_role || 'unknown').replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {user.is_registered ? (
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Registered
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200 gap-1">
                            <XCircle className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.is_registered && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemove(user.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {whitelist?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No users whitelisted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}