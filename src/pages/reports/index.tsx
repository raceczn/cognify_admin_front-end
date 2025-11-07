// src/pages/reports/index.tsx
import { useState, useEffect, Fragment } from 'react'
import {
  ArrowLeft,
  MessagesSquare,
  Search as SearchIcon,
  Send,
  Loader2,
  Brain,
  Bell,
  Trash2,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  getMotivation,
  setCustomMotivation,
  sendReminder,
  clearCustomMotivation,
  useMotivation,
} from '@/lib/utilities-hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
// --- 1. Import real user types and hooks ---
import { type User } from '@/pages/users/data/schema'
import { useUsers } from '@/pages/users/components/users-provider'
import { roles } from '@/pages/users/data/data'
// --- 2. Remove fake data imports ---
// import { type ChatUser } from './data/chat-types'
// import { conversations } from './data/convo.json'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function Reports() {
  const [search, setSearch] = useState('')
  // --- 3. Use the real User type ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [mobileSelectedUser, setMobileSelectedUser] = useState<User | null>(
    null
  )

  // --- 4. Get real users from the hook ---
  const { users, isLoading: isLoadingUsers } = useUsers()

  // --- 5. Filter real users (and only show students) ---
  const studentRoleId = roles.find((r) => r.designation === 'student')?.value
  const filteredChatList = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase()
    const email = user.email.toLowerCase()
    const term = search.trim().toLowerCase()
    const isStudent = user.role_id === studentRoleId

    return (
      isStudent && (fullName.includes(term) || email.includes(term))
    )
  })

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side (Student List) */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Feedback</h1>
                  <MessagesSquare size={20} />
                </div>
              </div>

              <label
                className={cn(
                  'focus-within:ring-ring focus-within:ring-1 focus-within:outline-hidden',
                  'border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2'
                )}
              >
                <SearchIcon size={15} className='me-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search student...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className='-mx-3 h-full overflow-scroll p-3'>
              {/* --- 6. Add loading state --- */}
              {isLoadingUsers ? (
                <div className='space-y-2'>
                  <Skeleton className='h-12 w-full' />
                  <Skeleton className='h-12 w-full' />
                  <Skeleton className='h-12 w-full' />
                </div>
              ) : (
                filteredChatList.map((user) => {
                  // --- 7. Use real user data ---
                  const fullName =
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                    user.email
                  const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || '?'

                  return (
                    <Fragment key={user.id}>
                      <button
                        type='button'
                        className={cn(
                          'group hover:bg-accent hover:text-accent-foreground',
                          `flex w-full rounded-md px-2 py-2 text-start text-sm`,
                          selectedUser?.id === user.id && 'sm:bg-muted'
                        )}
                        onClick={() => {
                          setSelectedUser(user)
                          setMobileSelectedUser(user)
                        }}
                      >
                        <div className='flex gap-2'>
                          <Avatar>
                            {/* Using a static avatar for now */}
                            <AvatarImage
                              src={`/avatars/${(user.id.charCodeAt(5) % 5) + 1}.png`}
                              alt={fullName}
                            />
                            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className='col-start-2 row-span-2 font-medium'>
                              {fullName}
                            </span>
                            <span className='text-muted-foreground group-hover:text-accent-foreground/90 col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis'>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Right Side (Feedback Panel) */}
          {selectedUser ? (
            <div
              className={cn(
                'bg-background absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
                mobileSelectedUser && 'start-0 flex'
              )}
            >
              {/* Top Part */}
              <div className='bg-card mb-1 flex flex-none justify-between p-4 shadow-lg sm:rounded-t-md'>
                {/* Left */}
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ms-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedUser(null)}
                  >
                    <ArrowLeft className='rtl:rotate-180' />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    <Avatar className='size-9 lg:size-11'>
                       <AvatarImage
                         src={`/avatars/${(selectedUser.id.charCodeAt(5) % 5) + 1}.png`}
                         alt={selectedUser.email}
                       />
                      <AvatarFallback>{(selectedUser.first_name?.[0] || '') + (selectedUser.last_name?.[0] || '') || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                        {`${selectedUser.first_name || ''} ${
                          selectedUser.last_name || ''
                        }`.trim() || selectedUser.email}
                      </span>
                      <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis lg:max-w-none lg:text-sm'>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <ScrollArea className='flex-1'>
                <div className='p-4'>
                  {/* This now receives a REAL student ID, fixing the 500 error */}
                  <FeedbackForm studentId={selectedUser.id} />
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div
              className={cn(
                'bg-card absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:static sm:z-auto sm:flex'
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <MessagesSquare className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Select a student</h1>
                  <p className='text-muted-foreground text-sm'>
                    Select a student from the list to send feedback or a
                    reminder.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </Main>
    </>
  )
}

// --- FeedbackForm component remains unchanged from the previous fix ---
// ... (rest of the file is the same) ...
function FeedbackForm({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient()
  const [motivationText, setMotivationText] = useState('')
  const [reminderTitle, setReminderTitle] = useState('Study Reminder!')
  const [reminderBody, setReminderBody] = useState(
    "Don't forget to complete your review session for today."
  )

  // Fetch the student's current motivation
  const {
    data: motivation,
    isLoading: isLoadingMotivation,
  } = useMotivation(studentId)

  // Update text area when motivation data loads
  useEffect(() => {
    // Only update if motivation text exists, otherwise keep user's draft
    if (motivation?.quote) {
      setMotivationText(motivation.quote)
    }
  }, [motivation])

  // Mutation for setting custom motivation
  const {
    mutate: setMotivation,
    isPending: isSettingMotivation,
  } = useMutation({
    mutationFn: () =>
      setCustomMotivation(studentId, motivationText, 'Your Faculty Advisor'),
    onSuccess: () => {
      toast.success('Custom motivation sent!')
      queryClient.invalidateQueries({ queryKey: ['motivation', studentId] })
    },
    onError: () => {
      toast.error('Failed to send motivation.')
    },
  })

  // Mutation for clearing custom motivation
  const {
    mutate: clearMotivation,
    isPending: isClearingMotivation,
  } = useMutation({
    mutationFn: () => clearCustomMotivation(studentId),
    onSuccess: (data) => {
      toast.success('Custom motivation cleared.')
      setMotivationText('') // Clear text area
      queryClient.invalidateQueries({ queryKey: ['motivation', studentId] })
    },
    onError: () => {
      toast.error('Failed to clear motivation.')
    },
  })

  // Mutation for sending a reminder
  const {
    mutate: sendStudyReminder,
    isPending: isSendingReminder,
  } = useMutation({
    mutationFn: () => sendReminder(studentId, reminderTitle, reminderBody),
    onSuccess: () => {
      toast.success('Study reminder sent!')
    },
    onError: () => {
      toast.error('Failed to send reminder. Does the user have a device token?')
    },
  })

  const isWorking =
    isSettingMotivation || isSendingReminder || isClearingMotivation

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain size={18} /> Custom Motivation
          </CardTitle>
          <CardDescription>
            Override the student's daily AI motivation with a custom message.
            This will be shown on their dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <Label htmlFor='motivation-text'>Motivational Message</Label>
          {isLoadingMotivation ? (
            <Loader2 className='animate-spin' />
          ) : (
            <Textarea
              id='motivation-text'
              placeholder='Enter a custom quote...'
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              rows={3}
            />
          )}
          <p className='text-xs text-muted-foreground'>
            Current Author:{' '}
            <strong>{motivation?.author || 'Not Set'}</strong>
          </p>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='ghost'
            size='icon'
            title='Clear custom motivation'
            onClick={() => clearMotivation()}
            disabled={isWorking}
          >
            <Trash2 className='h-4 w-4 text-red-500' />
          </Button>
          <Button
            onClick={() => setMotivation()}
            disabled={!motivationText || isWorking}
          >
            {isSettingMotivation ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Send size={16} />
            )}
            Send Motivation
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell size={18} /> Push Notification Reminder
          </CardTitle>
          <CardDescription>
            Send a one-time study reminder directly to the student's mobile
            device.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='reminder-title'>Title</Label>
            <Input
              id='reminder-title'
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='reminder-body'>Body</Label>
            <Textarea
              id='reminder-body'
              value={reminderBody}
              onChange={(e) => setReminderBody(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className='flex justify-end'>
          <Button
            onClick={() => sendStudyReminder()}
            disabled={!reminderTitle || !reminderBody || isWorking}
          >
            {isSendingReminder ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Send size={16} />
            )}
            Send Reminder
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}