import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSubject } from '@/lib/subjects-hooks'
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
import { Textarea } from '@/components/ui/textarea'
import { SubjectFormValues, subjectFormSchema } from '../data/schema'
import { useSubjects } from './subjects-provider'

interface SubjectMutateFormProps {
  subjectId?: string
  isVerificationMode?: boolean
  onApprove?: (data: SubjectFormValues) => void
  onReject?: () => void
}

export function SubjectMutateForm({
  subjectId,
  isVerificationMode,
  onApprove,
  onReject,
}: SubjectMutateFormProps) {
  const { createSubjectMutation, updateSubjectMutation } = useSubjects()
  const navigate = useNavigate()
  const isEdit = !!subjectId

  // 1. Setup Form with FORM SCHEMA type
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema) as any,
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
  async function onSubmit(data: SubjectFormValues) {
    try {
      if (isEdit && subjectId) {
        // Pass ID separately because 'data' doesn't have it
        await updateSubjectMutation.mutateAsync({ id: subjectId, data })
        toast.success('Subject updated successfully.')
      } else {
        await createSubjectMutation.mutateAsync(data)
        toast.success('Subject created successfully.')
      }
      if (isVerificationMode && onApprove) {
        await onApprove(data)
        return
      }
      navigate({ to: '/subjects' })
    } catch (error) {
      toast.error(`Failed to save subject.`)
    }
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
                    min={1}
                    max={8}
                    placeholder='e.g., 6'
                    {...field}
                    value={typeof field.value === 'number' ? field.value : 6}
                    onChange={(e) => field.onChange(e.currentTarget.valueAsNumber)}
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

          <div className='flex items-center justify-between pt-4'>
            <Button
              variant='outline'
              type='button'
              onClick={() => navigate({ to: '/subjects' })}
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
                  'Create Subject'
                )}
              </Button>
              {isVerificationMode && (
                <>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => onApprove?.(form.getValues())}
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
