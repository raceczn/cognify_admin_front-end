import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getModule } from '@/lib/modules-hooks'
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
import { Checkbox } from '@/components/ui/checkbox'
import { moduleFormSchema } from '../data/schema'
import type { ModuleFormValues } from '../data/schema'
import type { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { useModules } from './modules-provider'

interface ModuleMutateFormProps {
  moduleId?: string
  isVerificationMode?: boolean
  onApprove?: (data: ModuleFormValues) => void
  onReject?: () => void
}

const BLOOM_LEVELS = [
  'remembering',
  'understanding',
  'applying',
  'analyzing',
  'evaluating',
  'creating',
] as const

export function ModuleMutateForm({
  moduleId,
  isVerificationMode,
  onApprove,
  onReject,
}: ModuleMutateFormProps) {
  const {
    createModuleMutation,
    updateModuleMutation,
    subjects,
    isLoadingSubjects,
  } = useModules()
  const navigate = useNavigate()
  const isEdit = !!moduleId

  const form = useForm<z.input<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      purpose: '',
      // [FIX] Initializing to empty array for multi-select
      bloom_levels: [], 
      subject_id: '',
      material_url: '',
      is_verified: false,
    },
  })

  // Check if only "remembering" is selected (should disable material_url)
  const watchedBloomLevels = form.watch('bloom_levels') ?? []
  const isQuestionOnly =
    watchedBloomLevels.length > 0 &&
    watchedBloomLevels.every((l) => l === 'remembering')

  // Clear material_url if the user switches to 'Remembering' ONLY mode
  useEffect(() => {
    if (isQuestionOnly) {
      form.setValue('material_url', '', { shouldDirty: false })
    }
  }, [isQuestionOnly, form])

  useEffect(() => {
    if (isEdit && moduleId) {
      getModule(moduleId)
        .then((data) => {
          form.reset({
            title: data.title || '',
            purpose: data.purpose || '',
            // [FIX] Handle single string ('bloom_level') or array ('bloom_levels') from API
            bloom_levels: Array.isArray(data.bloom_levels) 
                ? data.bloom_levels 
                : (data.bloom_level ? [data.bloom_level] : []),
            subject_id: data.subject_id || '',
            material_url: data.material_url || '',
            is_verified: !!data.is_verified,
          })
        })
        .catch(() => toast.error('Could not load module'))
    }
  }, [isEdit, moduleId])

  const onSubmit: SubmitHandler<z.input<typeof moduleFormSchema>> = async (data) => {
    try {
      const payload: Partial<z.input<typeof moduleFormSchema>> = { ...data }

      // Enforce: If "Remembering" is set, material_url must be cleared.
      if (isQuestionOnly) {
        payload.material_url = ''
      }
      
      // Ensure single bloom_level is sent for backend compatibility if needed, using the first element
      const dataToSend = {
        ...payload,
        bloom_levels: payload.bloom_levels ?? [],
        bloom_level: (data.bloom_levels?.[0]) || 'remembering',
      }

      if (isEdit && moduleId) {
        await updateModuleMutation.mutateAsync({ id: moduleId, data: dataToSend })
        toast.success('Module updated successfully.')
      } else {
        await createModuleMutation.mutateAsync(dataToSend)
        toast.success('Module created successfully.')
      }
      if (isVerificationMode && onApprove) {
        await onApprove(moduleFormSchema.parse(data))
        return
      }
      navigate({ to: '/modules' })
    } catch (error) {
      toast.error(`Failed to save module.`)
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
                    placeholder='Enter materials title'
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

          {/* [FIX] Multi-select for Bloom's Taxonomy */}
          <FormField
            control={form.control}
            name='bloom_levels'
            render={({ field: _ }) => (
              <FormItem>
                <div className='mb-4'>
                  <FormLabel>Bloom's Taxonomy Levels (Select Multiple)</FormLabel>
                </div>
                <div className="space-y-2">
                  {BLOOM_LEVELS.map((level) => (
                    <FormField
                      key={level}
                      control={form.control}
                      name='bloom_levels'
                      render={({ field: innerField }) => (
                        <FormItem
                          key={level}
                          className='flex flex-row items-start space-x-3 space-y-0'
                        >
                          <FormControl>
                            <Checkbox
                              checked={(innerField.value ?? []).includes(level)}
                              onCheckedChange={(checked) => {
                                const current = innerField.value ?? []
                                return checked
                                  ? innerField.onChange([...current, level])
                                  : innerField.onChange(
                                      current.filter((value) => value !== level)
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='material_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Material URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      isQuestionOnly
                        ? 'N/A - This module is intended for multiple-choice questions.'
                        : 'e.g., https://link-to-lecture.pdf'
                    }
                    {...field}
                    value={field.value || ''}
                    disabled={isQuestionOnly}
                  />
                </FormControl>
                <FormMessage />
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
            <div className='flex gap-2'>
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
              {isVerificationMode && (
                <>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => onApprove?.(moduleFormSchema.parse(form.getValues()))}
                  >
                    Approve
                  </Button>
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={() => onReject?.()}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

type ModulesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: { id: string }
  onSuccess?: () => void
}

export function ModulesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ModulesMutateDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='h-[95vh]'>
        <DrawerHeader>
          <DrawerTitle>
            {currentRow ? 'Edit Module' : 'Create Module'}
          </DrawerTitle>
        </DrawerHeader>
        <div className='flex-1 overflow-y-auto px-4 pb-10'>
          <ModuleMutateForm moduleId={currentRow?.id} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
