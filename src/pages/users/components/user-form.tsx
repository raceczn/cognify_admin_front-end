'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Upload, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile, uploadProfilePicture } from '@/lib/profile-hooks'
import { adminUpdateUserPassword } from '@/lib/admin-hooks' // [FIX] Import
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
import { SelectDropdown } from '@/components/select-dropdown'
import { PasswordInput } from '@/components/password-input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'
import { useNavigate } from '@tanstack/react-router'

const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  user_name: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  role_id: z.string().min(1, 'Role is required.'),
  profile_picture: z.string().optional().nullable(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type UserFormProps = {
  user: User
}

export function UserForm({ user }: UserFormProps) {
  const navigate = useNavigate()
  const { updateLocalUsers } = useUsers()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const initialRole = roles.find(r => r.value === user.role)?.value || user.role || user.role_id

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      user_name: user.user_name || '',
      email: user.email,
      role_id: initialRole,
      profile_picture: user.profile_picture || null,
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        user_name: user.user_name || '',
        email: user.email,
        role_id: roles.find(r => r.value === user.role)?.value || user.role || user.role_id,
        profile_picture: user.profile_picture || null,
        password: '',
        confirmPassword: '',
      })
    }
  }, [user, form])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.')
      return
    }

    setIsUploading(true)
    toast.loading('Uploading profile picture...')
    try {
      const res = await uploadProfilePicture(file)
      form.setValue('profile_picture', res.file_url, { shouldDirty: true })
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    } catch (err) {
      toast.dismiss()
      toast.error('Image upload failed.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // 1. Prepare Profile Payload
      const payload: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        user_name: data.user_name,
        email: data.email,
        role_id: data.role_id,
        profile_picture: data.profile_picture,
      }

      // [FIX] 2. Handle Password Change via Admin API using LoginSchema logic
      if (data.password && data.password.length > 0) {
        try {
          // Pass email + password
          await adminUpdateUserPassword(user.id, data.email, data.password)
          toast.success('Password updated successfully')
        } catch (pwError: any) {
          console.error("Failed to update password:", pwError)
          toast.error("Failed to update password. Check admin permissions.")
        }
      }

      // 3. Update Profile Data
      const response = await updateProfile(user.id, payload)

      const updatedUser: User = {
        ...user,
        ...response,
        role: response.role || 'unknown',
        created_at: response.created_at ? new Date(response.created_at) : user.created_at,
        updated_at: response.updated_at ? new Date(response.updated_at) : new Date(),
        deleted_at: response.deleted_at ? new Date(response.deleted_at) : user.deleted_at,
      }

      updateLocalUsers(updatedUser, 'edit')
      toast.success('User updated successfully')
      navigate({ to: '/users' })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const profilePicUrl = form.watch('profile_picture')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
              
              <div className="col-span-1 md:col-span-2">
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
              </div>

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
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
                          items={roles.map((r) => ({ label: r.label, value: r.value }))}
                          isControlled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="text-sm text-muted-foreground mb-4 pt-4 border-t">
                  Leave password blank to keep it unchanged.
                </div>
              </div>

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button variant="outline" type="button" onClick={() => navigate({ to: '/users' })}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting || isUploading}>
                {isSubmitting ? <Loader2 className='animate-spin mr-2 h-4 w-4' /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
                <div className="relative group">
                  <Avatar className="h-40 w-40 border-4 border-muted">
                    <AvatarImage src={profilePicUrl || ''} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                      {user.first_name?.[0]}{user.last_name?.[0] || <UserIcon className="h-20 w-20" />}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer relative" 
                    disabled={isUploading}
                    asChild
                  >
                    <label>
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Change Photo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </Form>
  )
}