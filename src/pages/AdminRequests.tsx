import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';

interface AppRequest {
  id: string;
  name: string;
  email: string;
  organization: string;
  app_name: string;
  description: string;
  use_cases: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadRequests();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || !data || data.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('app_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('app_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      ));

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">App Requests</h1>
              <p className="text-muted-foreground">
                Manage incoming feature and app requests
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {requests.length} Total
            </Badge>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Icons.Inbox className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
                <p className="text-muted-foreground">
                  App requests will appear here when users submit them
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">{request.app_name}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Icons.User className="h-4 w-4" />
                            {request.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.Mail className="h-4 w-4" />
                            {request.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.Building2 className="h-4 w-4" />
                            {request.organization}
                          </span>
                        </CardDescription>
                      </div>
                      <Select 
                        value={request.status} 
                        onValueChange={(value) => updateStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">{request.description}</p>
                    </div>
                    {request.use_cases && (
                      <div>
                        <h4 className="font-semibold mb-2">Use Cases</h4>
                        <p className="text-muted-foreground">{request.use_cases}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                      <span className="flex items-center gap-1">
                        <Icons.Calendar className="h-4 w-4" />
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Clock className="h-4 w-4" />
                        Updated: {new Date(request.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;