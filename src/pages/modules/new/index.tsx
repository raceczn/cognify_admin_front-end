import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ModuleMutateForm } from '../components/modules-mutate-drawer'
import { ModulesProvider } from '../components/modules-provider'

export default function ModulesNewPage() {
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
          <h1 className='text-2xl font-bold tracking-tight'>Add Module</h1>
          <p className='text-muted-foreground'>Create a new module.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ModulesProvider>
              <ModuleMutateForm />
            </ModulesProvider>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
