import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createSubject, updateSubject } from '@/lib/subjects-hooks'
import { type Subject } from '../data/schema'
import { useSubjects } from './subjects-provider'

type SubjectMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Subject | null
}

// Define form schema to match inputs
const formSchema = z.object({
  subject_id: z.string().min(1, 'Subject ID is required.'),
  subject_name: z.string().min(1, 'Subject name is required.'),
  pqf_level: z.number().nullable().optional(),
  active_tos_id: z.string().optional(),
  description: z.string().optional(),
  icon_name: z.string().optional(),
  icon_color: z.string().optional(),
  icon_bg_color: z.string().optional(),
  card_bg_color: z.string().optional(),
})

type SubjectFormValues = z.infer<typeof formSchema>

export function SubjectsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: SubjectMutateDrawerProps) {
  const isEdit = !!currentRow
  const { loadSubjects } = useSubjects()

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject_id: '',
      subject_name: '',
      pqf_level: null,
      active_tos_id: '',
      description: '',
      icon_name: 'brain',
      icon_color: '#30C49F',
      icon_bg_color: '#E6F7F3',
      card_bg_color: '#E6F7F3',
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          subject_id: currentRow.subject_id,
          subject_name: currentRow.subject_name,
          pqf_level: currentRow.pqf_level ?? null,
          active_tos_id: currentRow.active_tos_id || '',
          description: currentRow.description || '',
          icon_name: currentRow.icon_name || 'brain',
          icon_color: currentRow.icon_color || '#30C49F',
          icon_bg_color: currentRow.icon_bg_color || '#E6F7F3',
          card_bg_color: currentRow.card_bg_color || '#E6F7F3',
        })
      } else {
        form.reset({
          subject_id: '',
          subject_name: '',
          pqf_level: null,
          active_tos_id: '',
          description: '',
          icon_name: 'brain',
          icon_color: '#30C49F',
          icon_bg_color: '#E6F7F3',
          card_bg_color: '#E6F7F3',
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      if (isEdit && currentRow) {
        // Update: Remove ID from payload and ensure required fields are defined
        const { subject_id, ...updateData } = data
        const payload = {
          subject_name: updateData.subject_name,
          pqf_level: updateData.pqf_level ?? null,
          active_tos_id: updateData.active_tos_id ?? null,
          description: updateData.description ?? undefined,
          icon_name: updateData.icon_name ?? 'brain',
          icon_color: updateData.icon_color ?? '#30C49F',
          icon_bg_color: updateData.icon_bg_color ?? '#E6F7F3',
          card_bg_color: updateData.card_bg_color ?? '#E6F7F3',
        }
        await updateSubject(currentRow.subject_id, payload)
        toast.success(`Subject "${data.subject_name}" has been updated.`)
      } else {
        // Create: ensure all required Subject fields are present with defaults
        const payload = {
          subject_id: data.subject_id,
          subject_name: data.subject_name,
          pqf_level: data.pqf_level ?? null,
          active_tos_id: data.active_tos_id ?? null,
          description: data.description ?? undefined,
          icon_name: data.icon_name ?? 'brain',
          icon_color: data.icon_color ?? '#30C49F',
          icon_bg_color: data.icon_bg_color ?? '#E6F7F3',
          card_bg_color: data.card_bg_color ?? '#E6F7F3',
        } as Subject
        await createSubject(payload)
        toast.success(`Subject "${data.subject_name}" has been created.`)
      }
      
      form.reset()
      onOpenChange(false)
      loadSubjects()
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
        if (!v) form.reset()
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-lg overflow-y-auto'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {isEdit ? 'Edit Subject' : 'Add New Subject'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the subject details and styling.'
              : 'Create a new subject. The ID acts as the unique code.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 py-4'
          >
            {/* --- Group 1: Basic Info --- */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AB_PSYCH" {...field} disabled={isEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pqf_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PQF Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 7"
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
              </div>

              <FormField
                control={form.control}
                name="subject_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Abnormal Psychology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the subject..." 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active_tos_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active TOS ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. demo_tos_psych" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- Group 2: Visual Styling --- */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Visual Styling</h3>
              
              <FormField
                control={form.control}
                name="icon_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. brain, baby-carriage" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription className="text-xs">Lucide icon name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="icon_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Color</FormLabel>
                      <div className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded border flex-shrink-0" style={{ backgroundColor: field.value || '#fff' }} />
                        <FormControl>
                          <Input placeholder="#HEX" {...field} value={field.value || ''} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon_bg_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon BG</FormLabel>
                      <div className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded border flex-shrink-0" style={{ backgroundColor: field.value || '#fff' }} />
                        <FormControl>
                          <Input placeholder="#HEX" {...field} value={field.value || ''} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="card_bg_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card BG</FormLabel>
                      <div className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded border flex-shrink-0" style={{ backgroundColor: field.value || '#fff' }} />
                        <FormControl>
                          <Input placeholder="#HEX" {...field} value={field.value || ''} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  'Save Changes'
                ) : (
                  'Create Subject'
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}