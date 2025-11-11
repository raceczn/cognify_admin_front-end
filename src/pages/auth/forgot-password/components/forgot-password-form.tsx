// src/pages/auth/forgot-password/components/forgot-password-form.tsx
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
// --- 1. Remove toast import, it's handled in the hook ---
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
import { requestPasswordReset } from '@/lib/auth-hooks'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // --- 2. Await the function which handles its own toasts ---
      await requestPasswordReset(data.email);
      
      // --- 3. On success, reset form and navigate ---
      // We don't navigate to OTP, as the user needs to check email.
      // We'll navigate back to sign-in.
      form.reset()
      navigate({ to: '/sign-in' })

    } catch (error: any) {
      // Error is already toasted by the hook
      console.error(error.message);
    } finally {
      setIsLoading(false)
    }
    
    // --- 4. REMOVE the old toast.promise and sleep ---
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {/* --- 5. Update button text and icon --- */}
          {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
          Send Reset Link
        </Button>
      </form>
    </Form>
  )
}