import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Upload, User as UserIcon, Mail, Pencil, X, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
// Ensure hooks are imported correctly
import { updateMyProfile, uploadProfilePicture } from '@/lib/profile-hooks' 
import { updateUserPassword } from '@/lib/auth-hooks' 
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  user_name: z.string().min(4, 'Username must be at least 4 characters'),
  email: z.string().email(),
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

export function ProfileForm() {
  const { auth } = useAuthStore()
  const user = auth?.user
  const profile = user?.profile

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false) 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      user_name: '',
      email: '',
      profile_picture: null,
      password: '',
      confirmPassword: '',
    },
  })

  // Helper to reset form to current store values
  const resetFormValues = (targetProfile = profile) => {
    if (!targetProfile) return
    form.reset({
      first_name: targetProfile.first_name || '',
      middle_name: targetProfile.middle_name || '',
      last_name: targetProfile.last_name || '',
      user_name: targetProfile.user_name || '',
      email: targetProfile.email || user?.email || '',
      profile_picture: (targetProfile as any).profile_picture || null,
      password: '',
      confirmPassword: '',
    })
  }

  useEffect(() => {
    if (profile && !isEditing) {
      resetFormValues()
    }
  }, [profile, user, isEditing])

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    resetFormValues()
    setIsEditing(false)
  }

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
    if (!user?.uid) return

    setIsSubmitting(true)
    try {
      // 1. Handle Password Update (if provided)
      if (data.password) {
        try {
          // [FIX] Pass email to satisfy backend LoginSchema
          const emailToUse = data.email || user.email
          await updateUserPassword(emailToUse, data.password)
          toast.success('Password updated successfully')
        } catch (pwError: any) {
          console.error("Password update failed", pwError)
          toast.error("Failed to update password. Check your email or connection.")
          setIsSubmitting(false)
          return
        }
      }

      // 2. Prepare Profile Payload
      const profilePayload: any = {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        username: data.user_name,
        profile_picture: data.profile_picture,
      }

      // 3. Call Profile Update API
      const updatedProfile = await updateMyProfile(profilePayload)

      // 4. Update Global Store & Reset Form
      if (auth.user && updatedProfile) {
        const newUserState = {
          ...auth.user,
          profile: {
            ...auth.user.profile,
            ...updatedProfile,
            user_name: updatedProfile.user_name || updatedProfile.user_name || data.user_name
          },
        }
        
        auth.setUser(newUserState)
        resetFormValues(newUserState.profile)
      }

      toast.success('Profile details saved')
      setIsEditing(false)
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const profilePicUrl = form.watch('profile_picture')

  if (!profile) return null

  return (
    <Form {...form}>
      {/* [FIX] w-full ensures responsive width */}
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDesc>Update your personal details and public profile.</CardDesc>
                    </div>
                    {!isEditing && (
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='first_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder='John' {...field} disabled={!isEditing} />
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
                          <Input placeholder='Doe' {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='middle_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Optional' {...field} disabled={!isEditing} />
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
                          <Input placeholder='johndoe123' {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This is your unique public identifier.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted text-muted-foreground" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Contact your administrator to change your email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Security</CardTitle>
                </div>
                <CardDesc>Manage your password and account security.</CardDesc>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                   <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md border border-dashed">
                     Enable edit mode to change password.
                   </div>
                ) : (
                  <>
                    <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                      Leave these fields blank if you don't want to change your password.
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder='••••••••' {...field} disabled={!isEditing} />
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
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder='••••••••' {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {isEditing && (
                <div className='flex justify-end gap-3 animate-in fade-in slide-in-from-bottom-2 pt-2'>
                    <Button type='button' variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting || isUploading}>
                        {isSubmitting ? (
                        <>
                            <Loader2 className='animate-spin mr-2 h-4 w-4' />
                            Saving...
                        </>
                        ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                        )}
                    </Button>
                </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDesc>Click to upload a new avatar.</CardDesc>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-6 pt-0">
                <div className={`relative group overflow-hidden rounded-full border-4 border-muted shadow-sm transition-colors ${isEditing ? 'hover:border-primary/50 cursor-pointer' : ''}`}>
                  <Avatar className="h-48 w-48">
                    <AvatarImage src={profilePicUrl || ''} className="object-cover" />
                    <AvatarFallback className="text-5xl bg-muted text-muted-foreground">
                      {profile.first_name?.[0]}{profile.last_name?.[0] || <UserIcon className="h-24 w-24" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  {(isUploading || isEditing) && (
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                      {isUploading ? (
                          <Loader2 className="h-10 w-10 text-white animate-spin" />
                      ) : (
                          <Upload className="h-10 w-10 text-white" />
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer relative" 
                    disabled={!isEditing || isUploading} 
                    asChild={isEditing} 
                  >
                    {isEditing ? (
                        <label>
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Upload New Photo'}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={!isEditing || isUploading}
                        />
                        </label>
                    ) : (
                        <span className="opacity-50">Enable edit mode to change</span>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Supported formats: JPG, PNG, WEBP.<br/>Max file size: 5MB.
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