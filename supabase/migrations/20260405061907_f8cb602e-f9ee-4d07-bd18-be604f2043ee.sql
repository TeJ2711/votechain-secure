
-- 1. Fix profiles SELECT policy: restrict to own profile + admin/auditor
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and auditors can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));

-- 2. Fix user_roles: prevent non-admin INSERT (privilege escalation)
-- The existing "Admins can manage roles" ALL policy only matches admins.
-- We need a RESTRICTIVE policy to explicitly deny non-admin inserts.
CREATE POLICY "Only admins can insert roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix notifications INSERT: restrict to admins only
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Make avatars bucket private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- 5. Drop existing public avatar policy and add authenticated-only policy
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
