'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProfile, updateProfile } from '@/lib/profile-hooks'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'
import { useEffect } from 'react'

type UserMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User
  onSuccess?: () => void
}

const formSchema = z
  .object({
    first_name: z.string().min(1, 'First Name is required.'),
    last_name: z.string().min(1, 'Last Name is required.'),
    username: z.string().min(1, 'Username is required.'),
    nickname: z.string().min(1, 'Nickname is required.'),
    email: z.string().email('Invalid email'),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, 'Role is required.'),
    isEdit: z.boolean(),
  })
  .refine(
    ({ isEdit, password }) =>
      isEdit && !password ? true : password.length >= 8,
    { message: 'Password must be at least 8 characters', path: ['password'] }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) =>
      isEdit && !password ? true : password === confirmPassword,
    { message: "Passwords don't match", path: ['confirmPassword'] }
  )

type UserForm = z.infer<typeof formSchema>

// ✅ Helper function to capitalize names
function capitalizeName(name: string | undefined) {
  if (!name) return ''
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function normalizeField(name: string | undefined) {
  if (!name || name.trim() === '') return ''
  return capitalizeName(name)
}

function middleInitial(name: string | undefined) {
  if (!name || name.trim() === '') return ''
  return name.trim().charAt(0).toUpperCase() + '.'
}

export function UsersMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UserMutateDrawerProps) {
  const isEdit = !!currentRow
  const { toast } = useToast()
  const { updateLocalUsers } = useUsers()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      isEdit: false,
    },
  })

  // ✅ Reset form when currentRow changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          first_name: currentRow.first_name,
          last_name: currentRow.last_name,
          username: currentRow.username,
          nickname: currentRow.nickname,
          email: currentRow.email,
          password: '',
          confirmPassword: '',
          role: currentRow.role_id, // ✅ Use role_id instead of role
          isEdit: true,
        })
      } else {
        form.reset({
          first_name: '',
          last_name: '',
          username: '',
          nickname: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          isEdit: false,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (data: UserForm) => {
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        nickname: data.nickname,
        email: data.email,
        role_id: data.role,
        user_id: currentRow?.id,
      }

      if (isEdit && currentRow?.id) {
        // ✅ UPDATE: Get response from API
        const response = await updateProfile(currentRow.id, payload)

        // ✅ Transform response to match User schema
        const updatedUser: User = {
          id: response.id ?? currentRow.id,
          first_name: normalizeField(response.first_name),
          middle_name: middleInitial(response.middle_name),
          last_name: normalizeField(response.last_name),
          nickname: normalizeField(response.nickname),
          username: response.username ?? currentRow.username,
          email: response.email ?? currentRow.email,
          role: response.role ?? currentRow.role,
          role_id: response.role_id ?? currentRow.role_id ?? '',
          status: response.status ?? currentRow.status ?? 'active',
          created_at: response.created_at
            ? new Date(response.created_at)
            : (currentRow.created_at ?? new Date()),
        }

        // ✅ Update local state immediately
        updateLocalUsers(updatedUser, 'edit')

        toast({
          title: '✅ User Updated',
          description: `${data.first_name} ${data.last_name} has been updated successfully.`,
          variant: 'success',
        })
      } else {
        // ✅ CREATE: Get response from API
        const response = await createProfile(payload)

        // ✅ Transform response to match User schema
        const newUser: User = {
          id: response.id ?? response.user_id ?? 'N/A',
          first_name: normalizeField(response.first_name),
          middle_name: middleInitial(response.middle_name),
          last_name: normalizeField(response.last_name),
          nickname: normalizeField(response.nickname),
          username: response.username ?? data.username,
          email: response.email ?? data.email,
          role: response.role ?? data.role,
          role_id: response.role_id ?? data.role ?? '',
          status: response.status ?? 'active',
          created_at: response.created_at
            ? new Date(response.created_at)
            : new Date(),
        }

        // ✅ Add to local state immediately
        updateLocalUsers(newUser, 'add')

        toast({
          title: '🎉 User Created',
          description: `${data.first_name} ${data.last_name} has been added successfully.`,
          variant: 'success',
        })
      }

      // Reset form and close sheet
      form.reset()
      onOpenChange(false)

      // ✅ Optional: Trigger parent refresh as backup
      onSuccess?.()
    } catch (err: any) {
      console.error('Error saving user:', err)
      toast({
        title: '❌ Failed to Save',
        description: err.response?.data?.detail || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isEdit ? 'Edit User' : 'Add New User'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the user by providing necessary info.'
              : 'Add a new user by providing necessary info.'}{' '}
            Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='user-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Your first name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='last_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Your last name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='Your username' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nickname'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder='Your nickname' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Your email address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a role'
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                      isControlled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='Enter password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='Confirm password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <Button form='user-form' type='submit'>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}