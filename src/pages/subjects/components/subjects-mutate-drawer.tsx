import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Control, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { 
  ArrowLeft, Loader2, Upload, Plus, Trash2, Layers, BookOpen, AlertCircle, CheckCircle2, Wand2 
} from 'lucide-react'
import { toast } from 'sonner'
import { getSubject, uploadSubjectImage } from '@/lib/subjects-hooks'
import { Button } from '@/components/ui/button'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SubjectFormValues, subjectFormSchema } from '../data/schema'
import { useSubjects } from './subjects-provider'

interface SubjectMutateFormProps {
  subjectId?: string
  isVerificationMode?: boolean
  onApprove?: (data: SubjectFormValues) => void
  onReject?: () => void
  activeTab?: string 
}

export function SubjectMutateForm({
  subjectId,
  isVerificationMode,
  onApprove,
  onReject,
  activeTab = 'general',
}: SubjectMutateFormProps) {
  const { createSubjectMutation, updateSubjectMutation } = useSubjects()
  const navigate = useNavigate()
  const isEdit = !!subjectId
  
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema) as any,
    mode: 'onChange',
    defaultValues: {
      title: '',
      pqf_level: 6,
      description: '',
      is_verified: false, // Default to false
      image_url: null,
      topics: [],
    },
  })

  const { fields: topicFields, append: appendTopic, remove: removeTopic } = useFieldArray({
    control: form.control,
    name: 'topics',
  })

  // --- VALIDATION: Watch Topics for Weight Calculation ---
  const watchedTopics = useWatch({ control: form.control, name: 'topics' }) || []
  const totalWeight = watchedTopics.reduce((sum, topic) => sum + (Number(topic.weight_percentage) || 0), 0)
  const isWeightValid = totalWeight === 100

  // --- SMART ALLOCATION LOGIC ---
  const handleSmartDistribute = () => {
    const currentTopics = form.getValues().topics || [];
    const count = currentTopics.length;

    if (count === 0) {
      toast.error("Add topics first before distributing weights.");
      return;
    }

    // Calculate base split and remainder
    const baseWeight = Math.floor(100 / count);
    const remainder = 100 % count;

    // Update form values
    currentTopics.forEach((_, index) => {
      // Distribute remainder to the first few items to ensure exact 100 sum
      const newWeight = index < remainder ? baseWeight + 1 : baseWeight;
      form.setValue(`topics.${index}.weight_percentage`, newWeight, { 
        shouldValidate: true, 
        shouldDirty: true 
      });
    });

    toast.success(`Smart allocated 100% across ${count} topics.`);
  };

  useEffect(() => {
    if (isEdit && subjectId) {
      getSubject(subjectId)
        .then((data) => {
          form.reset({
            title: data.title || '',
            pqf_level: typeof data.pqf_level === 'number' ? data.pqf_level : 6,
            description: data.description || '',
            is_verified: !!data.is_verified,
            image_url: data.image_url || null,
            topics: data.topics || [],
          })
          setImagePreview(data.image_url || null)
        })
        .catch(() => toast.error('Could not load subject'))
    }
  }, [isEdit, subjectId, form])

  async function onSubmit(data: SubjectFormValues) {
    const currentTotalWeight = data.topics?.reduce((sum, t) => sum + (Number(t.weight_percentage) || 0), 0) || 0;
    
    if (currentTotalWeight !== 100) {
      toast.error(`Total weight must be 100%. Currently: ${currentTotalWeight}%`)
      const tabTrigger = document.querySelector('[value="curriculum"]') as HTMLElement;
      if (tabTrigger) tabTrigger.click();
      return
    }

    try {
      // Force verification false unless approved in verification mode
      if (!isVerificationMode) {
        data.is_verified = false;
      }

      if (isEdit && subjectId) {
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
      toast.error('Failed to save subject.')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.')
      return
    }
    setIsUploading(true)
    toast.loading('Uploading subject image...')
    try {
      const res = await uploadSubjectImage(file)
      form.setValue('image_url', res.image_url, { shouldDirty: true, shouldValidate: true })
      setImagePreview(res.image_url)
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    } catch (err) {
      toast.dismiss()
      toast.error('Image upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='bg-white'>
          
          <div className="p-6 min-h-[400px]">
            
            {/* TAB 1: GENERAL */}
            <div className={activeTab === 'general' ? 'block animate-fade-in-up space-y-6 max-w-3xl mx-auto' : 'hidden'}>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500 mb-6">Define the core details of the subject.</p>
                </div>
                
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Title</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Psychometrics' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name='pqf_level'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PQF Level</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(Number(v))}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Level' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[6, 7].map((lvl) => (
                              <SelectItem key={lvl} value={String(lvl)}>Level {lvl}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='Brief summary of the subject...' 
                          className="min-h-[120px]"
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

            {/* TAB 2: CURRICULUM (SMART ALLOCATION ADDED) */}
            <div className={activeTab === 'curriculum' ? 'block animate-fade-in-up space-y-6 max-w-4xl mx-auto' : 'hidden'}>
                 <div className="flex flex-row items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Topics & Competencies</h2>
                      <p className="text-sm text-gray-500">Manage the educational content structure.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={handleSmartDistribute}
                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                        title="Evenly distribute 100% across all topics"
                      >
                        <Wand2 className="mr-2 h-4 w-4" /> Smart Distribute
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => appendTopic({ title: "New Topic", weight_percentage: 0, competencies: [] })}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Topic
                      </Button>
                    </div>
                  </div>

                  {/* WEIGHT VALIDATION INDICATOR */}
                  <Alert variant={isWeightValid ? "default" : "destructive"} className={`mb-6 transition-colors duration-300 ${isWeightValid ? 'bg-green-50 border-green-200 text-green-800' : ''}`}>
                    {isWeightValid ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle className={isWeightValid ? 'text-green-800' : ''}>
                      Total Weight: {totalWeight}%
                    </AlertTitle>
                    <AlertDescription className={isWeightValid ? 'text-green-700' : ''}>
                      {isWeightValid 
                        ? "Perfect! The total weight of all topics equals 100%." 
                        : `Total must be exactly 100%. Currently at ${totalWeight}%. Click "Smart Distribute" to fix automatically.`
                      }
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    {topicFields.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50">
                        No topics added yet. Click "Add Topic" to start.
                      </div>
                    )}

                    <Accordion type="multiple" className="w-full">
                      {topicFields.map((topic, index) => (
                        <AccordionItem key={topic.id} value={topic.id} className="border rounded-md px-4 mb-2 bg-white shadow-sm">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex flex-1 items-center justify-between mr-4">
                              <div className="flex items-center gap-3">
                                <Layers className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-gray-700">
                                  {form.watch(`topics.${index}.title`) || "Untitled Topic"}
                                </span>
                              </div>
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                !form.watch(`topics.${index}.weight_percentage`) 
                                  ? 'bg-red-50 text-red-600 border-red-100'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {form.watch(`topics.${index}.weight_percentage`)}% Weight
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-1 pt-2 pb-6">
                            <div className="space-y-6 pl-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`topics.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Topic Title</FormLabel>
                                      <FormControl><Input {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`topics.${index}.weight_percentage`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Weight (%)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          {...field} 
                                          onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={form.control}
                                name={`topics.${index}.lecture_content`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lecture Content / Notes</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} value={field.value || ''} placeholder="Markdown content supported..." className="min-h-[80px]" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              <Separator />
                              <CompetenciesManager control={form.control} topicIndex={index} />

                              <div className="flex justify-end mt-4">
                                <Button 
                                  type="button" 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => removeTopic(index)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Remove Topic
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
            </div>

            {/* TAB 3: MEDIA */}
            <div className={activeTab === 'media' ? 'block animate-fade-in-up max-w-xl mx-auto text-center space-y-6 pt-6' : 'hidden'}>
                 <div>
                    <h2 className="text-lg font-semibold text-gray-900">Subject Cover Image</h2>
                    <p className="text-sm text-gray-500">Upload a visual representation for this subject.</p>
                  </div>

                  <div className='bg-gray-50 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200'>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt='Subject Preview'
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='text-gray-400 flex flex-col items-center gap-2'>
                        <BookOpen className="h-12 w-12 opacity-20" />
                        <span className='text-sm'>No image selected</span>
                      </div>
                    )}
                  </div>

                  <div className="max-w-xs mx-auto">
                    <Button
                      variant='outline'
                      className='relative w-full cursor-pointer'
                      disabled={isUploading}
                      asChild
                    >
                      <label>
                        {isUploading ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Upload className='mr-2 h-4 w-4' />
                        )}
                        {imagePreview ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type='file'
                          className='hidden'
                          accept='image/*'
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </label>
                    </Button>
                    <p className='text-muted-foreground mt-3 text-xs'>
                      Recommended: 1200x630px (JPG, PNG, WEBP). Max 5MB.
                    </p>
                  </div>
            </div>

          </div>

          <div className='bg-gray-50 border-t border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
             <Button
                variant='ghost'
                type='button'
                onClick={() => navigate({ to: '/subjects' })}
              >
                <ArrowLeft className='mr-2 h-4 w-4' /> Back to List
              </Button>

              <div className='flex items-center gap-3 w-full sm:w-auto'>
                {isVerificationMode && (
                  <>
                    <Button type='button' variant='outline' className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => onReject?.()}>
                      Reject
                    </Button>
                    <Button type='button' variant='secondary' className="flex-1 sm:flex-none" onClick={() => onApprove?.(form.getValues())}>
                      Approve
                    </Button>
                  </>
                )}
                
                <Button type='submit' className="flex-1 sm:flex-none min-w-[140px]" disabled={form.formState.isSubmitting}>
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

function CompetenciesManager({ control, topicIndex }: { control: Control<SubjectFormValues>, topicIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `topics.${topicIndex}.competencies`,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
        <h4 className="text-sm font-semibold text-gray-700 px-2">Competencies ({fields.length})</h4>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 hover:bg-white hover:shadow-sm"
          onClick={() => append({ 
            code: "", 
            description: "", 
            allocated_items: 0, 
            target_difficulty: "Moderate", 
            target_bloom_level: "remembering" 
          })}
        >
          <Plus className="mr-2 h-3 w-3 text-blue-600" /> Add Competency
        </Button>
      </div>

      <div className="grid gap-3">
        {fields.map((comp, k) => (
          <div key={comp.id} className="grid grid-cols-12 gap-2 items-start border rounded-md p-3 bg-white hover:border-gray-300 transition-colors">
            <div className="col-span-12 sm:col-span-2">
              <FormField
                control={control}
                name={`topics.${topicIndex}.competencies.${k}.code`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Code" {...field} className="h-9 text-xs font-mono" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="col-span-12 sm:col-span-6">
              <FormField
                control={control}
                name={`topics.${topicIndex}.competencies.${k}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Description..." {...field} className="h-9 text-xs" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
               <FormField
                control={control}
                name={`topics.${topicIndex}.competencies.${k}.target_difficulty`}
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Diff" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Difficult">Difficult</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-4 sm:col-span-1">
               <FormField
                control={control}
                name={`topics.${topicIndex}.competencies.${k}.allocated_items`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="#" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="h-9 text-xs px-1 text-center" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => remove(k)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}