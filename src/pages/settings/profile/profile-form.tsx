// profile-form.tsx
import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { showSubmittedData } from '@/lib/show-submitted-data'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
// --- FIX: Import from profile-hooks, not auth-hooks ---
import { updateProfile } from '@/lib/profile-hooks'
import { toast } from 'sonner'


// Schema (no update_at)
const accountFormSchema = z.object({
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  nickname: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function ProfileForm() {
  const auth = useAuthStore()
  const user = auth?.auth?.user
  const profile = user?.profile

  const [isEditing, setIsEditing] = useState(false)

  // initial values pulled from store
  const initialValues: Partial<AccountFormValues> = {
    first_name: profile?.first_name ?? undefined,
    middle_name: profile?.middle_name ?? undefined,
    last_name: profile?.last_name ?? undefined,
    nickname: profile?.nickname ?? undefined,
  }

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  })

  function resetToStoreValues() {
    // Re-fetch from store in case it updated
    const currentUser = useAuthStore.getState().auth.user
    form.reset({
      first_name: currentUser?.profile?.first_name ?? undefined,
      middle_name: currentUser?.profile?.middle_name ?? undefined,
      last_name: currentUser?.profile?.last_name ?? undefined,
      nickname: currentUser?.profile?.nickname ?? undefined,
    })
  }

  // Submit handler is async so react-hook-form sets isSubmitting automatically
  async function onSubmit(data: AccountFormValues) {
    // --- FIX: Use the UID from the root of the auth user ---
    const userId = user?.uid
    if (!userId) {
      toast.error("Missing user id; cannot update profile")
      console.error('Missing user id; cannot update profile')
      return
    }

    try {
      // call backend (waits for updated profile)
      const updatedProfile = await updateProfile(userId, data)

      // ✅ merge updated profile into Zustand immediately
      const auth = useAuthStore.getState().auth
      const currentUser = auth.user
      if (currentUser && updatedProfile) {
        auth.setUser({
          ...currentUser,
          profile: {
            ...currentUser.profile,
            ...updatedProfile, // merge the latest values
          },
        })
      }

      // ✅ also update form state immediately
      form.reset({
        first_name: updatedProfile.first_name ?? '',
        middle_name: updatedProfile.middle_name ?? '',
        last_name: updatedProfile.last_name ?? '',
        nickname: updatedProfile.nickname ?? '',
      })

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
      console.error('Error updating profile:', error)
    }
  }

  function handleStartEditing(e?: React.MouseEvent) {
    e?.preventDefault()
    // Ensure form has the latest store values when entering edit mode
    resetToStoreValues()
    setIsEditing(true)
  }

  function handleCancelEdit(e?: React.MouseEvent) {
    e?.preventDefault()
    // Revert changes and leave edit mode
    resetToStoreValues()
    setIsEditing(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder="First name" {...field} value={field.value || ''} disabled={!isEditing} />
              </FormControl>
              <FormDescription>Given name shown on your profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="middle_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle name</FormLabel>
              <FormControl>
                <Input placeholder="Middle name" {...field} value={field.value || ''} disabled={!isEditing} />
              </FormControl>
              <FormDescription>Optional — middle name or initial.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input placeholder="Last name" {...field} value={field.value || ''} disabled={!isEditing} />
              </FormControl>
              <FormDescription>Family name shown on your profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input placeholder="Nickname (optional)" {...field} value={field.value || ''} disabled={!isEditing} />
              </FormControl>
              <FormDescription>This name can be used across the app.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons: only Save is type="submit" */}
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

