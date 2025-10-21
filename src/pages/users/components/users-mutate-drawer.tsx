'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

type UserMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User | null
  onSuccess?: () => void // optional callback to refresh list
}

// ✅ Schema validation
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
  onSuccess,
}: UserMutateDrawerProps) {
  const isEdit = !!currentRow

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: currentRow?.first_name ?? '',
      last_name: currentRow?.last_name ?? '',
      username: currentRow?.username ?? '',
      nickname: currentRow?.nickname ?? '',
      email: currentRow?.email ?? '',
      password: '',
      confirmPassword: '',
      role: currentRow?.role_id ?? '',
      isEdit,
    },
  })

  // ✅ Handle form submission
  const onSubmit = async (data: UserForm) => {
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        nickname: data.nickname,
        email: data.email,
        role_id: data.role, // from dropdown
        user_id: currentRow?.id,
      }

      if (isEdit && currentRow?.id) {
        await updateProfile(currentRow.id, payload)
      } else {
        await createProfile(payload)
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
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
        if (!v) form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isEdit ? 'Edit User' : 'Add New User'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the user information below.'
              : 'Add a new user by providing the required details. Click save when done.'}
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
              render={({ field }) => {
                // Find the matching role object by Firestore role_id (value)
                const selectedRole =
                  roles.find((r) => r.value === field.value) ||
                  roles.find(
                    (r) => r.label.toLowerCase() === field.value?.toLowerCase()
                  ) ||
                  null

                return (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={selectedRole?.value} // ✅ set actual value behind the label
                        onValueChange={field.onChange}
                        placeholder={
                          selectedRole ? selectedRole.label : 'Select a role'
                        } // ✅ show label in placeholder
                        items={roles.map(({ label, value }) => ({
                          label, // ✅ display label text in dropdown
                          value, // value sent on submit (role_id)
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
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
