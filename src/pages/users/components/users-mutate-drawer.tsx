'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createProfile, updateProfile } from '@/lib/profile-hooks'
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

type UserMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User
  onSuccess?: () => void
}

const formSchema = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    nickname: z.string().optional(),
    user_name: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email'),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    role_id: z.string().min(1, 'Role is required.'),
    isEdit: z.boolean(),
  })
  .refine(
    ({ isEdit, password }) =>
      isEdit && !password ? true : password.length >= 8,
    {
      message: 'Password must be at least 8 characters',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) =>
      isEdit && !password ? true : password === confirmPassword,
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  )

type UserForm = z.infer<typeof formSchema>

export function UsersMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UserMutateDrawerProps) {
  const isEdit = !!currentRow
  const { updateLocalUsers } = useUsers()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      nickname: '',
      user_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role_id: '',
      isEdit: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        // [FIX] Map current role correctly to the dropdown value
        const roleValue = roles.find(r => r.value === currentRow.role_id)?.value || currentRow.role_id || currentRow.role_id
        
        form.reset({
          first_name: currentRow.first_name || '',
          last_name: currentRow.last_name || '',
          nickname: currentRow.nickname || '',
          user_name: currentRow.user_name || '',
          email: currentRow.email,
          password: '',
          confirmPassword: '',
          role_id: roleValue,
          isEdit: true,
        })
      } else {
        form.reset({
          first_name: '',
          last_name: '',
          nickname: '',
          user_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role_id: '',
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
        nickname: data.nickname,
        user_name: data.user_name,
        email: data.email,
        password: data.password,
        role_id: data.role_id,
      }

      if (isEdit && currentRow?.id) {
        // UPDATE
        const updatePayload = { ...payload }
        delete (updatePayload as any).password

        const response = await updateProfile(currentRow.id, updatePayload)

        const updatedUser: User = {
          ...currentRow,
          ...response,
          role_id: response.role_id || currentRow.role_id,
          is_verified: !!response.is_verified,
          is_active: response.is_active ?? currentRow.is_active ?? true,
          created_at: new Date(response.created_at || currentRow.created_at),
          updated_at: response.updated_at ? new Date(response.updated_at) : new Date(),
          deleted_at:
            typeof (response as any)?.deleted_at === 'string'
              ? new Date((response as any).deleted_at)
              : (response as any)?.deleted_at ?? currentRow.deleted_at ?? null,
        }

        updateLocalUsers(updatedUser, 'edit')
        toast.success(
          `User ${updatedUser.first_name} ${updatedUser.last_name} has been updated.`
        )
      } else {
        // CREATE
        const response = await createProfile(payload)

        // [FIX] Use response.role directly
        const newUser: User = {
          id: response.id,
          first_name: response.first_name || '',
          middle_name: response.middle_name || null,
          last_name: response.last_name || '',
          nickname: response.nickname || '',
          user_name: response.user_name || '',
          email: response.email,
          role_id: response.role_id,
          role: response.role || 'unknown',
          status: 'offline',
          created_at: new Date(response.created_at),
          is_verified: !!response.is_verified,
          is_active: response.is_active ?? true,
          deleted: false,
          deleted_at: null,
        }

        updateLocalUsers(newUser, 'add')
        toast.success(
          `User ${newUser.first_name} ${newUser.last_name} has been created.`
        )
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      console.error('Error saving user:', err)
      toast.error(err.response?.data?.detail || 'Something went wrong.')
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
      <SheetContent className='flex flex-col gap-6 sm:max-w-md'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isEdit ? 'Edit User' : 'Add New User'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the user by providing necessary info.'
              : 'Add a new user by providing necessary info.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-4'
          >
            <div className='flex-1 space-y-4 overflow-y-auto px-1'>
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter first name' {...field} />
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
                      <Input placeholder='Enter last name' {...field} />
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
                      <Input placeholder='Enter nickname' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='user_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter username' {...field} />
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
                      <Input
                        type='email'
                        placeholder='Enter email address'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role_id'
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
                          <PasswordInput placeholder='••••••••' {...field} />
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
                          <PasswordInput placeholder='••••••••' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <SheetFooter className='gap-2 pt-4'>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
                className='flex-1'
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : isEdit ? (
                  'Save Changes'
                ) : (
                  'Create User'
                )}
              </Button>
              <SheetClose asChild>
                <Button type='button' variant='outline' className='flex-1'>
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
