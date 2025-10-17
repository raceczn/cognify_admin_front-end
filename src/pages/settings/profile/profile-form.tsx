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
import { profile as profileApi } from '@/lib/auth-hooks' // renamed to avoid collision with local "profile" object

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
    form.reset({
      first_name: profile?.first_name ?? undefined,
      middle_name: profile?.middle_name ?? undefined,
      last_name: profile?.last_name ?? undefined,
      nickname: profile?.nickname ?? undefined,
    })
  }

  // Submit handler is async so react-hook-form sets isSubmitting automatically
  async function onSubmit(data: AccountFormValues) {
  const userId = user?.profile?.user_id
  if (!userId) {
    console.error("Missing user id; cannot update profile")
    return
  }

  // add timestamp
  const finalData = { ...data, update_at: new Date() }

  try {
    // call backend (waits for updated profile)
    const updated = await profileApi(finalData, userId, "PUT")

    // ✅ merge updated profile into Zustand immediately
    const auth = useAuthStore.getState().auth
    const currentUser = auth.user
    if (currentUser && updated?.profile) {
      auth.setUser({
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...updated.profile, // merge the latest values
        },
      })
    }

    // ✅ also update form state immediately
    form.reset({
      first_name: updated.profile.first_name ?? "",
      middle_name: updated.profile.middle_name ?? "",
      last_name: updated.profile.last_name ?? "",
      nickname: updated.profile.nickname ?? "",
    })

    console.log("Profile updated immediately:", updated.profile)
    setIsEditing(false)
  } catch (error) {
    console.error("Error updating profile:", error)
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

  console.log(user)

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
                <Input placeholder="First name" {...field} disabled={!isEditing} />
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
                <Input placeholder="Middle name" {...field} disabled={!isEditing} />
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
                <Input placeholder="Last name" {...field} disabled={!isEditing} />
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
                <Input placeholder="Nickname (optional)" {...field} disabled={!isEditing} />
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
