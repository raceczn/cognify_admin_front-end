import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { signup } from '@/lib/auth-hooks'
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

// 1. Updated Schema to match Backend Rules
const formSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z
      .string()
      .email('Please enter a valid email')
      .refine((val) => val.endsWith('@cvsu.edu.ph'), {
        message: 'Email must be a valid CVSU email (@cvsu.edu.ph)',
      }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  navigate: ReturnType<typeof useNavigate>
}

export function SignUpForm({ className, navigate, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await signup({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
      } as any)

      // Success Confirmation
      toast.success('Account created successfully!', {
        description: 'You can now sign in with your credentials.',
      })
      navigate({ to: '/sign-in' })
    } catch (error: any) {
      console.error('Signup error:', error)

      // 2. Proper Error Parsing for FastAPI "Unprocessable Content"
      const detail = error.response?.data?.detail

      if (Array.isArray(detail)) {
        // Backend returned a list of validation errors
        detail.forEach((err: any) => {
          // Extract field name (e.g., "email" from ["body", "email"])
          const field = err.loc[err.loc.length - 1]
          // Clean message (remove "Value error, " prefix)
          const message = err.msg.replace('Value error, ', '')
          
          toast.error(`Error in ${field}`, {
            description: message,
          })
        })
      } else {
        // Fallback for generic errors (e.g. 500 server error)
        const errorMsg =
          detail || 'Registration failed. Please try again.'
        toast.error('Registration Failed', {
          description: errorMsg,
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
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder='John' {...field} />
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
                  <Input placeholder='Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder='johndoe123'
                  {...field}
                  autoComplete='username'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='name@cvsu.edu.ph'
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
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
                  {...field}
                  autoComplete='new-password'
                />
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
                  {...field}
                  autoComplete='new-password'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <UserPlus className='mr-2 h-4 w-4' />
          )}
          Create Account
        </Button>
      </form>
    </Form>
  )
}