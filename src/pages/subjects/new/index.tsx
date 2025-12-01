import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { SubjectMutateForm } from '../components/subjects-mutate-drawer'
import { SubjectsProvider } from '../components/subjects-provider'

export default function SubjectsNewPage() {
  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Add Subject</h1>
          <p className='text-muted-foreground'>Create a new subject.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectsProvider>
              <SubjectMutateForm />
            </SubjectsProvider>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
