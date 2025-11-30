import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

// Layout Components
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { getModule } from '@/lib/modules-hooks'
import { useModules, ModulesProvider } from './modules-provider'
import { ModuleFormValues, moduleFormSchema } from '../data/schema'

const BLOOM_LEVELS = [
  'Remembering',
  'Understanding',
  'Applying',
  'Analyzing',
  'Evaluating',
  'Creating',
]

interface ModuleMutateFormProps {
  moduleId?: string
}

export function ModuleMutateForm({ moduleId }: ModuleMutateFormProps) {
  const {
    createModuleMutation,
    updateModuleMutation,
    subjects,
    isLoadingSubjects,
  } = useModules()
  const navigate = useNavigate()
  const isEdit = !!moduleId
  const [openBloom, setOpenBloom] = useState(false)

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      purpose: '',
      bloom_levels: [], 
      subject_id: '',
      material_url: '',
      is_verified: false,
    },
  })

  useEffect(() => {
    if (isEdit && moduleId) {
      getModule(moduleId)
        .then((data) => {
          const rawData = data as any
          const currentBlooms = 
            rawData.bloom_levels || 
            (rawData.bloom_level ? [rawData.bloom_level] : [])

          form.reset({
            title: data.title,
            purpose: data.purpose || '',
            bloom_levels: currentBlooms, 
            subject_id: data.subject_id,
            material_url: data.material_url || '',
            is_verified: !!data.is_verified,
          })
        })
        .catch(() => toast.error('Could not load module'))
    }
  }, [isEdit, moduleId, form])

  async function onSubmit(data: ModuleFormValues) {
    try {
      if (isEdit && moduleId) {
        await updateModuleMutation.mutateAsync({ id: moduleId, data })
        toast.success('Module updated successfully.')
      } else {
        await createModuleMutation.mutateAsync(data)
        toast.success('Module created successfully.')
      }
      navigate({ to: '/modules' })
    } catch (error) {
      toast.error('Failed to save module.')
    }
  }

  if (isLoadingSubjects) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g., Introduction to Python'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='subject_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a subject' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='purpose'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose/Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='What is the learning goal?'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='material_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material File (PDF/Word)</FormLabel>
                <FormControl>
                  <Input
                    type='file'
                    accept='.pdf,.doc,.docx'
                    onChange={async (e) => {
                      // Logic for file upload placeholder
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* [FIX] Multi-Select Dropdown (Combobox) for Bloom Levels */}
          <FormField
            control={form.control}
            name="bloom_levels"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Bloom's Taxonomy Levels</FormLabel>
                <Popover open={openBloom} onOpenChange={setOpenBloom}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBloom}
                        className={cn(
                          "w-full justify-between",
                          !field.value || field.value.length === 0 ? "text-muted-foreground" : ""
                        )}
                      >
                        {field.value && field.value.length > 0
                          ? `${field.value.length} selected`
                          : "Select levels..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search levels..." />
                      <CommandList>
                        <CommandEmpty>No level found.</CommandEmpty>
                        <CommandGroup>
                          {BLOOM_LEVELS.map((level) => (
                            <CommandItem
                              key={level}
                              value={level}
                              onSelect={() => {
                                const current = field.value || []
                                const isSelected = current.includes(level)
                                if (isSelected) {
                                  field.onChange(current.filter((l) => l !== level))
                                } else {
                                  field.onChange([...current, level])
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(level)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {level}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
                {/* Selected Tags Preview */}
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((level) => (
                      <div 
                        key={level} 
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md"
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                )}
              </FormItem>
            )}
          />

          <div className='flex items-center justify-between pt-4'>
            <Button
              variant='outline'
              type='button'
              onClick={() => navigate({ to: '/modules' })}
            >
              <ArrowLeft className='mr-2 h-4 w-4' /> Back to List
            </Button>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Module'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

type ModulesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: { id: string; title?: string } | null
  onSuccess?: () => void
}

export function ModulesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ModulesMutateDrawerProps) {
  const moduleId = currentRow?.id
  const isEdit = !!moduleId
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? 'Edit Module' : 'Add Module'}</DrawerTitle>
        </DrawerHeader>
        <ModuleMutateForm moduleId={moduleId} />
      </DrawerContent>
    </Drawer>
  )
}

export function ModuleMutatePage() {
  const params = useParams({ from: '/_authenticated/modules/$moduleId' }) as any
  const moduleId = params.moduleId

  return (
    <ModulesProvider>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <ModuleMutateForm
          moduleId={moduleId === 'new' ? undefined : moduleId}
        />
      </Main>
    </ModulesProvider>
  )
}