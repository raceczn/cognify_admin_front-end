'use client'

import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChartAreaInteractive } from './components/Usergrowth'
import { ChartPieSimple } from './components/Role-piechart'

export function Apps() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Dashboard Analytics
          </h1>
          <p className='text-muted-foreground'>
            Monitor system activity, user growth, and engagement statistics.
          </p>
        </div>

        {/* ===== Filter & Refresh Section ===== */}
        <div>
          <Separator className='mt-2 shadow-sm' />
        </div>

        <div className='mt-2 flex flex-col gap-4 sm:flex-row'>
          <div className='w-full sm:w-[70%]'>
            <ChartAreaInteractive />
          </div>
          <div className='w-full sm:w-[30%]'>
            <ChartPieSimple />
          </div>
        </div>
      </Main>
    </>
  )
}
