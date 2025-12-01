import { Plus, Loader2 } from "lucide-react"
import { columns } from "./components/modules-columns"
import { ModulesDataTable } from "./components/modules-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ModulesProvider, useModules } from "./components/modules-provider" 
import { Module } from "./data/schema" 
import { ModulesDialogs } from "./components/modules-dialogs" // <--- NEW IMPORT

// The page content is placed inside a wrapper component
function ModulesPageContent() {
  // Use data and setters from the provider
  const { 
    modules: data, // Use 'modules' from provider as 'data'
    isLoading, 
    setCurrentRow, 
    setOpen, 
  } = useModules()
  
  // Function to handle opening the drawer for creation
  const handleAddModule = () => {
    setCurrentRow(null) 
    setOpen('add')
  }

  // Function passed to the table columns for editing a row
  const handleEditModule = (module: Module) => {
    setCurrentRow(module)
    setOpen('edit')
  }
  
  // The delete handler should use the delete dialog
  const handleDeleteModule = (module: Module) => {
    setCurrentRow(module)
    setOpen('delete')
  }

  // Combine the columns and pass the edit/delete handlers.
  const moduleColumns = columns(handleEditModule, handleDeleteModule) 

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Modules</h2>
          <p className="text-muted-foreground">
            Manage learning materials, lectures, and resource files.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddModule}>
            <Plus className="mr-2 h-4 w-4" /> Add Module
          </Button>
        </div>
      </div>
      
      <Separator />

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>All Modules</CardTitle>
            <CardDescription>
              A list of all educational modules available in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ModulesDataTable columns={moduleColumns} data={data} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renders all dialogs/drawers based on provider state */}
      <ModulesDialogs />
    </div>
  )
}

// Export the main component wrapped in the Provider
export default function ModulesPage() {
    return (
        <ModulesProvider> 
            <ModulesPageContent />
        </ModulesProvider>
    )
}