// src/pages/modules/components/modules-mutate-drawer.tsx
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createModule, updateModule, uploadModuleFile } from '@/lib/content-hooks'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Module } from '../data/schema'
import { useModules } from './modules-provider'
import { useEffect, useState } from 'react'
import { Loader2, UploadCloud, FileCheck } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

type ModuleMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Module
  onSuccess?: () => void
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  subject_id: z.string().min(1, 'Subject is required.'),
  purpose: z.string().nullish(), 
  bloom_level: z.string().nullish(),
  // --- THIS IS THE FIX ---
  // We use z.number() instead of z.coerce.number() because the
  // onChange handler is already converting the value to a number or null.
  estimated_time: z.number().nullish(), 
  // --- END FIX ---
  material_url: z.string().url('Invalid URL').nullish(),
})

type ModuleForm = z.infer<typeof formSchema>

// List of Bloom's levels
const bloomLevels = [
  { label: 'Remembering', value: 'remembering' },
  { label: 'Understanding', value: 'understanding' },
  { label: 'Applying', value: 'applying' },
  { label: 'Analyzing', value: 'analyzing' },
  { label: 'Evaluating', value: 'evaluating' },
  { label: 'Creating', value: 'creating' },
]

export function ModulesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ModuleMutateDrawerProps) {
  const isEdit = !!currentRow
  const { subjects, isLoadingSubjects, loadModules } = useModules()
  const [isUploading, setIsUploading] = useState(false)

  const subjectOptions = subjects.map((s) => ({
    label: s.subject_name,
    value: s.subject_id,
  }))

  const form = useForm<ModuleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject_id: '',
      purpose: null,
      bloom_level: null,
      estimated_time: null,
      material_url: null,
    },
  })

  // Reset form when currentRow changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        // Coalesce all potentially null/undefined values to the form's expected type
        form.reset({
          title: currentRow.title || '',
          subject_id: currentRow.subject_id || '',
          purpose: currentRow.purpose || null,
          bloom_level: currentRow.bloom_level || null,
          estimated_time: currentRow.estimated_time || null,
          material_url: currentRow.material_url || null,
        })
      } else {
        // Reset to the base default values
        form.reset({
          title: '',
          subject_id: '',
          purpose: null,
          bloom_level: null,
          estimated_time: null,
          material_url: null,
        })
      }
    }
  }, [open, currentRow, isEdit, form]) 

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.')
      return
    }

    setIsUploading(true)
    toast.loading('Uploading file...')
    try {
      const res = await uploadModuleFile(file)
      form.setValue('material_url', res.file_url, { shouldValidate: true })
      toast.success('File uploaded successfully!')
    } catch (err) {
      toast.error('File upload failed.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: ModuleForm) => {
    try {
      const payload = {
        ...data,
        material_type: data.material_url ? 'reading' : null,
      }

      if (isEdit && currentRow?.id) {
        // UPDATE
        await updateModule(currentRow.id, payload)
        toast.success(`Module "${data.title}" has been updated.`)
      } else {
        // CREATE
        await createModule(payload)
        toast.success(`Module "${data.title}" has been created.`)
      }

      form.reset()
      onOpenChange(false)
      loadModules() // Refresh the table
    } catch (err: any) {
      console.error('Error saving module:', err)
      toast.error(err.response?.data?.detail || 'Something went wrong.')
    }
  }

  const materialUrl = form.watch('material_url')

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
          <SheetTitle>{isEdit ? 'Edit Material' : 'Add New Material'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the material details.'
              : 'Add a new material to the system.'}{' '}
            Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='module-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Introduction to Theories'
                      {...field}
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
                  <SelectDropdown
                    defaultValue={field.value || undefined} // Handle '' for placeholder
                    onValueChange={field.onChange}
                    placeholder='Select a subject'
                    items={subjectOptions}
                    isPending={isLoadingSubjects}
                    isControlled={true}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='purpose'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose (Learning Objective)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='e.g., Understand the core tenets of...'
                      {...field}
                      value={field.value || ''} // Handle null for display
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='bloom_level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bloom's Level</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value || undefined} // Handle null
                      onValueChange={field.onChange}
                      placeholder='Select a level'
                      items={bloomLevels}
                      isControlled={true}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='estimated_time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Time (Minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        value={field.value ?? ''} // Use ?? to correctly handle 0
                        onChange={(e) => {
                          // Convert "" back to null
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

            <FormItem>
              <FormLabel>Module File (PDF)</FormLabel>
              <FormControl>
                <Button
                  variant='outline'
                  asChild
                  className='w-full'
                  disabled={isUploading}
                >
                  <label htmlFor='file-upload' className='cursor-pointer'>
                    {isUploading ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : materialUrl ? (
                      <FileCheck className='mr-2 h-4 w-4 text-green-500' />
                    ) : (
                      <UploadCloud className='mr-2 h-4 w-4' />
                    )}
                    {materialUrl ? 'Change PDF File' : 'Upload PDF'}
                    <input
                      id='file-upload'
                      type='file'
                      className='sr-only'
                      onChange={handleFileChange}
                      accept='.pdf'
                      disabled={isUploading}
                    />
                  </label>
                </Button>
              </FormControl>
              <FormDescription>
                {materialUrl
                  ? 'File uploaded. You can now generate AI content.'
                  : 'Upload the PDF material for this module.'}
              </FormDescription>
              {/* This FormField is just for displaying the URL error */}
              <FormField
                control={form.control}
                name='material_url'
                render={() => <FormMessage />}
              />
            </FormItem>
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            form='module-form'
            type='submit'
            disabled={
              form.formState.isSubmitting || isUploading
            }
          >
            {form.formState.isSubmitting ? (
              <Loader2 className='animate-spin' />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Module'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}