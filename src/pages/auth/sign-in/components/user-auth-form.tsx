import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-hooks'
import { getMyProfile, UserProfile } from '@/lib/profile-hooks' // [FIX] Import UserProfile
import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
  navigate: ReturnType<typeof useNavigate>
}

export function UserAuthForm({
  className,
  redirectTo,
  navigate,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { auth } = useAuthStore()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // 1. Login (Sets HttpOnly cookie automatically)
      // Expects response: { message: string, uid: string }
      const loginResult = await login({
        email: data.email,
        password: data.password,
      })

      // 2. Fetch full profile using the new cookie
      const profile: UserProfile = await getMyProfile()

      // 3. Update Store (No sensitive tokens, just UI data)
      auth.setUser({
        uid: loginResult.uid,
        email: profile.email,
        role_id: profile.role_id,
        profile: {
          id: profile.id,
          first_name: profile.first_name ?? undefined,
          middle_name: profile.middle_name ?? null,
          last_name: profile.last_name ?? undefined,
          nickname: profile.nickname ?? undefined,
          user_name: profile.user_name ?? profile.email,
          role: (profile as any).role ?? 'student',
          role_id: profile.role_id,
          email: profile.email,
          created_at: String(profile.created_at ?? new Date().toISOString()),
          deleted: false,
          deleted_at: null,
        },
      })

      toast.success(`Welcome back, ${profile.first_name || profile.email}!`)
      
      // 4. Navigate
      navigate({ to: redirect || '/', replace: true })
    } catch (error: any) {
      console.error('Login error:', error)
      auth.reset()

      const detail = error.response?.data?.detail

      if (Array.isArray(detail)) {
        // Handle Pydantic Validation Errors (422)
        detail.forEach((err: any) => {
          const field = err.loc[err.loc.length - 1]
          const message = err.msg.replace('Value error, ', '')
          toast.error(`Error in ${field}`, { description: message })
        })
      } else if (typeof detail === 'string') {
        toast.error('Login Failed', { description: detail })
      } else {
        toast.error('Login Failed', {
          description: 'An unexpected error occurred. Please try again.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter your email address'
                  {...field}
                  autoComplete='email'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Enter your password'
                  {...field}
                  autoComplete='current-password'
                />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
