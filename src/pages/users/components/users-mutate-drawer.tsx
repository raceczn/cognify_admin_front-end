'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createProfile,
  updateProfile,
  // getAllProfiles,
} from '@/lib/profile-hooks'
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

type UserMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User
  onSuccess?: () => void // callback to refresh parent data
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

export function UsersMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: UserMutateDrawerProps) {
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          first_name: '',
          last_name: '',
          username: '',
          nickname: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          isEdit,
        },
  })
  const onSubmit = async (data: UserForm) => {
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        nickname: data.nickname,
        email: data.email,
        role_id: data.role, // assuming role holds the role_id
        user_id: currentRow?.id, // required by backend for PUT/POST
      }

      if (isEdit && currentRow?.id) {
        // UPDATE
        await updateProfile(currentRow.id, payload)
        alert('User updated successfully!')
      } else {
        // CREATE
        await createProfile(payload)
        alert('User created successfully!')
      }

      // Optional: Refresh list if your table supports reloading
      // await getAllProfiles()

      form.reset()
      onOpenChange(false)
    } catch (err: any) {
      console.error('Error saving user:', err)
      alert(err.response?.data?.detail || 'Failed to save user')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
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
                <FormItem className='flex items-center space-x-2'>
                  <FormLabel className='shrink-0'>Role</FormLabel>
                  <FormControl className='flex-1'>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a role'
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
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
