import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { jwtDecode } from 'jwt-decode'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-hooks'
import { getMyProfile } from '@/lib/profile-hooks'
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

// Types for Auth Store
interface Profile {
  id: string
  first_name?: string
  middle_name?: string | null
  last_name?: string
  nickname?: string
  role_id: string
  email: string
  pre_assessment_score?: number
  ai_confidence?: number
  current_module?: string
  created_at: string
  updated_at?: string
  deleted: boolean
}

interface DecodedToken {
  sub: string
  email: string
  exp: number
  iat: number
}

interface AuthUser {
  uid: string
  email: string
  role_id: string
  profile: Profile
  exp: number
}

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
      // Step 1: Login
      const loginResult = await login({
        email: data.email,
        password: data.password,
      })

      if (loginResult && loginResult.token) {
        // Step 2: Decode Token
        const decodedToken: DecodedToken = jwtDecode(loginResult.token)
        const uid = decodedToken.sub

        if (!uid) throw new Error("Invalid token: Missing 'sub' (user ID).")

        // Step 3: Fetch Profile
        auth.setAccessToken(loginResult.token)
        const profile: Profile = await getMyProfile()

        // Step 4: Build User Object
        const user: AuthUser = {
          uid: uid,
          email: profile.email,
          role_id: profile.role_id,
          profile: profile,
          exp: decodedToken.exp,
        }

        // Step 5: Update Store
        auth.setLoginData(user, loginResult.token, loginResult.refresh_token)

        toast.success(`Welcome back, ${user.profile.first_name || user.email}!`)

        // Step 6: Navigate
        navigate({ to: redirect || '/', replace: true })
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      auth.reset()

      // --- Robust Error Handling ---
      const detail = error.response?.data?.detail

      if (Array.isArray(detail)) {
        // Handle Pydantic Validation Errors (422)
        detail.forEach((err: any) => {
          const field = err.loc[err.loc.length - 1]
          const message = err.msg.replace('Value error, ', '')
          toast.error(`Error in ${field}`, { description: message })
        })
      } else if (typeof detail === 'string') {
        // Handle Standard HTTP Exceptions (400, 401, 403, 500)
        toast.error('Login Failed', { description: detail })
      } else {
        // Fallback for unknown errors
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