import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { createSubjectFromTos } from '@/lib/subjects-hooks'
import { usePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SubjectsPrimaryButtons() {
  const navigate = useNavigate()
  const { canCreateSubject } = usePermissions()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  if (!canCreateSubject) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={() =>
          navigate({
            to: '/subjects/$subjectId',
            params: { subjectId: 'new' },
          })
        }
      >
        <span>Add Subject</span>
        <Plus size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen(true)}
      >
        <span>Upload TOS</span>
        <Upload size={18} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload TOS (PDF/Word)</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label>Select File</Label>
              <Input
                type='file'
                accept='.pdf'
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!file) {
                    toast.error('Please select a file')
                    return
                  }
                  if (file.type !== 'application/pdf') {
                    toast.error('Only PDF files are allowed')
                    return
                  }
                  toast.loading('Uploading TOS...')
                  try {
                    await createSubjectFromTos(file)
                    toast.dismiss()
                    toast.success('Subject created from TOS')
                    setOpen(false)
                    setFile(null)
                    navigate({ to: '/subjects' })
                  } catch (err: any) {
                    toast.dismiss()
                    handleServerError(err)
                  }
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
