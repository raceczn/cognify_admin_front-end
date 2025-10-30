// src/pages/auth/sign-in/components/user-auth-form.tsx
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-hooks'
// --- 1. IMPORT getProfile ---
import { getProfile } from '@/lib/profile-hooks' 
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
import { jwtDecode } from 'jwt-decode' 

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'), 
});

// --- 2. UPDATE TYPES (from auth-store) ---
// This is the full profile we will FETCH
interface Profile {
  id: string; 
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  nickname?: string;
  role_id: string;
  email: string;
  pre_assessment_score?: number;
  ai_confidence?: number;
  current_module?: string;
  created_at: string;
  updated_at?: string;
  deleted: boolean;
}

// This is the shape of the *standard* Firebase token
interface DecodedToken {
  sub: string; // The User ID (Firebase UID)
  email: string;
  exp: number;
  iat: number; 
  // No profile, no role_id here!
}

// This is the final object for our Zustand store
interface AuthUser {
  uid: string;
  email: string;
  role_id: string;
  profile: Profile;
  exp: number;
}
// --- END TYPE FIXES ---

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
      // ---------------------------------
      // 👇 --- 3. THIS IS THE CORRECT LOGIN LOGIC --- 👇
      // ---------------------------------
      
      // Step 1: Log in and get the token response
      // This response is { token, refresh_token, message }
      const loginResult = await login({ email: data.email, password: data.password });

      if (loginResult && loginResult.token) {
        // Step 2: Decode the token *only* to get the UID (sub)
        const decodedToken: DecodedToken = jwtDecode(loginResult.token);
        const uid = decodedToken.sub;

        if (!uid) {
          throw new Error("Invalid token: Missing 'sub' (user ID).");
        }

        // Step 3: Use the UID to fetch the full user profile from our backend
        // We set the token first so the next request is authenticated
        auth.setAccessToken(loginResult.token); 
        const profile: Profile = await getProfile(uid);

        // Step 4: Build the full AuthUser object
        const user: AuthUser = {
          uid: uid,
          email: profile.email,
          role_id: profile.role_id,
          profile: profile,
          exp: decodedToken.exp
        }

        // Step 5: Use the atomic function to set everything in the store
        auth.setLoginData(
          user,
          loginResult.token,
          loginResult.refresh_token
        )
        
        toast.success(`Welcome back, ${user.profile.first_name || user.email}!`)
        
        // Step 6: Navigate
        navigate({ to: redirect || '/', replace: true })
        
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMsg = error.response?.data?.detail || 'Login failed. Please try again.'
      toast.error(errorMsg)
      auth.reset(); // Clear any partial tokens
    }

    setIsLoading(false)
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
                  autoComplete='off'
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
                  autoComplete='off'
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

