import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import { profile as profileApi } from '@/lib/auth-hooks'
// import { syncAuthFromBackend } from '@/stores/auth-store'

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
    form.reset({
      nickname: profile?.nickname ?? '',
      email: user?.email ?? '',
    })
  }

  async function onSubmit(data: AccountFormValues) {
    const userId = user?.profile?.user_id
    if (!userId) {
      console.error('Missing user id; cannot update account')
      return
    }

    const finalData = { ...data, update_at: new Date() }

    try {
      // ✅ 1. Send PUT to backend
      const updated = await profileApi(finalData, userId, 'PUT')

      // ✅ 2. Update Zustand store instantly with the latest data
      const authStore = useAuthStore.getState().auth
      const currentUser = authStore.user

      if (currentUser && updated?.profile) {
        authStore.setUser({
          ...currentUser,
          email: updated.email ?? currentUser.email,
          profile: {
            ...currentUser.profile,
            ...updated.profile,
          },
        })
      }

      // ✅ 3. Update form UI immediately
      form.reset({
        nickname: updated.profile.nickname ?? '',
        email: updated.email ?? '',
      })

      showSubmittedData(finalData)
      console.log('✅ Account updated immediately:', updated.profile)

      setIsEditing(false)
    } catch (error) {
      console.error('❌ Error updating account:', error)
    }
  }

  function handleRequestPasswordChange() {
    console.log('Requesting password change for:', user?.email)
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
                <Input placeholder="username" {...field} disabled={!isEditing} />
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
                disabled={!form.formState.isValid || form.formState.isSubmitting}
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
