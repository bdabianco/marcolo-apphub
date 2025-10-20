import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BudgetPlan {
  id: string;
  project_name: string;
  user_id: string;
  created_at: string;
  project_type: 'personal' | 'business';
}

interface ProjectContextType {
  projects: BudgetPlan[];
  currentProject: BudgetPlan | null;
  setCurrentProject: (project: BudgetPlan | null) => void;
  loadProjects: () => Promise<void>;
  createProject: (name: string, projectType: 'personal' | 'business') => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<BudgetPlan[]>([]);
  const [currentProject, setCurrentProjectState] = useState<BudgetPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProjectState(null);
      setLoading(false);
    }
  }, [user]);

  // Load saved project from localStorage
  useEffect(() => {
    if (projects.length > 0) {
      const savedProjectId = localStorage.getItem('currentProjectId');
      if (savedProjectId) {
        const saved = projects.find(p => p.id === savedProjectId);
        if (saved) {
          setCurrentProjectState(saved);
          return;
        }
      }
      // Default to first project
      setCurrentProjectState(projects[0]);
    }
  }, [projects]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budget_plans')
        .select('id, project_name, user_id, created_at, project_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []).map(p => ({
        ...p,
        project_type: (p.project_type || 'personal') as 'personal' | 'business'
      })));
    } catch (error: any) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentProject = (project: BudgetPlan | null) => {
    setCurrentProjectState(project);
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  };

  const createProject = async (name: string, projectType: 'personal' | 'business' = 'personal') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .insert({
          user_id: user.id,
          project_name: name,
          project_type: projectType,
          gross_income: 0,
          federal_tax: 0,
          provincial_tax: 0,
          cpp: 0,
          ei: 0,
          net_income: 0,
          expenses: [],
          total_expenses: 0,
          surplus: 0,
        })
        .select('id, project_name, user_id, created_at, project_type')
        .single();

      if (error) throw error;
      
      await loadProjects();
      if (data) {
        setCurrentProject({
          ...data,
          project_type: (data.project_type || 'personal') as 'personal' | 'business'
        });
      }
      toast.success('Project created successfully!');
    } catch (error: any) {
      toast.error('Failed to create project');
      console.error(error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadProjects();
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete project');
      console.error(error);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        loadProjects,
        createProject,
        deleteProject,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
