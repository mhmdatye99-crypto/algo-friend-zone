
-- Fix overly permissive INSERT policy
DROP POLICY "Authenticated users can insert notifications" ON public.notifications;

-- Only allow inserting notifications for OTHER users (not yourself)
CREATE POLICY "Users can create notifications for others"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() != user_id);
