-- Create app_requests table to store form submissions
CREATE TABLE public.app_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  app_name TEXT NOT NULL,
  description TEXT NOT NULL,
  use_cases TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_requests ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all requests
CREATE POLICY "Admins can view all app requests"
ON public.app_requests
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to update requests
CREATE POLICY "Admins can update app requests"
ON public.app_requests
FOR UPDATE
USING (is_admin(auth.uid()));

-- Allow anyone to insert requests (for the form submission)
CREATE POLICY "Anyone can submit app requests"
ON public.app_requests
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_app_requests_updated_at
BEFORE UPDATE ON public.app_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_app_requests_status ON public.app_requests(status);
CREATE INDEX idx_app_requests_created_at ON public.app_requests(created_at DESC);