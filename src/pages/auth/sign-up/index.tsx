import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/(auth)/sign-up' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Sign Up</CardTitle>
          <CardDescription>
            Enter your information below to <br />
            create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm navigate={navigate} />
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-muted-foreground text-center text-sm'>
            Already have an account?{' '}
            <Link
              to='/sign-in'
              search={redirect ? { redirect } : undefined}
              className='hover:text-primary ml-1 font-medium underline underline-offset-4'
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}