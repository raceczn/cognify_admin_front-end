// src/pages/sign-in/components/user-auth-form.tsx
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-hooks' //
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
import { jwtDecode } from 'jwt-decode' // 👈 --- 1. IMPORT THIS

// ... (formSchema and interface are unchanged)
const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(7, 'Password must be at least 7 characters long'),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '', 
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // ---------------------------------
      // 👇 --- 2. REPLACE YOUR ONSUBMIT LOGIC --- 👇
      // ---------------------------------
      const result = await login({ email: data.email, password: data.password }) //

      if (result.token) {
        // Decode the token to get the User ID ('sub' = subject = uid)
        const decodedToken: { sub: string } = jwtDecode(result.token);
        const userId = decodedToken.sub;

        // Use the new atomic function to set everything at once
        // This fixes the race condition.
        auth.setLoginData(
          { email: data.email, uid: userId }, // The user object
          result.token,                      // The access token
          result.refresh_token               // The refresh token
        )
        
        toast.success(`Welcome back, ${data.email}!`) // Use email from form
        navigate({ to: '/', replace: true })
      } else {
        toast.error('Invalid email or password') //
      }
    } catch (error) {
      console.error('Login error:', error) //
      toast.error('Login failed. Please try again.') //
    }

    setIsLoading(false) //
  }

  return (
    // ... (Your form JSX is unchanged)
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
                  placeholder='name@example.com'
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
                  placeholder='********'
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