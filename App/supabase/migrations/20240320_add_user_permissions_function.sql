-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS TABLE (permissions app_permission[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ARRAY_AGG(DISTINCT rp.permission)::app_permission[]
  FROM user_roles ur
  JOIN role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = $1;
END;
$$;

-- Drop existing triggers and function
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
DROP TRIGGER IF EXISTS on_role_permission_change ON public.role_permissions;
DROP FUNCTION IF EXISTS public.update_user_claims() CASCADE;
DROP FUNCTION IF EXISTS public.get_applications() CASCADE;

-- Create the corrected function for user claims
CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_user_id uuid;
    user_role app_role;
BEGIN
    -- Determine which trigger called this function and set affected_user_id
    IF TG_TABLE_NAME = 'user_roles' THEN
        affected_user_id := NEW.user_id;
        user_role := NEW.role;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
        -- When role permissions change, we need to update all users with that role
        user_role := NEW.role;
        -- This will be handled in a loop below
    END IF;

    IF TG_TABLE_NAME = 'user_roles' THEN
        -- Single user update
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_build_object(
            'role', user_role,
            'permissions', (
                SELECT array_agg(DISTINCT rp.permission::text)
                FROM role_permissions rp
                WHERE rp.role = user_role
            )
        )
        WHERE id = affected_user_id;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
        -- Update all users with the affected role
        UPDATE auth.users u
        SET raw_app_meta_data = jsonb_build_object(
            'role', user_role,
            'permissions', (
                SELECT array_agg(DISTINCT rp.permission::text)
                FROM role_permissions rp
                WHERE rp.role = user_role
            )
        )
        FROM user_roles ur
        WHERE ur.user_id = u.id AND ur.role = user_role;
    END IF;

    RETURN NEW;
END;
$$;

-- Create the applications function with RLS
CREATE OR REPLACE FUNCTION public.get_applications()
RETURNS TABLE (
    id uuid,
    created_at timestamptz,
    user_id uuid,
    job_id uuid,
    status text,
    resume_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user has permission to read all applications
    IF EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = auth.uid()
        AND rp.permission = 'applications.read_all'
    ) THEN
        -- Return all applications
        RETURN QUERY
        SELECT a.id, a.created_at, a.user_id, a.job_id, a.status::text, a.resume_url
        FROM applications a;
    ELSE
        -- Return only user's own applications
        RETURN QUERY
        SELECT a.id, a.created_at, a.user_id, a.job_id, a.status::text, a.resume_url
        FROM applications a
        WHERE a.user_id = auth.uid();
    END IF;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER on_user_role_change
    AFTER INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

CREATE TRIGGER on_role_permission_change
    AFTER INSERT OR UPDATE ON public.role_permissions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

-- Insert default role permissions if they don't exist
INSERT INTO role_permissions (role, permission)
VALUES 
    ('admin', 'applications.read_all'),
    ('admin', 'applications.read_own'),
    ('recruiter', 'applications.read_all'),
    ('recruiter', 'applications.read_own'),
    ('applicant', 'applications.read_own')
ON CONFLICT (role, permission) DO NOTHING; 