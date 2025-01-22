-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_user_claims() CASCADE;

-- Create the fixed function for user claims
CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_user_id uuid;
    user_role app_role;
    user_permissions text[];
BEGIN
    -- Determine which trigger called this function and set affected_user_id
    IF TG_TABLE_NAME = 'user_roles' THEN
        affected_user_id := NEW.user_id;
        user_role := NEW.role;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
        -- When role permissions change, we need to update all users with that role
        user_role := NEW.role;
    END IF;

    -- Get permissions for the role
    SELECT array_agg(DISTINCT rp.permission::text)
    INTO user_permissions
    FROM role_permissions rp
    WHERE rp.role = user_role;

    IF TG_TABLE_NAME = 'user_roles' THEN
        -- Single user update
        UPDATE auth.users
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'role', user_role,
                'permissions', COALESCE(user_permissions, ARRAY[]::text[])
            )
        WHERE id = affected_user_id;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
        -- Update all users with the affected role
        UPDATE auth.users u
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'role', user_role,
                'permissions', COALESCE(user_permissions, ARRAY[]::text[])
            )
        FROM user_roles ur
        WHERE ur.user_id = u.id AND ur.role = user_role;
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate the triggers
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
DROP TRIGGER IF EXISTS on_role_permission_change ON public.role_permissions;

CREATE TRIGGER on_user_role_change
    AFTER INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

CREATE TRIGGER on_role_permission_change
    AFTER INSERT OR UPDATE ON public.role_permissions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

-- Update all existing users' claims
SELECT public.update_all_user_claims(); 