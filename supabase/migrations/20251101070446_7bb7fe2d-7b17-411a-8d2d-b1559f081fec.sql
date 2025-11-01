-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own playlists" ON public.playlists;

-- Create new policy that allows users to see their own playlists OR admin playlists
CREATE POLICY "Users can view their own and admin playlists" 
ON public.playlists 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.has_role(user_id, 'admin'::app_role)
);