import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getSubject,
  uploadSubjectImage,
} from '@/lib/subjects-hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { subjectFormSchema } from '../data/schema'
import { useSubjects } from './subjects-provider'
import { SubjectsProvider } from './subjects-provider'

type SubjectFormInput = z.input<typeof subjectFormSchema>

interface SubjectMutateFormProps {
  subjectId?: string
}

export function SubjectMutateForm({ subjectId }: SubjectMutateFormProps) {
  const { createSubjectMutation, updateSubjectMutation } = useSubjects()
  const navigate = useNavigate()
  const isEdit = !!subjectId

  // 1. Setup Form with FORM SCHEMA type
  const form = useForm<SubjectFormInput>({
    resolver: zodResolver(subjectFormSchema),
    mode: 'onChange', // Validate as user types
    defaultValues: {
      title: '',
      pqf_level: 6,
      description: '',
      icon_name: 'book',
      icon_color: '#000000',
      icon_bg_color: '#ffffff',
      is_verified: false,
    },
  })

  // 2. Load Data (Populate Form)
  useEffect(() => {
    if (isEdit && subjectId) {
      getSubject(subjectId)
        .then((data) => {
          // Reset form with the data matching the Form Schema structure
          form.reset({
            title: data.title || '',
            pqf_level: typeof data.pqf_level === 'number' ? data.pqf_level : 6,
            description: data.description || '',
            icon_name: data.icon_name || 'book',
            icon_color: data.icon_color || '#000000',
            icon_bg_color: data.icon_bg_color || '#ffffff',
            is_verified: !!data.is_verified,
          })
        })
        .catch(() => toast.error('Could not load subject'))
    }
  }, [isEdit, subjectId])

  // 3. Handle Submit
  async function onSubmit(data: SubjectFormInput) {
    try {
      const payload = subjectFormSchema.parse(data)
      if (isEdit && subjectId) {
        // Pass ID separately because 'data' doesn't have it
        await updateSubjectMutation.mutateAsync({
          id: subjectId,
          data: payload,
        })
        toast.success('Subject updated successfully.')
      } else {
        await createSubjectMutation.mutateAsync(payload)
        toast.success('Subject created successfully.')
      }
      navigate({ to: '/subjects' })
    } catch (error) {
      toast.error(`Failed to save subject.`)
    }
  }

  const imagePreview = form.watch('image_url')

  return (
    <div className='space-y-6 p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            <div className='space-y-4 lg:col-span-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., General Mathematics'
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
                name='pqf_level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PQF Level</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='e.g., 6'
                        {...field}
                        value={
                          typeof field.value === 'number' ? field.value : 6
                        }
                        onChange={(e) => {
                          const v = e.target.value
                          field.onChange(v ? Number(v) : 6)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Brief summary of the subject'
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
                name='image_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Image</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        accept='image/*'
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const res = await uploadSubjectImage(file)
                            const url = res?.url || res?.image_url || ''
                            field.onChange(url)
                            toast.success('Image uploaded')
                          } catch {
                            toast.error('Image upload failed')
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Removed TOS upload from inside the form. TOS upload now lives beside the primary button. */}

              <div className='flex items-center justify-between pt-4'>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => navigate({ to: '/subjects' })}
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
                    'Create Subject'
                  )}
                </Button>
              </div>
            </div>

            <div className='lg:col-span-1'>
              <Card>
                <CardContent className='flex flex-col items-center justify-center space-y-6 p-6'>
                  <Avatar className='border-muted h-40 w-40 border-4'>
                    <AvatarImage
                      src={imagePreview || ''}
                      className='object-cover'
                    />
                    <AvatarFallback className='bg-muted text-muted-foreground text-4xl'>
                      S
                    </AvatarFallback>
                  </Avatar>

                  <div className='w-full'>
                    <Button variant='outline' className='w-full' asChild>
                      <label>
                        Upload Image
                        <input
                          type='file'
                          className='hidden'
                          accept='image/*'
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const res = await uploadSubjectImage(file)
                              const url = res?.url || res?.image_url || ''
                              form.setValue('image_url', url, {
                                shouldDirty: true,
                              })
                              toast.success('Image uploaded')
                            } catch {
                              toast.error('Image upload failed')
                            }
                          }}
                        />
                      </label>
                    </Button>
                    <p className='text-muted-foreground mt-2 text-center text-xs'>
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

type SubjectsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: { id: string; title?: string } | null
  onSuccess?: () => void
}

export function SubjectsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: SubjectsMutateDrawerProps) {
  const subjectId = currentRow?.id
  const isEdit = !!subjectId
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DrawerTitle>
        </DrawerHeader>
        <SubjectMutateForm subjectId={subjectId} />
      </DrawerContent>
    </Drawer>
  )
}

export function SubjectMutatePage() {
  const { subjectId } = useParams({
    from: '/_authenticated/subjects/$subjectId',
  })
  return (
    <SubjectsProvider>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <SubjectMutateForm
          subjectId={subjectId === 'new' ? undefined : subjectId}
        />
      </Main>
    </SubjectsProvider>
  )
}
