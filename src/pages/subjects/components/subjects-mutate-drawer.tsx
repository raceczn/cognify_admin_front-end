// src/pages/subjects/components/subjects-mutate-drawer.tsx
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSubject, updateSubject } from '@/lib/subjects-hooks'
import { toast } from 'sonner'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { type Subject, subjectSchema, subjectBaseSchema } from '../data/schema'
import { useSubjects } from './subjects-provider'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

type SubjectMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Subject
  onSuccess?: () => void
}

// Form schema for create/edit
const formSchema = z.object({
  subject_id: z.string().min(1, 'Subject ID is required.'),
  subject_name: z.string().min(1, 'Subject name is required.'),
  pqf_level: z.coerce.number().optional().nullable(),
  // active_tos_id is omitted for simplicity
})

type SubjectForm = z.infer<typeof formSchema>

export function SubjectsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: SubjectMutateDrawerProps) {
  const isEdit = !!currentRow
  const { loadSubjects } = useSubjects()

  const form = useForm<SubjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject_id: '',
      subject_name: '',
      pqf_level: null,
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset(currentRow)
      } else {
        form.reset({
          subject_id: '',
          subject_name: '',
          pqf_level: null,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (data: SubjectForm) => {
    try {
      if (isEdit && currentRow?.subject_id) {
        // UPDATE
        // Backend 'update' takes SubjectBase (no subject_id in payload)
        const payload = subjectBaseSchema.parse(data)
        await updateSubject(currentRow.subject_id, payload)
        toast.success(`Subject "${data.subject_name}" has been updated.`)
      } else {
        // CREATE
        // Backend 'create' takes full Subject (with subject_id in payload)
        const payload = subjectSchema.parse(data)
        await createSubject(payload)
        toast.success(`Subject "${data.subject_name}" has been created.`)
      }

      form.reset()
      onOpenChange(false)
      loadSubjects() // Refresh the table
    } catch (err: any) {
      console.error('Error saving subject:', err)
      toast.error(err.response?.data?.detail || 'Something went wrong.')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isEdit ? 'Edit Subject' : 'Add New Subject'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the subject details.'
              : 'Add a new subject to the system.'}{' '}
            Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='subject-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-1'
          >
            <FormField
              control={form.control}
              name='subject_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., subj_psych_101'
                      {...field}
                      disabled={isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='subject_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Introduction to Psychology'
                      {...field}
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
                  <FormLabel>PQF Level (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='e.g., 7'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === '' ? null : Number(val))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            form='subject-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className='animate-spin' />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Subject'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}