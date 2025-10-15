// src/pages/sign-in/components/user-auth-form.tsx
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-hooks'
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
      email: '', // 👈 prefilled email
      password: '', // 👈 prefilled password
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // await sleep(1000)

    // if (
    //   data.email === staticUser.email &&
    //   data.password === staticUser.password
    // ) {
    //   const mockUser = {
    //     accountNo: 'ACC001',
    //     email: data.email,
    //     role: ['admin'],
    //     exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    //   }

    //   auth.setUser(mockUser)
    //   auth.setAccessToken('mock-access-token')

    //   toast.success(`Welcome back, ${data.email}!`)
    //   navigate({ to: '/', replace: true }) // ✅ Redirect to home
    // } else {
    //   toast.error('Invalid email or password')
    // }
    try {
      const result = await login({ email: data.email, password: data.password })
      console.log('Login success:', result)

      if (result.token) {
        auth.setUser(result)
        auth.setAccessToken(result.token)
        
        toast.success(`Welcome back, ${result.profile.nickname || result.profile.first_name || data.email}!`)
        navigate({ to: '/', replace: true }) // ✅ Redirect to home
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
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
