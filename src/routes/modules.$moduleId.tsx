// src/routes/_authenticated/modules.$moduleId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ModuleMutatePage } from '@/pages/modules/ModuleMutatePage'

// This dynamic route handles both /modules/new (create) and /modules/{id} (edit)
export const Route = createFileRoute('/modules/$moduleId')({
  component: ModuleMutatePage,
  // Loader would be implemented here to fetch the Module data based on $moduleId if needed
})