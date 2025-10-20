import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Plus, FolderOpen, Trash2, User, Briefcase } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ProjectSelector() {
  const { projects, currentProject, setCurrentProject, createProject, deleteProject } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectType, setProjectType] = useState<'personal' | 'business'>('personal');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim(), projectType);
    setNewProjectName('');
    setProjectType('personal');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setDeleteConfirmId(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="truncate">
                {currentProject?.project_name || 'Select Project'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[250px] bg-background z-50">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setCurrentProject(project)}
            >
              <span className="truncate flex-1">
                {project.project_name}
                {project.id === currentProject?.id && ' ✓'}
              </span>
              {projects.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(project.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new budget plan project (e.g., "2025 Plan", "2026 Budget")
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., 2025 Plan"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && projectType) handleCreateProject();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <RadioGroup value={projectType} onValueChange={(value) => setProjectType(value as 'personal' | 'business')}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer flex-1">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Personal</div>
                      <div className="text-xs text-muted-foreground">Individual budget planning</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Briefcase className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Business</div>
                      <div className="text-xs text-muted-foreground">Corporate budget planning</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This will also delete all associated cashflow records and savings goals. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteProject(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
