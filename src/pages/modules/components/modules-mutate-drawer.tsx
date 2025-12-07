import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Loader2,
  FileUp,
  FileText,
  CheckCircle2,
  File as FileIcon,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { getModule, uploadModuleMaterial } from '@/lib/modules-hooks'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
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
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { moduleFormSchema, ModuleFormValues } from '../data/schema'
import { useModules } from './modules-provider'

interface ModuleMutateFormProps {
  moduleId?: string
  isVerificationMode?: boolean
  onApprove?: (data: ModuleFormValues) => void
  onReject?: () => void
  activeTab?: string
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
  activeTab = 'general',
}: ModuleMutateFormProps) {
  const {
    createModuleMutation,
    updateModuleMutation,
    subjects,
    isLoadingSubjects,
  } = useModules()
  const navigate = useNavigate()
  const isEdit = !!moduleId

  const [isUploading, setIsUploading] = useState(false)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)

  const form = useForm<z.input<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      purpose: '',
      bloom_levels: [],
      subject_id: '',
      material_url: '',
      content: '',
      input_type: 'pdf',
      is_verified: false,
    },
  })

  const inputType = form.watch('input_type')
  const materialUrl = form.watch('material_url')
  const contentText = form.watch('content')
  const watchedBloomLevels = form.watch('bloom_levels') ?? []

  const isQuestionOnly =
    watchedBloomLevels.length > 0 &&
    watchedBloomLevels.every((l) => l === 'remembering')

  // Load Data
  useEffect(() => {
    if (isEdit && moduleId) {
      getModule(moduleId)
        .then((data) => {
          form.reset({
            title: data.title || '',
            purpose: data.purpose || '',
            bloom_levels: Array.isArray(data.bloom_levels)
              ? data.bloom_levels
              : data.bloom_level
                ? [data.bloom_level]
                : [],
            subject_id: data.subject_id || '',
            material_url: data.material_url || '',
            content: data.content || '',
            // Map input type. Default to 'pdf' if a URL exists.
            input_type:
              (data.input_type === 'url' ? 'pdf' : data.input_type) ||
              (data.material_url ? 'pdf' : 'text'),
            is_verified: !!data.is_verified,
          })

          if (data.material_url) {
            setCurrentFileName('Attached PDF Document')
          }
        })
        .catch(() => toast.error('Could not load module'))
    }
  }, [isEdit, moduleId, form])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.')
      return
    }

    setIsUploading(true)
    toast.loading('Uploading PDF to Cloud...')

    try {
      const res = await uploadModuleMaterial(file)
      // Save the Cloudinary URL
      form.setValue('material_url', res.file_url, {
        shouldDirty: true,
        shouldValidate: true,
      })
      setCurrentFileName(file.name)
      toast.dismiss()
      toast.success('PDF uploaded successfully!')
    } catch (err) {
      toast.dismiss()
      toast.error('Upload failed. Check your connection.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit: SubmitHandler<z.input<typeof moduleFormSchema>> = async (
    data
  ) => {
    try {
      const payload = { ...data }

      // Clean up fields based on type
      if (payload.input_type === 'pdf') {
        payload.content = ''
      } else {
        payload.material_url = ''
      }

      // Backend compatibility
      const dataToSend = {
        ...payload,
        bloom_levels: payload.bloom_levels ?? [],
        bloom_level: payload.bloom_levels?.[0] || 'remembering',
      }

      // Force verification to false unless specifically approved in verification mode
      if (!isVerificationMode) {
        dataToSend.is_verified = false
      }

      if (isEdit && moduleId) {
        await updateModuleMutation.mutateAsync({
          id: moduleId,
          data: dataToSend,
        })
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
      <div className='flex h-60 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    )
  }

  return (
    <div className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='bg-white'>
          <div className='min-h-[400px] p-6'>
            {/* TAB 1: GENERAL DETAILS */}
            <div
              className={
                activeTab === 'general'
                  ? 'animate-fade-in-up mx-auto block max-w-2xl space-y-6'
                  : 'hidden'
              }
            >
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Module Overview
                </h2>
                <p className='mb-6 text-sm text-gray-500'>
                  Define the core metadata for this learning module.
                </p>
              </div>

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Hotel Management Basics'
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
                    <FormLabel>Purpose / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='What is the learning goal of this module?'
                        className='min-h-[120px]'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* [REMOVED] is_verified Checkbox */}
            </div>

            {/* TAB 2: CONTENT & SETTINGS */}
            <div
              className={
                activeTab === 'content'
                  ? 'animate-fade-in-up mx-auto block max-w-3xl space-y-6'
                  : 'hidden'
              }
            >
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Learning Material
                </h2>
                <p className='mb-6 text-sm text-gray-500'>
                  Configure the educational content and taxonomy levels.
                </p>
              </div>

              {/* Bloom Levels */}
              <FormField
                control={form.control}
                name='bloom_levels'
                render={({ field: _ }) => (
                  <FormItem className='rounded-lg border bg-gray-50 p-4'>
                    <div className='mb-3'>
                      <FormLabel className='text-base'>
                        Bloom's Taxonomy Levels
                      </FormLabel>
                      <FormDescription>
                        Select the cognitive levels addressed by this module.
                      </FormDescription>
                    </div>
                    <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                      {BLOOM_LEVELS.map((level) => (
                        <FormField
                          key={level}
                          control={form.control}
                          name='bloom_levels'
                          render={({ field: innerField }) => (
                            <FormItem
                              key={level}
                              className='flex flex-row items-center space-y-0 space-x-2 rounded border border-gray-200 bg-white p-2'
                            >
                              <FormControl>
                                <Checkbox
                                  checked={(innerField.value ?? []).includes(
                                    level
                                  )}
                                  onCheckedChange={(checked) => {
                                    const current = innerField.value ?? []
                                    return checked
                                      ? innerField.onChange([...current, level])
                                      : innerField.onChange(
                                          current.filter(
                                            (value) => value !== level
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='cursor-pointer text-sm font-normal capitalize'>
                                {level}
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

              {/* Input Type Toggle */}
              <FormField
                control={form.control}
                name='input_type'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel>Material Type</FormLabel>
                    <FormControl>
                      <div className='flex space-x-4'>
                        <div
                          onClick={() => field.onChange('pdf')}
                          className={`flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                            field.value === 'pdf'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FileUp className='h-6 w-6' />
                          <span className='text-sm font-medium'>
                            PDF Upload
                          </span>
                        </div>
                        <div
                          onClick={() => field.onChange('text')}
                          className={`flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                            field.value === 'text'
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FileText className='h-6 w-6' />
                          <span className='text-sm font-medium'>
                            Text Content
                          </span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Upload Area */}
              {inputType === 'pdf' && (
                <div className='animate-fade-in-up'>
                  <FormField
                    control={form.control}
                    name='material_url'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload PDF Material</FormLabel>
                        <div className='relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6'>
                          {field.value ? (
                            <div className='flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700'>
                              <FileIcon className='h-4 w-4' />
                              <span className='max-w-[200px] truncate'>
                                {currentFileName || 'Attached PDF'}
                              </span>
                              <CheckCircle2 className='ml-1 h-4 w-4' />
                            </div>
                          ) : (
                            <div className='flex flex-col items-center gap-2 text-gray-400'>
                              <FileUp className='h-10 w-10 opacity-30' />
                              <span className='text-xs'>No file selected</span>
                            </div>
                          )}

                          <div className='w-full max-w-xs'>
                            <Button
                              variant='outline'
                              className='relative w-full cursor-pointer'
                              disabled={isUploading || isQuestionOnly}
                              asChild
                            >
                              <label>
                                {isUploading ? (
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                  <FileUp className='mr-2 h-4 w-4' />
                                )}
                                {field.value ? 'Change PDF' : 'Select PDF'}
                                <input
                                  type='file'
                                  className='hidden'
                                  accept='application/pdf'
                                  onChange={handleFileUpload}
                                  disabled={isUploading || isQuestionOnly}
                                />
                              </label>
                            </Button>
                          </div>
                          {isQuestionOnly && (
                            <p className='text-center text-xs text-amber-600'>
                              Upload disabled for 'Remembering' level.
                            </p>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Text Area */}
              {inputType === 'text' && (
                <div className='animate-fade-in-up'>
                  <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Content</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            placeholder='Enter the full text content here... '
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* TAB 3: VIEW MATERIAL (FIXED) */}
            <div
              className={
                activeTab === 'view'
                  ? 'animate-fade-in-up block h-full w-full'
                  : 'hidden'
              }
            >
              <div className='flex h-full flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Material Preview
                  </h2>

                  {/* [FIX] Add 'Open in New Tab' Button for Robustness */}
                  {inputType === 'pdf' && materialUrl && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => window.open(materialUrl, '_blank')}
                    >
                      <ExternalLink className='mr-2 h-4 w-4' /> Open in New Tab
                    </Button>
                  )}
                </div>

                {inputType === 'pdf' ? (
                  materialUrl ? (
                    // Changed from fixed h-[600px] to h-[85vh] for maximum height viewing
                    <div className='relative h-[85vh] flex-1 overflow-hidden rounded-lg border bg-gray-100'>
                      {/* [FIX] Cloudinary Viewer usually needs no special params */}
                      <iframe
                        src={materialUrl}
                        className='h-full w-full'
                        title='PDF Viewer'
                      />
                    </div>
                  ) : (
                    <div className='flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-gray-400'>
                      <FileIcon className='mb-2 h-12 w-12 opacity-20' />
                      <p>No PDF file uploaded yet.</p>
                    </div>
                  )
                ) : contentText ? (
                  // Changed from fixed h-[600px] to h-[85vh] for maximum height viewing
                  <div className='h-[85vh] flex-1 overflow-y-auto rounded-lg border bg-gray-50 p-6 text-sm'>
                    <div
                      className='prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: contentText }}
                    />
                    <style>{`
                      .prose ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
                      .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
                      .prose h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem; }
                      .prose h2 { font-size: 1.25rem; font-weight: bold; margin: 0.75rem 0 0.5rem; }
                      .prose blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; margin: 0.5rem 0; color: #6b7280; font-style: italic; }
                      .prose p { margin: 0.5rem 0; }
                    `}</style>
                  </div>
                ) : (
                  <div className='flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-gray-400'>
                    <FileText className='mb-2 h-12 w-12 opacity-20' />
                    <p>No text content added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 p-6 sm:flex-row'>
            <Button
              variant='ghost'
              type='button'
              onClick={() => navigate({ to: '/modules' })}
            >
              <ArrowLeft className='mr-2 h-4 w-4' /> Back to List
            </Button>

            <div className='flex w-full items-center gap-3 sm:w-auto'>
              {isVerificationMode ? (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    className='flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:flex-none'
                    onClick={() => onReject?.()}
                  >
                    <XCircle size={16} />
                    Reject
                  </Button>

                  <Button
                    type='button'
                    variant='secondary'
                    className='flex-1 border border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700 sm:flex-none'
                    onClick={() =>
                      onApprove?.(moduleFormSchema.parse(form.getValues()))
                    }
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                </>
              ) : (
                <Button
                  type='submit'
                  className='min-w-[140px] flex-1 sm:flex-none'
                  disabled={form.formState.isSubmitting}
                >
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
              )}
            </div>
          </div>
        </form>
      </Form>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
