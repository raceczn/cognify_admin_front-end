import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  let errMsg = 'Something went wrong!'

  if (error instanceof AxiosError) {
    const data = error.response?.data
    const detail = data?.detail ?? data?.title ?? data?.message
    if (typeof detail === 'string') {
      errMsg = detail
    } else if (Array.isArray(detail)) {
      errMsg = detail.map((d: any) => d?.msg || d?.message || String(d)).join('; ')
    } else if (detail && typeof detail === 'object') {
      errMsg = (detail as any).msg || JSON.stringify(detail)
    } else {
      errMsg = error.message || errMsg
    }
  }

  toast.error(errMsg)
}
