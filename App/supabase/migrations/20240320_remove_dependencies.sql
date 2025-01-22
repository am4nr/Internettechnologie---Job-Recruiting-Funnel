-- Remove the table and its references
DROP TABLE IF EXISTS public.field_dependencies CASCADE;

-- Remove any related indexes or constraints
DO $$
BEGIN
    -- Drop foreign keys if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%field_dependencies%'
    ) THEN
        ALTER TABLE public.form_fields 
        DROP CONSTRAINT IF EXISTS field_dependencies_source_field_id_fkey,
        DROP CONSTRAINT IF EXISTS field_dependencies_target_field_id_fkey;
    END IF;
END$$;

-- Remove columns from form_fields if they exist
ALTER TABLE public.form_fields 
    DROP COLUMN IF EXISTS is_conditional,
    DROP COLUMN IF EXISTS condition_logic; 