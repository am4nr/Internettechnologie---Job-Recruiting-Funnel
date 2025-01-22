

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_application_status" AS ENUM (
    'pending',
    'screening',
    'interview',
    'technical_assessment',
    'offer',
    'accepted',
    'rejected',
    'withdrawn'
);


ALTER TYPE "public"."app_application_status" OWNER TO "postgres";


CREATE TYPE "public"."app_job_status" AS ENUM (
    'draft',
    'published',
    'closed',
    'archived'
);


ALTER TYPE "public"."app_job_status" OWNER TO "postgres";


CREATE TYPE "public"."app_permission" AS ENUM (
    'profiles.create',
    'profiles.read_own',
    'profiles.read_all',
    'profiles.update_own',
    'profiles.update_all',
    'profiles.delete_own',
    'profiles.delete_all',
    'applications.create',
    'applications.read_own',
    'applications.read_all',
    'applications.update_own',
    'applications.update_all',
    'applications.delete_own',
    'applications.delete_all',
    'roles.create',
    'roles.read_all',
    'roles.update_all',
    'roles.delete_all',
    'permissions.create',
    'permissions.read_all',
    'permissions.update_all',
    'permissions.delete_all',
    'jobs.create',
    'jobs.read_all',
    'jobs.read_own',
    'jobs.update_all',
    'jobs.update_own',
    'jobs.delete_all',
    'jobs.publish',
    'applications.change_status',
    'forms.create',
    'forms.read_all',
    'forms.update_all',
    'forms.delete_all'
);


ALTER TYPE "public"."app_permission" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'recruiter',
    'applicant'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."form_field_type" AS ENUM (
    'checkbox',
    'file',
    'radio',
    'range',
    'rating',
    'select',
    'text',
    'textarea',
    'toggle'
);


ALTER TYPE "public"."form_field_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_application_feedback"("application_id" "uuid", "step_name" "text", "feedback_text" "text", "feedback_status" "text" DEFAULT 'pending'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_feedback jsonb;
BEGIN
    -- Create feedback object
    new_feedback = jsonb_build_object(
        'text', feedback_text,
        'status', feedback_status,
        'created_at', now(),
        'updated_at', now()
    );

    -- Update application feedback
    UPDATE applications
    SET feedback = jsonb_set(
        COALESCE(feedback, '{}'::jsonb),
        ARRAY[step_name],
        new_feedback
    )
    WHERE id = application_id;

    RETURN new_feedback;
END;
$$;


ALTER FUNCTION "public"."add_application_feedback"("application_id" "uuid", "step_name" "text", "feedback_text" "text", "feedback_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "resource_owner_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check if user has the requested permission through any of their roles
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = auth.uid()
        AND rp.permission = requested_permission
    )
    -- If resource_owner_id is provided, also allow if user owns the resource
    OR (
        resource_owner_id IS NOT NULL 
        AND resource_owner_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "resource_owner_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_job_status_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF OLD.status = 'draft' AND NEW.status = 'published' AND 
       NOT EXISTS (SELECT 1 FROM user_roles ur 
                  JOIN role_permissions rp ON ur.role = rp.role 
                  WHERE ur.user_id = auth.uid() 
                  AND rp.permission = 'jobs.publish') THEN
        RAISE EXCEPTION 'Unauthorized status transition';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_job_status_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clone_form_template"("template_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_template_id uuid;
    new_step_id uuid;
BEGIN
    -- Clone template
    INSERT INTO form_templates (
        title,
        description,
        created_by,
        meta
    )
    SELECT 
        title || ' (Copy)',
        description,
        auth.uid(),
        meta
    FROM form_templates
    WHERE id = template_id
    RETURNING id INTO new_template_id;

    -- Clone steps
    FOR new_step_id IN
        WITH new_steps AS (
            INSERT INTO form_steps (
                form_template_id,
                title,
                description,
                order_index,
                is_conditional,
                condition_logic
            )
            SELECT 
                new_template_id,
                title,
                description,
                order_index,
                is_conditional,
                condition_logic
            FROM form_steps
            WHERE form_template_id = template_id
            RETURNING id
        )
        SELECT id FROM new_steps
    LOOP
        -- Clone fields for each step
        INSERT INTO form_fields (
            step_id,
            type,
            label,
            description,
            order_index,
            is_required,
            is_conditional,
            condition_logic,
            options,
            validation_rules,
            ui_options
        )
        SELECT 
            new_step_id,
            type,
            label,
            description,
            order_index,
            is_required,
            is_conditional,
            condition_logic,
            options,
            validation_rules,
            ui_options
        FROM form_fields
        WHERE step_id IN (
            SELECT id FROM form_steps WHERE form_template_id = template_id
        );
    END LOOP;

    RETURN new_template_id;
END;
$$;


ALTER FUNCTION "public"."clone_form_template"("template_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_job_form"("job_id" "uuid", "schema" "json", "config" "json" DEFAULT NULL::"json") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
  form_id UUID;
BEGIN
  -- Check permissions
  IF NOT (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = auth.uid()
      AND rp.permission = 'jobs.manage'
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if job exists
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = job_id) THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  -- Create form
  INSERT INTO forms (
    title,
    description,
    schema,
    type,
    config,
    created_by
  ) VALUES (
    (SELECT title FROM jobs WHERE id = job_id) || ' Application Form',
    'Application form for job ' || job_id,
    schema,
    'job_application',
    COALESCE(config, '{}'::jsonb),
    auth.uid()
  )
  RETURNING id INTO form_id;

  -- Link form to job
  UPDATE jobs
  SET form_id = form_id
  WHERE id = job_id;

  -- Return form data
  SELECT json_build_object(
    'id', f.id,
    'title', f.title,
    'description', f.description,
    'schema', f.schema,
    'type', f.type,
    'config', f.config,
    'created_at', f.created_at,
    'updated_at', f.updated_at,
    'created_by', json_build_object(
      'id', u.id,
      'email', u.email
    )
  ) INTO result
  FROM forms f
  LEFT JOIN auth.users u ON f.created_by = u.id
  WHERE f.id = form_id;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_job_form"("job_id" "uuid", "schema" "json", "config" "json") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_activity"() RETURNS TABLE("id" "text", "type" "text", "description" "text", "user_email" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check if user has admin permissions
    IF NOT EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = auth.uid()
        AND rp.permission = 'applications.read_all'
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    -- Recent job postings
    SELECT 
        'job-' || j.id::text as id,
        'Job'::text as type,
        'New job posted: ' || j.title as description,
        up.email as user_email,
        j.created_at
    FROM jobs j
    LEFT JOIN user_profiles up ON up.id = j.created_by
    WHERE j.created_at > now() - interval '30 days'

    UNION ALL

    -- Recent applications
    SELECT 
        'app-' || a.id::text as id,
        'Application'::text as type,
        'New application received for ' || j.title as description,
        up.email as user_email,
        a.created_at
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN user_profiles up ON up.id = a.user_id
    WHERE a.created_at > now() - interval '30 days'

    UNION ALL

    -- Status changes
    SELECT 
        'status-' || a.id::text as id,
        'Status Change'::text as type,
        'Application status changed to ' || a.status || ' for ' || j.title as description,
        up.email as user_email,
        a.updated_at as created_at
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN user_profiles up ON up.id = a.user_id
    WHERE a.updated_at > now() - interval '30 days'
    AND a.status NOT IN ('pending')  -- Only show meaningful status changes

    ORDER BY created_at DESC
    LIMIT 20;
END;
$$;


ALTER FUNCTION "public"."get_admin_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_application_progress"("application_id" "uuid") RETURNS TABLE("total_steps" integer, "completed_steps" integer, "progress_percentage" numeric, "current_step" "text", "next_step" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM applications a 
     JOIN jobs j ON a.job_id = j.id 
     JOIN forms f ON j.form_id = f.id,
     jsonb_array_elements(f.schema::jsonb) 
     WHERE a.id = application_id)::integer as total_steps,
    (SELECT count(*) FROM applications a, jsonb_object_keys(a.form_data) 
     WHERE a.id = application_id)::integer as completed_steps,
    CASE 
      WHEN (SELECT count(*) FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            JOIN forms f ON j.form_id = f.id,
            jsonb_array_elements(f.schema::jsonb) 
            WHERE a.id = application_id) = 0 THEN 0
      ELSE (
        (SELECT count(*) FROM applications a, jsonb_object_keys(a.form_data) 
         WHERE a.id = application_id)::numeric /
        (SELECT count(*) FROM applications a 
         JOIN jobs j ON a.job_id = j.id 
         JOIN forms f ON j.form_id = f.id,
         jsonb_array_elements(f.schema::jsonb) 
         WHERE a.id = application_id)::numeric * 100
      )::numeric
    END as progress_percentage,
    NULL::text as current_step,
    NULL::text as next_step;
END;
$$;


ALTER FUNCTION "public"."get_application_progress"("application_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_application_summary"("application_id" "uuid") RETURNS TABLE("application_status" "public"."app_application_status", "days_since_submission" integer, "last_update" timestamp with time zone, "total_submissions" integer, "is_complete" boolean, "feedback_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.status as application_status,
    EXTRACT(DAY FROM now() - a.created_at)::integer as days_since_submission,
    a.updated_at as last_update,
    1 as total_submissions,
    (a.status IN ('accepted', 'rejected', 'withdrawn'))::boolean as is_complete,
    CASE WHEN a.feedback IS NULL THEN 0 ELSE 1 END as feedback_count
  FROM applications a
  WHERE a.id = application_id;
END;
$$;


ALTER FUNCTION "public"."get_application_summary"("application_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_applications"() RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "user_id" "uuid", "job_id" "uuid", "status" "text", "form_data" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.created_at,
    a.user_id,
    a.job_id,
    a.status::text,
    a.form_data
  FROM applications a
  ORDER BY a.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_applications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_data"("user_id" "uuid", "dashboard_type" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result json;
BEGIN
  IF dashboard_type = 'recruiter' THEN
    -- Get recruiter dashboard data
    SELECT json_build_object(
      'total_applications', COUNT(a.*),
      'pending_reviews', COUNT(a.*) FILTER (WHERE a.status = 'pending'),
      'recent_applications', (
        SELECT json_agg(recent)
        FROM (
          SELECT 
            a.id,
            j.title as job_title,
            up.first_name || ' ' || up.last_name as applicant_name,
            a.status,
            a.created_at as submitted_at
          FROM applications a
          JOIN jobs j ON j.id = a.job_id
          JOIN user_profiles up ON up.id = a.user_id
          WHERE a.created_at > now() - interval '7 days'
          ORDER BY a.created_at DESC
        ) recent
      )
    )
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN user_profiles up ON up.id = a.user_id
    INTO result;
  ELSE
    -- Get applicant dashboard data
    SELECT json_build_object(
      'active_applications', COUNT(a.*) FILTER (WHERE a.status NOT IN ('withdrawn', 'rejected')),
      'completed_applications', COUNT(a.*) FILTER (WHERE a.status IN ('accepted', 'rejected')),
      'recent_activity', (
        SELECT json_agg(recent)
        FROM (
          SELECT 
            a.id,
            j.title as job_title,
            a.status,
            a.updated_at
          FROM applications a
          JOIN jobs j ON j.id = a.job_id
          WHERE a.user_id = user_id
          ORDER BY a.updated_at DESC
          LIMIT 5
        ) recent
      )
    )
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.user_id = user_id
    INTO result;
  END IF;

  RETURN COALESCE(result, '{}'::json);
END;
$$;


ALTER FUNCTION "public"."get_dashboard_data"("user_id" "uuid", "dashboard_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_form_submissions"("job_id" "uuid" DEFAULT NULL::"uuid", "template_id" "uuid" DEFAULT NULL::"uuid", "status" "text" DEFAULT NULL::"text", "page_size" integer DEFAULT 10, "page_number" integer DEFAULT 1) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
  total_count INT;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  -- Check permissions
  IF NOT (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = user_id
      AND (
        rp.permission = 'submissions.view_all' 
        OR rp.permission = 'submissions.view_own'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get total count for pagination
  SELECT COUNT(*)
  INTO total_count
  FROM form_submissions fs
  WHERE (
    job_id IS NULL 
    OR fs.job_id = job_id
  )
  AND (
    template_id IS NULL 
    OR fs.template_id = template_id
  )
  AND (
    status IS NULL 
    OR fs.status = status
  )
  AND (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = user_id
      AND rp.permission = 'submissions.view_all'
    )
    OR fs.submitted_by = user_id
  );

  -- Get paginated results
  WITH paginated_submissions AS (
    SELECT 
      fs.*,
      j.title as job_title,
      ft.title as template_title,
      u.email as submitted_by_email,
      COUNT(*) OVER() as full_count
    FROM form_submissions fs
    LEFT JOIN jobs j ON fs.job_id = j.id
    LEFT JOIN form_templates ft ON fs.template_id = ft.id
    LEFT JOIN auth.users u ON fs.submitted_by = u.id
    WHERE (
      job_id IS NULL 
      OR fs.job_id = job_id
    )
    AND (
      template_id IS NULL 
      OR fs.template_id = template_id
    )
    AND (
      status IS NULL 
      OR fs.status = status
    )
    AND (
      EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = user_id
        AND rp.permission = 'submissions.view_all'
      )
      OR fs.submitted_by = user_id
    )
    ORDER BY fs.created_at DESC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size
  )
  SELECT json_build_object(
    'data', COALESCE(
      json_agg(
        json_build_object(
          'id', ps.id,
          'job', json_build_object(
            'id', ps.job_id,
            'title', ps.job_title
          ),
          'template', json_build_object(
            'id', ps.template_id,
            'title', ps.template_title
          ),
          'form_data', ps.form_data,
          'files', ps.files,
          'status', ps.status,
          'submitted_by', json_build_object(
            'id', ps.submitted_by,
            'email', ps.submitted_by_email
          ),
          'created_at', ps.created_at,
          'updated_at', ps.updated_at
        )
      ),
      '[]'::json
    ),
    'pagination', json_build_object(
      'total', total_count,
      'page_size', page_size,
      'page_number', page_number,
      'total_pages', CEIL(total_count::float / page_size)
    )
  ) INTO result
  FROM paginated_submissions ps;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_form_submissions"("job_id" "uuid", "template_id" "uuid", "status" "text", "page_size" integer, "page_number" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_form_template_by_id"("template_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result json;
BEGIN
  -- Check if user has permission to view forms
  IF NOT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    AND rp.permission = 'forms.read_all'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get template with creator info
  SELECT json_build_object(
    'template', json_build_object(
      'id', ft.id,
      'title', ft.title,
      'description', ft.description,
      'type', ft.type,
      'schema', ft.schema,
      'config', ft.config,
      'is_active', ft.is_active,
      'created_at', ft.created_at,
      'updated_at', ft.updated_at,
      'created_by', ft.created_by
    ),
    'creator', CASE 
      WHEN up.id IS NOT NULL THEN json_build_object(
        'id', up.id,
        'email', up.email
      )
      ELSE NULL
    END
  ) INTO result
  FROM form_templates ft
  LEFT JOIN user_profiles up ON ft.created_by = up.id
  WHERE ft.id = template_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_form_template_by_id"("template_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_form_templates"("search_query" "text" DEFAULT NULL::"text", "template_type" "text" DEFAULT NULL::"text", "page_size" integer DEFAULT 10, "page_number" integer DEFAULT 1) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result json;
BEGIN
  -- Check if user has permission to view forms
  IF NOT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    AND rp.permission = 'forms.read_all'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  WITH filtered_templates AS (
    SELECT 
      ft.*,
      up.email as created_by_email,
      COUNT(*) OVER() as total_count
    FROM form_templates ft
    LEFT JOIN user_profiles up ON ft.created_by = up.id
    WHERE 
      (search_query IS NULL OR 
       ft.title ILIKE '%' || search_query || '%' OR
       ft.description ILIKE '%' || search_query || '%')
      AND (template_type IS NULL OR ft.type = template_type)
  ),
  paginated_templates AS (
    SELECT *
    FROM filtered_templates
    ORDER BY created_at DESC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size
  )
  SELECT json_build_object(
    'data', COALESCE(
      json_agg(
        json_build_object(
          'id', pt.id,
          'title', pt.title,
          'description', pt.description,
          'type', pt.type,
          'schema', pt.schema,
          'config', pt.config,
          'is_active', pt.is_active,
          'created_at', pt.created_at,
          'updated_at', pt.updated_at,
          'created_by', pt.created_by,
          'created_by_email', pt.created_by_email
        )
      ),
      '[]'::json
    ),
    'pagination', json_build_object(
      'total_count', COALESCE((SELECT total_count FROM filtered_templates LIMIT 1), 0),
      'page_size', page_size,
      'page_number', page_number,
      'total_pages', CEIL(COALESCE((SELECT total_count FROM filtered_templates LIMIT 1), 0)::float / page_size)
    )
  ) INTO result
  FROM paginated_templates pt;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_form_templates"("search_query" "text", "template_type" "text", "page_size" integer, "page_number" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_job_forms"("job_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
BEGIN
  -- Check permissions
  IF NOT (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = auth.uid()
      AND (rp.permission = 'jobs.view' OR rp.permission = 'jobs.manage')
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get forms with template info
  WITH job_form_data AS (
    SELECT 
      jf.*,
      ft.title as template_title,
      ft.description as template_description,
      ft.schema as template_schema,
      ft.type as template_type,
      u.email as created_by_email
    FROM job_forms jf
    LEFT JOIN form_templates ft ON jf.template_id = ft.id
    LEFT JOIN auth.users u ON jf.created_by = u.id
    WHERE jf.job_id = job_id
    ORDER BY jf.created_at ASC
  )
  SELECT json_agg(
    json_build_object(
      'id', jfd.id,
      'job_id', jfd.job_id,
      'template', json_build_object(
        'id', jfd.template_id,
        'title', jfd.template_title,
        'description', jfd.template_description,
        'schema', jfd.template_schema,
        'type', jfd.template_type
      ),
      'config', jfd.config,
      'created_at', jfd.created_at,
      'updated_at', jfd.updated_at,
      'created_by', json_build_object(
        'id', jfd.created_by,
        'email', jfd.created_by_email
      )
    )
  ) INTO result
  FROM job_form_data jfd;

  RETURN COALESCE(result, '[]'::json);
END;
$$;


ALTER FUNCTION "public"."get_job_forms"("job_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_submission_by_id"("submission_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  -- Check permissions
  IF NOT (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = user_id
      AND (
        rp.permission = 'submissions.view_all' 
        OR rp.permission = 'submissions.view_own'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get submission with related data
  WITH submission_data AS (
    SELECT 
      fs.*,
      j.title as job_title,
      j.description as job_description,
      ft.title as template_title,
      ft.description as template_description,
      ft.schema as template_schema,
      u.email as submitted_by_email,
      jf.config as form_config
    FROM form_submissions fs
    LEFT JOIN jobs j ON fs.job_id = j.id
    LEFT JOIN form_templates ft ON fs.template_id = ft.id
    LEFT JOIN job_forms jf ON fs.job_form_id = jf.id
    LEFT JOIN auth.users u ON fs.submitted_by = u.id
    WHERE fs.id = submission_id
    AND (
      EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = user_id
        AND rp.permission = 'submissions.view_all'
      )
      OR fs.submitted_by = user_id
    )
  )
  SELECT json_build_object(
    'id', sd.id,
    'job', json_build_object(
      'id', sd.job_id,
      'title', sd.job_title,
      'description', sd.job_description
    ),
    'template', json_build_object(
      'id', sd.template_id,
      'title', sd.template_title,
      'description', sd.template_description,
      'schema', sd.template_schema
    ),
    'form_config', sd.form_config,
    'form_data', sd.form_data,
    'files', sd.files,
    'status', sd.status,
    'submitted_by', json_build_object(
      'id', sd.submitted_by,
      'email', sd.submitted_by_email
    ),
    'created_at', sd.created_at,
    'updated_at', sd.updated_at
  ) INTO result
  FROM submission_data sd;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Submission not found or access denied';
  END IF;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_submission_by_id"("submission_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_data"("user_id" "uuid") RETURNS "json"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
SELECT json_build_object(
  'profile', profile,
  'role', role,
  'permissions', permissions
)
FROM (
  SELECT 
    to_json(up.*) as profile,
    ur.role,
    array_agg(rp.permission) as permissions
  FROM user_profiles up
  LEFT JOIN user_roles ur ON ur.user_id = up.id
  LEFT JOIN role_permissions rp ON rp.role = ur.role
  WHERE up.id = user_id
  GROUP BY up.id, ur.role
) sub;
$$;


ALTER FUNCTION "public"."get_user_data"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("user_id" "uuid") RETURNS TABLE("permissions" "public"."app_permission"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
BEGIN
  RETURN QUERY
  SELECT ARRAY_AGG(DISTINCT rp.permission)::app_permission[]
  FROM user_roles ur
  JOIN role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = $1;
END;
$_$;


ALTER FUNCTION "public"."get_user_permissions"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_application_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Always update the timestamp when any change occurs
  NEW.updated_at = CURRENT_TIMESTAMP;

  -- If status changes to a final state, set completed_at
  IF NEW.status IN ('accepted', 'rejected', 'withdrawn') 
  AND OLD.status NOT IN ('accepted', 'rejected', 'withdrawn') THEN
    NEW.completed_at = CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_application_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_email_confirmation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM public.allowed_domains 
        WHERE domain = split_part(NEW.email, '@', 2)
        AND auto_confirm = true
    ) THEN
        NEW.email_confirmed_at = NOW();
        NEW.confirmed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_email_confirmation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_email_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if domain is in allowed_domains
  IF EXISTS (
    SELECT 1 FROM allowed_domains
    WHERE NEW.email LIKE '%@' || domain
    AND auto_confirm = true
  ) THEN
    -- Auto-confirm email
    NEW.email_confirmed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_email_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Function body remains the same
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_form_to_job"("job_id" "uuid", "template_id" "uuid", "config" "json" DEFAULT NULL::"json") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
BEGIN
  -- Check permissions
  IF NOT (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = auth.uid()
      AND rp.permission = 'jobs.manage'
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if job exists
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = job_id) THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  -- Check if template exists
  IF NOT EXISTS (SELECT 1 FROM form_templates WHERE id = template_id) THEN
    RAISE EXCEPTION 'Form template not found';
  END IF;

  -- Link form to job
  INSERT INTO job_forms (
    job_id,
    template_id,
    config,
    created_by
  ) VALUES (
    job_id,
    template_id,
    COALESCE(config, '{}'::jsonb),
    auth.uid()
  )
  ON CONFLICT (job_id, template_id) 
  DO UPDATE SET
    config = COALESCE(EXCLUDED.config, job_forms.config),
    updated_at = now()
  RETURNING json_build_object(
    'id', id,
    'job_id', job_id,
    'template_id', template_id,
    'config', config,
    'created_at', created_at,
    'updated_at', updated_at,
    'created_by', created_by
  ) INTO result;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."link_form_to_job"("job_id" "uuid", "template_id" "uuid", "config" "json") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_form_template"("template_data" "json", "operation" "text" DEFAULT 'create'::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
  template_id UUID;
BEGIN
  -- Check permissions
  IF NOT (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = auth.uid()
      AND rp.permission = 'forms.create'
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  CASE operation
    WHEN 'create' THEN
      -- Create new template
      INSERT INTO form_templates (
        title,
        description,
        schema,
        created_by,
        type,
        config
      ) VALUES (
        template_data->>'title',
        template_data->>'description',
        template_data->'schema',
        auth.uid(),
        COALESCE(template_data->>'type', 'job_application'),
        COALESCE(template_data->'config', '{}'::jsonb)
      )
      RETURNING to_json(form_templates.*) INTO result;

    WHEN 'update' THEN
      -- Update existing template
      UPDATE form_templates
      SET
        title = COALESCE(template_data->>'title', title),
        description = COALESCE(template_data->>'description', description),
        schema = COALESCE(template_data->'schema', schema),
        type = COALESCE(template_data->>'type', type),
        config = COALESCE(template_data->'config', config),
        updated_at = now()
      WHERE id = (template_data->>'id')::uuid
      AND (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 
          FROM user_roles ur
          JOIN role_permissions rp ON ur.role = rp.role
          WHERE ur.user_id = auth.uid()
          AND rp.permission = 'forms.update_all'
        )
      )
      RETURNING to_json(form_templates.*) INTO result;

    WHEN 'clone' THEN
      -- Clone existing template
      INSERT INTO form_templates (
        title,
        description,
        schema,
        created_by,
        type,
        config
      )
      SELECT
        title || ' (Copy)',
        description,
        schema,
        auth.uid(),
        type,
        config
      FROM form_templates
      WHERE id = (template_data->>'id')::uuid
      RETURNING to_json(form_templates.*) INTO result;

    ELSE
      RAISE EXCEPTION 'Invalid operation: %', operation;
  END CASE;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."manage_form_template"("template_data" "json", "operation" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_job"("job_data" "json", "user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  job_id UUID;
  result JSON;
BEGIN
  -- Check permissions
  IF NOT authorize('jobs.create') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert or update job
  IF (job_data->>'id') IS NULL THEN
    INSERT INTO jobs (
      title,
      description,
      location,
      status,
      tasks,
      requirements,
      benefits,
      form_id,
      created_by
    ) VALUES (
      job_data->>'title',
      job_data->>'description',
      job_data->>'location',
      COALESCE(job_data->>'status', 'draft'),
      job_data->>'tasks',
      job_data->>'requirements',
      job_data->>'benefits',
      (job_data->>'form_id')::UUID,
      user_id
    )
    RETURNING to_json(*) INTO result;
  ELSE
    UPDATE jobs
    SET
      title = job_data->>'title',
      description = job_data->>'description',
      location = job_data->>'location',
      status = COALESCE(job_data->>'status', status),
      tasks = COALESCE(job_data->>'tasks', tasks),
      requirements = COALESCE(job_data->>'requirements', requirements),
      benefits = COALESCE(job_data->>'benefits', benefits),
      form_id = COALESCE((job_data->>'form_id')::UUID, form_id),
      updated_at = now()
    WHERE id = (job_data->>'id')::UUID
    RETURNING to_json(*) INTO result;
  END IF;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."manage_job"("job_data" "json", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_user"("email" "text", "password" "text", "first_name" "text" DEFAULT NULL::"text", "last_name" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_user json;
  user_profile json;
BEGIN
  -- Create auth user (using Supabase's auth.users())
  new_user := auth.sign_up(email, password);
  
  -- Create profile with additional info
  INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name
  ) VALUES (
    (new_user->>'id')::uuid, 
    email,
    first_name,
    last_name
  )
  RETURNING to_json(*) INTO user_profile;
  
  RETURN json_build_object(
    'user', new_user,
    'profile', user_profile
  );
END;
$$;


ALTER FUNCTION "public"."register_user"("email" "text", "password" "text", "first_name" "text", "last_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_form"("job_form_id" "uuid", "form_data" "json", "files" "json" DEFAULT NULL::"json") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
  job_id UUID;
  template_id UUID;
  submission_id UUID;
BEGIN
  -- Get job and template IDs
  SELECT jf.job_id, jf.template_id
  INTO job_id, template_id
  FROM job_forms jf
  WHERE jf.id = job_form_id;

  IF job_id IS NULL THEN
    RAISE EXCEPTION 'Job form not found';
  END IF;

  -- Create submission
  INSERT INTO form_submissions (
    job_id,
    job_form_id,
    template_id,
    form_data,
    files,
    submitted_by,
    status
  ) VALUES (
    job_id,
    job_form_id,
    template_id,
    form_data,
    COALESCE(files, '[]'::jsonb),
    auth.uid(),
    'pending'
  )
  RETURNING id INTO submission_id;

  -- Get submission with related data
  WITH submission_data AS (
    SELECT 
      fs.*,
      j.title as job_title,
      ft.title as template_title,
      u.email as submitted_by_email
    FROM form_submissions fs
    LEFT JOIN jobs j ON fs.job_id = j.id
    LEFT JOIN form_templates ft ON fs.template_id = ft.id
    LEFT JOIN auth.users u ON fs.submitted_by = u.id
    WHERE fs.id = submission_id
  )
  SELECT json_build_object(
    'id', sd.id,
    'job', json_build_object(
      'id', sd.job_id,
      'title', sd.job_title
    ),
    'template', json_build_object(
      'id', sd.template_id,
      'title', sd.template_title
    ),
    'form_data', sd.form_data,
    'files', sd.files,
    'status', sd.status,
    'submitted_by', json_build_object(
      'id', sd.submitted_by,
      'email', sd.submitted_by_email
    ),
    'created_at', sd.created_at,
    'updated_at', sd.updated_at
  ) INTO result
  FROM submission_data sd;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."submit_form"("job_form_id" "uuid", "form_data" "json", "files" "json") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_all_user_claims"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM user_roles LOOP
        -- Get roles and permissions for this user (now with DISTINCT)
        WITH user_claims AS (
            SELECT 
                array_agg(DISTINCT ur.role)::text[] as roles,
                array_agg(DISTINCT rp.permission)::text[] as permissions
            FROM user_roles ur
            LEFT JOIN role_permissions rp ON rp.role = ur.role
            WHERE ur.user_id = user_record.user_id
            GROUP BY ur.user_id
        )
        UPDATE auth.users 
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'roles', COALESCE((SELECT roles FROM user_claims), ARRAY[]::text[]),
                'permissions', COALESCE((SELECT permissions FROM user_claims), ARRAY[]::text[])
            )
        WHERE id = user_record.user_id;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."update_all_user_claims"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_claims"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."update_user_claims"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_application_status_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check permissions for status changes
    IF NOT (
        -- Allow recruiters/HR to make any status change
        EXISTS (
            SELECT 1 
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role = rp.role
            WHERE ur.user_id = auth.uid()
            AND rp.permission = 'applications.change_status'::app_permission
        )
        OR 
        -- Allow applicants to withdraw their own applications
        (NEW.status = 'withdrawn' AND OLD.user_id = auth.uid())
    ) THEN
        RAISE EXCEPTION 'Unauthorized status change';
    END IF;

    -- If application is withdrawn, prevent any status changes
    IF OLD.status = 'withdrawn' THEN
        RAISE EXCEPTION 'Cannot change status of withdrawn application';
    END IF;

    -- Update completed_at for final statuses
    IF NEW.status IN ('accepted', 'rejected', 'withdrawn') THEN
        NEW.completed_at = NOW();
    ELSE
        NEW.completed_at = NULL;
    END IF;

    -- Always update updated_at
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_application_status_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_step_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If steps_data is being updated
    IF NEW.steps_data IS DISTINCT FROM OLD.steps_data THEN
        -- Update last_completed_step
        SELECT key INTO NEW.last_completed_step
        FROM jsonb_object_keys(NEW.steps_data) AS key
        ORDER BY key DESC
        LIMIT 1;

        -- Update steps_validation
        NEW.steps_validation = jsonb_set(
            COALESCE(NEW.steps_validation, '{}'::jsonb),
            ARRAY[NEW.current_step],
            to_jsonb(CASE 
                WHEN NEW.steps_data ? NEW.current_step THEN 'completed'
                ELSE 'pending'
            END)
        );

        -- Increment submission count if step data was added
        IF NEW.steps_data ? NEW.current_step AND 
           (NOT OLD.steps_data ? NEW.current_step) THEN
            NEW.submission_count = COALESCE(OLD.submission_count, 0) + 1;
        END IF;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_step_completion"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."allowed_domains" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "domain" "text" NOT NULL,
    "auto_confirm" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."allowed_domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "position" "text" NOT NULL,
    "status" "public"."app_application_status" DEFAULT 'pending'::"public"."app_application_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "job_id" "uuid",
    "form_data" "jsonb" DEFAULT '{}'::"jsonb",
    "completed_at" timestamp with time zone,
    "feedback" "text" DEFAULT '{}'::"jsonb",
    "updated_by" "uuid"
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


COMMENT ON TABLE "public"."applications" IS 'Stores job applications with form_data for submissions and text feedback';



CREATE TABLE IF NOT EXISTS "public"."form_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "schema" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "type" "text" DEFAULT 'job_application'::"text",
    "config" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."form_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."form_templates" IS 'Stores form templates that serve as blueprints for job listing forms';



COMMENT ON COLUMN "public"."form_templates"."schema" IS 'FormKit schema array';



COMMENT ON COLUMN "public"."form_templates"."config" IS 'Additional FormKit configuration';



CREATE TABLE IF NOT EXISTS "public"."forms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "schema" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "type" "text" DEFAULT 'job_application'::"text",
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."forms" OWNER TO "postgres";


COMMENT ON TABLE "public"."forms" IS 'Stores actual forms created from templates and linked to job listings';



CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."app_job_status" DEFAULT 'draft'::"public"."app_job_status" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location" "text",
    "form_id" "uuid",
    "tasks" "text",
    "requirements" "text",
    "benefits" "text"
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'applicant'::"public"."app_role",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."allowed_domains"
    ADD CONSTRAINT "allowed_domains_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."allowed_domains"
    ADD CONSTRAINT "allowed_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_templates"
    ADD CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



CREATE INDEX "idx_applications_job_id" ON "public"."applications" USING "btree" ("job_id");



CREATE INDEX "idx_applications_job_status" ON "public"."applications" USING "btree" ("job_id", "status");



CREATE INDEX "idx_applications_status" ON "public"."applications" USING "btree" ("status");



CREATE INDEX "idx_applications_status_created" ON "public"."applications" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_applications_user_id" ON "public"."applications" USING "btree" ("user_id");



CREATE INDEX "idx_applications_user_status" ON "public"."applications" USING "btree" ("user_id", "status");



CREATE INDEX "idx_jobs_created_at" ON "public"."jobs" USING "btree" ("created_at");



CREATE INDEX "idx_jobs_status" ON "public"."jobs" USING "btree" ("status");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_roles_user_lookup" ON "public"."user_roles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "check_application_status_transition" BEFORE UPDATE OF "status" ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."validate_application_status_transition"();



CREATE OR REPLACE TRIGGER "on_application_update" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."handle_application_update"();



CREATE OR REPLACE TRIGGER "on_role_permission_change" AFTER INSERT OR UPDATE ON "public"."role_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_claims"();



CREATE OR REPLACE TRIGGER "on_user_role_change" AFTER INSERT OR UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_claims"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trg_validate_step_completion" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."validate_step_completion"();



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "fk_application_user" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "fk_job" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "fk_user_role_user" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_templates"
    ADD CONSTRAINT "form_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allowed domains are manageable by admins" ON "public"."allowed_domains" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Create jobs with permission" ON "public"."jobs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.create'::"public"."app_permission")))));



CREATE POLICY "Delete jobs with permission" ON "public"."jobs" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.delete_all'::"public"."app_permission")))));



CREATE POLICY "Enable delete for authenticated users only" ON "public"."form_templates" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."form_templates" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."form_templates" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."form_templates" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Form templates are editable by admins and recruiters" ON "public"."form_templates" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."app_role", 'recruiter'::"public"."app_role"]))))));



CREATE POLICY "Form templates are viewable by authenticated users" ON "public"."form_templates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Forms are editable by admins and recruiters" ON "public"."forms" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."app_role", 'recruiter'::"public"."app_role"]))))));



CREATE POLICY "Forms are viewable by authenticated users" ON "public"."forms" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Only admins can manage permissions" ON "public"."role_permissions" USING ("public"."authorize"('permissions.update_all'::"public"."app_permission"));



CREATE POLICY "Only admins can manage roles" ON "public"."user_roles" USING ("public"."authorize"('roles.update_all'::"public"."app_permission"));



CREATE POLICY "Publish jobs with permission" ON "public"."jobs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.publish'::"public"."app_permission"))))) WITH CHECK (("status" = 'published'::"public"."app_job_status"));



CREATE POLICY "Read jobs based on permissions" ON "public"."jobs" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.read_all'::"public"."app_permission")))) OR ((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.read_own'::"public"."app_permission")))) AND ("created_by" = "auth"."uid"()))));



CREATE POLICY "Update jobs based on permissions" ON "public"."jobs" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.update_all'::"public"."app_permission")))) OR ((EXISTS ( SELECT 1
   FROM ("public"."role_permissions" "rp"
     JOIN "public"."user_roles" "ur" ON (("rp"."role" = "ur"."role")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("rp"."permission" = 'jobs.update_own'::"public"."app_permission")))) AND ("created_by" = "auth"."uid"()))));



CREATE POLICY "Users can create applications" ON "public"."applications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own applications" ON "public"."applications" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR "public"."authorize"('applications.update_all'::"public"."app_permission")));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."authorize"('profiles.update_all'::"public"."app_permission")));



CREATE POLICY "Users can view their own applications" ON "public"."applications" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."authorize"('applications.read_all'::"public"."app_permission")));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."authorize"('profiles.read_all'::"public"."app_permission")));



ALTER TABLE "public"."allowed_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "applications_create_policy" ON "public"."applications" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."authorize"('applications.create'::"public"."app_permission") AS "authorize"));



CREATE POLICY "applications_delete_policy" ON "public"."applications" FOR DELETE TO "authenticated" USING ((( SELECT "public"."authorize"('applications.delete_all'::"public"."app_permission") AS "authorize") OR ( SELECT ("public"."authorize"('applications.delete_own'::"public"."app_permission") AND ("applications"."user_id" = "auth"."uid"())))));



CREATE POLICY "applications_read_policy" ON "public"."applications" FOR SELECT TO "authenticated" USING ((( SELECT "public"."authorize"('applications.read_all'::"public"."app_permission") AS "authorize") OR ( SELECT ("public"."authorize"('applications.read_own'::"public"."app_permission") AND ("applications"."user_id" = "auth"."uid"())))));



CREATE POLICY "applications_update_policy" ON "public"."applications" FOR UPDATE TO "authenticated" USING ((( SELECT "public"."authorize"('applications.update_all'::"public"."app_permission") AS "authorize") OR ( SELECT ("public"."authorize"('applications.update_own'::"public"."app_permission") AND ("applications"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."form_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissions_create_policy" ON "public"."role_permissions" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."authorize"('permissions.create'::"public"."app_permission") AS "authorize"));



CREATE POLICY "permissions_delete_policy" ON "public"."role_permissions" FOR DELETE TO "authenticated" USING (( SELECT "public"."authorize"('permissions.delete_all'::"public"."app_permission") AS "authorize"));



CREATE POLICY "permissions_read_policy" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "permissions_update_policy" ON "public"."role_permissions" FOR UPDATE TO "authenticated" USING (( SELECT "public"."authorize"('permissions.update_all'::"public"."app_permission") AS "authorize"));



CREATE POLICY "profiles_create_policy" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."authorize"('profiles.create'::"public"."app_permission") AS "authorize"));



CREATE POLICY "profiles_delete_policy" ON "public"."user_profiles" FOR DELETE TO "authenticated" USING (( SELECT "public"."authorize"('profiles.delete_all'::"public"."app_permission") AS "authorize"));



CREATE POLICY "profiles_read_policy" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR ( SELECT "public"."authorize"('profiles.read_all'::"public"."app_permission") AS "authorize") OR ( SELECT ("public"."authorize"('profiles.read_own'::"public"."app_permission") AND ("auth"."uid"() = "user_profiles"."id")))));



CREATE POLICY "profiles_update_policy" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "public"."authorize"('profiles.update_all'::"public"."app_permission") AS "authorize") OR ( SELECT ("public"."authorize"('profiles.update_own'::"public"."app_permission") AND ("auth"."uid"() = "user_profiles"."id")))));



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_create_policy" ON "public"."user_roles" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."authorize"('roles.create'::"public"."app_permission") AS "authorize"));



CREATE POLICY "roles_delete_policy" ON "public"."user_roles" FOR DELETE TO "authenticated" USING (( SELECT "public"."authorize"('roles.delete_all'::"public"."app_permission") AS "authorize"));



CREATE POLICY "roles_read_policy" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ( SELECT "public"."authorize"('roles.read_all'::"public"."app_permission") AS "authorize")));



CREATE POLICY "roles_update_policy" ON "public"."user_roles" FOR UPDATE TO "authenticated" USING (( SELECT "public"."authorize"('roles.update_all'::"public"."app_permission") AS "authorize"));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































REVOKE ALL ON FUNCTION "public"."add_application_feedback"("application_id" "uuid", "step_name" "text", "feedback_text" "text", "feedback_status" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_application_feedback"("application_id" "uuid", "step_name" "text", "feedback_text" "text", "feedback_status" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."add_application_feedback"("application_id" "uuid", "step_name" "text", "feedback_text" "text", "feedback_status" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "resource_owner_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "resource_owner_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "resource_owner_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."check_job_status_transition"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_job_status_transition"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."clone_form_template"("template_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."clone_form_template"("template_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_job_form"("job_id" "uuid", "schema" "json", "config" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_job_form"("job_id" "uuid", "schema" "json", "config" "json") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_activity"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_application_progress"("application_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_application_progress"("application_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_application_summary"("application_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_application_summary"("application_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_applications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_applications"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_data"("user_id" "uuid", "dashboard_type" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("user_id" "uuid", "dashboard_type" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("user_id" "uuid", "dashboard_type" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_form_submissions"("job_id" "uuid", "template_id" "uuid", "status" "text", "page_size" integer, "page_number" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_form_submissions"("job_id" "uuid", "template_id" "uuid", "status" "text", "page_size" integer, "page_number" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_form_template_by_id"("template_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_form_template_by_id"("template_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_form_templates"("search_query" "text", "template_type" "text", "page_size" integer, "page_number" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_form_templates"("search_query" "text", "template_type" "text", "page_size" integer, "page_number" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_job_forms"("job_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_job_forms"("job_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_submission_by_id"("submission_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_submission_by_id"("submission_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_user_data"("user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_data"("user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_user_data"("user_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_application_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_application_update"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_email_confirmation"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_email_confirmation"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_email_signup"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_email_signup"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."link_form_to_job"("job_id" "uuid", "template_id" "uuid", "config" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_form_to_job"("job_id" "uuid", "template_id" "uuid", "config" "json") TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_form_template"("template_data" "json", "operation" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_form_template"("template_data" "json", "operation" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."manage_job"("job_data" "json", "user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."manage_job"("job_data" "json", "user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."manage_job"("job_data" "json", "user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."register_user"("email" "text", "password" "text", "first_name" "text", "last_name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."register_user"("email" "text", "password" "text", "first_name" "text", "last_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_form"("job_form_id" "uuid", "form_data" "json", "files" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_form"("job_form_id" "uuid", "form_data" "json", "files" "json") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_all_user_claims"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_all_user_claims"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_claims"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_claims"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_application_status_transition"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_application_status_transition"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_step_completion"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_step_completion"() TO "service_role";


















GRANT ALL ON TABLE "public"."allowed_domains" TO "anon";
GRANT ALL ON TABLE "public"."allowed_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."allowed_domains" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."form_templates" TO "anon";
GRANT ALL ON TABLE "public"."form_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."form_templates" TO "service_role";



GRANT ALL ON TABLE "public"."forms" TO "anon";
GRANT ALL ON TABLE "public"."forms" TO "authenticated";
GRANT ALL ON TABLE "public"."forms" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
