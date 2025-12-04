'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, UploadCloud, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react' // Added Loader2
import { toast } from 'sonner'
// [FIX] Import the new hook
import { useWhitelist, useAddWhitelist, useRemoveWhitelist } from '@/lib/admin-hooks'
import { read, utils } from 'xlsx'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { roles } from '@/pages/users/data/data'

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
  const [roleFilter, setRoleFilter] = useState<string>('')
  
  // [FIX] Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isBulkUploading, setIsBulkUploading] = useState(false)

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
  
  function detectDelimiter(line: string) {
    const candidates = [',', ';', '\t']
    let best = ','
    let bestCount = -1
    for (const d of candidates) {
      const c = (line.match(new RegExp(`\\${d}`, 'g')) || []).length
      if (c > bestCount) {
        best = d
        bestCount = c
      }
    }
    return best
  }

  function parseLine(line: string, delimiter: string) {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === delimiter && !inQuotes) {
        out.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur)
    return out.map((p) => p.trim().replace(/^"|"$/g, ''))
  }

  function normalizeRole(input: string) {
    const r = input.toLowerCase().trim().replace(/\s+/g, '_')
    if (r === 'faculty' || r === 'faculty_member' || r === 'professor' || r === 'teacher' || r === 'faculty-members' || r === 'faculty_members') return 'faculty_member'
    if (r === 'admin' || r === 'administrator') return 'admin'
    if (r === 'student' || r === 'students') return 'student'
    return r
  }

  function isEmailCandidate(v: string) {
    const s = (v || '').toLowerCase().trim()
    return s.endsWith('@cvsu.edu.ph') && s.includes('@')
  }

  function findEmailRoleIndexes(rows: string[][], allowedRoles: Set<string>) {
    const sampleRows = rows.slice(0, Math.min(rows.length, 20))
    const width = sampleRows.reduce((m, r) => Math.max(m, r.length), 0)
    let emailIdx = -1
    let roleIdx = -1
    let emailScore = -1
    let roleScore = -1
    for (let c = 0; c < width; c++) {
      let eScore = 0
      let rScore = 0
      for (const r of sampleRows) {
        const cell = (r[c] || '').toString()
        if (isEmailCandidate(cell)) eScore++
        const norm = normalizeRole(cell)
        if (allowedRoles.has(norm)) rScore++
      }
      if (eScore > emailScore) {
        emailScore = eScore
        emailIdx = c
      }
      if (rScore > roleScore) {
        roleScore = rScore
        roleIdx = c
      }
    }
    if (emailIdx === -1) emailIdx = 0
    if (roleIdx === -1) roleIdx = 1
    return { emailIdx, roleIdx }
  }

  // Handle CSV Bulk Upload (client-side parsing)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const nameLc = file.name.toLowerCase()
    const isCSV = nameLc.endsWith('.csv') || file.type === 'text/csv'
    const isXLSX = nameLc.endsWith('.xlsx') || nameLc.endsWith('.xls') || file.type.includes('spreadsheet')
    if (!isCSV && !isXLSX) {
      toast.error('Please upload a CSV or Excel file.')
      return
    }

    setIsBulkUploading(true)
    const allowedRoles = new Set(['student', 'faculty_member', 'admin'])
    let added = 0
    let skipped = 0
    const errors: string[] = []

    try {
      const seen = new Set<string>()
      let rows: string[][] = []
      if (isCSV) {
        const textRaw = await file.text()
        const text = textRaw.replace(/^\uFEFF/, '')
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
        if (lines.length === 0) {
          toast.error('File is empty')
          return
        }
        const delimiter = detectDelimiter(lines[0])
        rows = lines.map((ln) => parseLine(ln, delimiter))
      } else {
        const buf = await file.arrayBuffer()
        const wb = read(buf, { type: 'array' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        const raw = utils.sheet_to_json(ws, { header: 1 }) as any[]
        rows = raw.map((r) => (Array.isArray(r) ? r : [r]).map((x) => String(x ?? '').trim()))
        if (rows.length === 0) {
          toast.error('File is empty')
          return
        }
      }

      const header = rows[0].map((c) => c.toLowerCase().trim())
      const headerEmailIdx = header.indexOf('email')
      const headerRoleIdx = header.indexOf('role')
      const hasHeader = headerEmailIdx !== -1 && headerRoleIdx !== -1
      const { emailIdx, roleIdx } = hasHeader
        ? { emailIdx: headerEmailIdx, roleIdx: headerRoleIdx }
        : findEmailRoleIndexes(rows, allowedRoles)
      const startIdx = hasHeader ? 1 : 0
      const existingPending = new Set(
        (whitelist || [])
          .filter((u: any) => !u.is_registered)
          .map((u: any) => String(u.email || '').toLowerCase())
      )
      const dupExisting: string[] = []
      const dupInFile: string[] = []

      for (let i = startIdx; i < rows.length; i++) {
        const parts = rows[i]
        const email = parts[emailIdx]?.trim()
        const roleRaw = parts[roleIdx]?.trim()
        const role = normalizeRole(roleRaw || '')

        if (!email || !role) {
          skipped++
          errors.push(`Row ${i + 1}: missing email or role`)
          continue
        }
        const emailLc = email.toLowerCase()
        if (existingPending.has(emailLc)) {
          skipped++
          dupExisting.push(email)
          continue
        }
        if (seen.has(emailLc)) {
          skipped++
          dupInFile.push(email)
          continue
        }
        if (!emailLc.endsWith('@cvsu.edu.ph')) {
          skipped++
          errors.push(`Row ${i + 1}: invalid domain`)
          continue
        }
        if (!allowedRoles.has(role)) {
          skipped++
          errors.push(`Row ${i + 1}: invalid role "${role}"`)
          continue
        }

        if (seen.has(emailLc)) {
          skipped++
          continue
        }
        seen.add(emailLc)

        try {
          await addMutation.mutateAsync({ email, role })
          added++
        } catch (err: any) {
          skipped++
          const detail = err?.response?.data?.detail
          errors.push(`Row ${i + 1}: ${detail || 'add failed'}`)
        }
      }

      toast.success(`Bulk upload complete! Added: ${added}, Skipped: ${skipped}`)
      if (dupExisting.length || dupInFile.length) {
        const examples = [...dupExisting, ...dupInFile].slice(0, 3).join(', ')
        const totalDup = dupExisting.length + dupInFile.length
        toast.error(`Duplicate emails not added (${totalDup}). Examples: ${examples}`)
      }
    } catch (err) {
      toast.error('Bulk upload failed.')
    } finally {
      setIsBulkUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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

          {/* RIGHT: Bulk Upload (IMPLEMENTED) */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload</CardTitle>
              <CardDescription>Upload a CSV or Excel file containing emails and roles.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center border-2 border-dashed rounded-md h-[130px] bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileUpload}
              />
              
              {isBulkUploading ? (
                 <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                 </div>
              ) : (
                 <>
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop CSV/Excel or click to browse</p>
                    <p className="text-xs text-muted-foreground font-mono">Format: email, role</p>
                 </>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* BOTTOM: List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Whitelisted Users</CardTitle>
                <CardDescription>Users currently allowed to register.</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    Role: {roles.find(r => r.value === roleFilter)?.label ?? 'All Roles'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem onClick={() => setRoleFilter('')}>All Roles</DropdownMenuItem>
                  {roles.map(r => (
                    <DropdownMenuItem key={r.value} onClick={() => setRoleFilter(r.value)}>
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : (
              <Table className='w-full border-1 border-[#c7c7c7] dark:border-[#FDCFFA]/10'>
                <TableHeader className='bg-[#fcd3d3] dark:bg-[#FDCFFA]/10'>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(whitelist
                    ?.filter((user: any) => !user.is_registered || user.status === 'pending')
                    ?.filter((user: any) => roleFilter === '' || user.assigned_role === roleFilter) || [])
                    .map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="capitalize">
                        {(user.assigned_role || 'unknown').replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {user.is_registered ? (
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Registered
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-700 bg-yellow-100 border-yellow-200 gap-1">
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
                  {(whitelist
                    ?.filter((user: any) => !user.is_registered || user.status === 'pending')
                    ?.filter((user: any) => roleFilter === '' || user.assigned_role === roleFilter) || [])
                    .length === 0 && (
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
