import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { showSubmittedData } from '@/lib/show-submitted-data'
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
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
// --- FIX: Import from profile-hooks, not auth-hooks ---
import { updateProfile } from '@/lib/profile-hooks'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/lib/auth-hooks' // For password reset

const accountFormSchema = z.object({
  nickname: z.string().optional(),
  email: z.string().email().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountForm() {
  const auth = useAuthStore()
  const user = auth?.auth?.user
  const profile = user?.profile

  const [isEditing, setIsEditing] = useState(false)

  const defaultValues: Partial<AccountFormValues> = {
    nickname: profile?.nickname ?? '',
    email: user?.email ?? '',
  }

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Helper to reset form to latest Zustand values
  function resetToStoreValues() {
    // Re-fetch from store in case it updated
    const currentUser = useAuthStore.getState().auth.user
    form.reset({
      nickname: currentUser?.profile?.nickname ?? '',
      email: currentUser?.email ?? '',
    })
  }

  async function onSubmit(data: AccountFormValues) {
    // --- FIX: Use the UID from the root of the auth user ---
    const userId = user?.uid
    if (!userId) {
      toast.error('Missing user id; cannot update account')
      console.error('Missing user id; cannot update account')
      return
    }

    try {
      // ✅ 1. Send PUT to backend
      const updatedProfile = await updateProfile(userId, data)

      // ✅ 2. Update Zustand store instantly with the latest data
      const authStore = useAuthStore.getState().auth
      const currentUser = authStore.user

      if (currentUser && updatedProfile) {
        authStore.setUser({
          ...currentUser,
          email: updatedProfile.email ?? currentUser.email,
          profile: {
            ...currentUser.profile,
            ...updatedProfile, // merge the latest values
          },
        })
      }

      // ✅ 3. Update form UI immediately
      form.reset({
        nickname: updatedProfile.nickname ?? '',
        email: updatedProfile.email ?? '',
      })

      toast.success('Account updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update account')
      console.error('❌ Error updating account:', error)
    }
  }

  function handleRequestPasswordChange() {
    if (user?.email) {
      requestPasswordReset(user.email);
    } else {
      toast.error("Could not find user email to send reset link.")
    }
  }

  function handleStartEditing(e?: React.MouseEvent) {
    e?.preventDefault()
    resetToStoreValues()
    setIsEditing(true)
  }

  function handleCancelEdit(e?: React.MouseEvent) {
    e?.preventDefault()
    resetToStoreValues()
    setIsEditing(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Username / Nickname */}
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} value={field.value || ''} disabled={!isEditing} />
              </FormControl>
              <FormDescription>
                Public display name. Editable only when in edit mode.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email (editable) */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} disabled={!isEditing} />
              </FormControl>
              <FormDescription>Verified email associated with your account.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Section */}
        <FormItem>
          <FormLabel>Password</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl>
              <Input value="********" disabled className="flex-1" />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              onClick={handleRequestPasswordChange}
              className="whitespace-nowrap"
            >
              Request password change
            </Button>
          </div>
          <FormDescription>Click to initiate a password reset process.</FormDescription>
        </FormItem>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                type="submit"
                variant="default"
                disabled={!form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>

              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={handleStartEditing}>
              Edit
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

