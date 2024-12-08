# Database Schema Documentation

## Overview
This document contains the complete database schema for the Job Recruiting Funnel application. It is automatically generated from the database and should be updated whenever schema changes are made.

## How to Update
1. Run the queries from `schema.sql` in Supabase SQL Editor
2. Copy the results as JSON into the appropriate sections below
3. Update the "Last Updated" date

## Last Updated
2024-01-24

## Table Definitions

### Authentication & Authorization
```json
{
  "tables": {
    "user_profiles": {
      "description": "Stores user profile information",
      "columns": {
        "id": {"type": "uuid", "nullable": false, "primary_key": true},
        "email": {"type": "text", "nullable": false},
        "first_name": {"type": "text", "nullable": true},
        "last_name": {"type": "text", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true},
        "updated_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    },
    "user_roles": {
      "description": "Maps users to their roles",
      "columns": {
        "id": {"type": "uuid", "default": "gen_random_uuid()", "nullable": false, "primary_key": true},
        "user_id": {"type": "uuid", "nullable": false},
        "role": {"type": "app_role", "default": "'applicant'::app_role", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    },
    "role_permissions": {
      "description": "Defines permissions for each role",
      "columns": {
        "id": {"type": "uuid", "default": "gen_random_uuid()", "nullable": false, "primary_key": true},
        "role": {"type": "app_role", "nullable": false},
        "permission": {"type": "USER-DEFINED", "nullable": false},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    },
    "allowed_domains": {
      "description": "Whitelist of email domains allowed to register",
      "columns": {
        "id": {"type": "uuid", "default": "gen_random_uuid()", "nullable": false, "primary_key": true},
        "domain": {"type": "text", "nullable": false},
        "auto_confirm": {"type": "boolean", "default": "false", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    }
  }
}
```

### Job Management
```json
{
  "tables": {
    "jobs": {
      "description": "Job listings and their details",
      "columns": {
        "id": {"type": "uuid", "default": "uuid_generate_v4()", "nullable": false, "primary_key": true},
        "title": {"type": "text", "nullable": false},
        "description": {"type": "text", "nullable": true},
        "job_details": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "status": {"type": "app_job_status", "default": "'draft'::app_job_status", "nullable": false},
        "created_by": {"type": "uuid", "nullable": true},
        "department": {"type": "text", "nullable": true},
        "location": {"type": "text", "nullable": true},
        "application_steps": {"type": "ARRAY", "default": "'{}'::jsonb[]", "nullable": false},
        "meta": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "form_template_id": {"type": "uuid", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true},
        "updated_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    }
  }
}
```

### Application Process
```json
{
  "tables": {
    "applications": {
      "description": "Job applications submitted by users",
      "columns": {
        "id": {"type": "uuid", "default": "gen_random_uuid()", "nullable": false, "primary_key": true},
        "user_id": {"type": "uuid", "nullable": false},
        "job_id": {"type": "uuid", "nullable": true},
        "position": {"type": "text", "nullable": false},
        "status": {"type": "app_application_status", "default": "'pending'::app_application_status", "nullable": true},
        "cover_letter": {"type": "text", "nullable": true},
        "resume_url": {"type": "text", "nullable": true},
        "current_step": {"type": "text", "nullable": true},
        "last_completed_step": {"type": "text", "nullable": true},
        "steps_data": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "steps_validation": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "submission_count": {"type": "integer", "default": "0", "nullable": true},
        "feedback": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "completed_at": {"type": "timestamp with time zone", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true},
        "updated_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    }
  }
}
```

### Form Builder System
```json
{
  "tables": {
    "form_templates": {
      "description": "Reusable form templates",
      "columns": {
        "id": {"type": "uuid", "default": "uuid_generate_v4()", "nullable": false, "primary_key": true},
        "title": {"type": "text", "nullable": false},
        "description": {"type": "text", "nullable": true},
        "created_by": {"type": "uuid", "nullable": true},
        "is_active": {"type": "boolean", "default": "true", "nullable": true},
        "meta": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true},
        "updated_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    },
    "form_steps": {
      "description": "Steps within a form template",
      "columns": {
        "id": {"type": "uuid", "default": "uuid_generate_v4()", "nullable": false, "primary_key": true},
        "form_template_id": {"type": "uuid", "nullable": true},
        "title": {"type": "text", "nullable": false},
        "description": {"type": "text", "nullable": true},
        "order_index": {"type": "integer", "nullable": false},
        "is_conditional": {"type": "boolean", "default": "false", "nullable": true},
        "condition_logic": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true},
        "updated_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    },
    "form_fields": {
      "description": "Fields within form steps",
      "columns": {
        "id": {"type": "uuid", "default": "uuid_generate_v4()", "nullable": false, "primary_key": true},
        "step_id": {"type": "uuid", "nullable": true},
        "type": {"type": "USER-DEFINED", "nullable": false},
        "label": {"type": "text", "nullable": false},
        "description": {"type": "text", "nullable": true},
        "order_index": {"type": "integer", "nullable": false},
        "is_required": {"type": "boolean", "default": "false", "nullable": true},
        "is_conditional": {"type": "boolean", "default": "false", "nullable": true},
        "condition_logic": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "options": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "validation_rules": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "ui_options": {"type": "jsonb", "default": "'{}'::jsonb", "nullable": true},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true},
        "updated_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    },
    "field_dependencies": {
      "description": "Dependencies between form fields",
      "columns": {
        "id": {"type": "uuid", "default": "uuid_generate_v4()", "nullable": false, "primary_key": true},
        "source_field_id": {"type": "uuid", "nullable": true},
        "target_field_id": {"type": "uuid", "nullable": true},
        "condition_type": {"type": "text", "nullable": false},
        "condition_value": {"type": "jsonb", "nullable": false},
        "created_at": {"type": "timestamp with time zone", "default": "now()", "nullable": true}
      }
    }
  }
}
```

## Foreign Key Relationships

### Application Process
```json
{
  "relationships": [
    {
      "description": "Links applications to their corresponding job posting",
      "from": {
        "table": "applications",
        "column": "job_id"
      },
      "to": {
        "table": "jobs",
        "column": "id"
      },
      "constraint": "fk_job"
    }
  ]
}
```

### Job Management
```json
{
  "relationships": [
    {
      "description": "Associates jobs with their application form template",
      "from": {
        "table": "jobs",
        "column": "form_template_id"
      },
      "to": {
        "table": "form_templates",
        "column": "id"
      },
      "constraint": "jobs_form_template_id_fkey"
    }
  ]
}
```

### Form Builder System
```json
{
  "relationships": [
    {
      "description": "Links form steps to their parent template",
      "from": {
        "table": "form_steps",
        "column": "form_template_id"
      },
      "to": {
        "table": "form_templates",
        "column": "id"
      },
      "constraint": "form_steps_form_template_id_fkey"
    },
    {
      "description": "Links form fields to their parent step",
      "from": {
        "table": "form_fields",
        "column": "step_id"
      },
      "to": {
        "table": "form_steps",
        "column": "id"
      },
      "constraint": "form_fields_step_id_fkey"
    },
    {
      "description": "Links field dependencies to their source field",
      "from": {
        "table": "field_dependencies",
        "column": "source_field_id"
      },
      "to": {
        "table": "form_fields",
        "column": "id"
      },
      "constraint": "field_dependencies_source_field_id_fkey"
    },
    {
      "description": "Links field dependencies to their target field",
      "from": {
        "table": "field_dependencies",
        "column": "target_field_id"
      },
      "to": {
        "table": "form_fields",
        "column": "id"
      },
      "constraint": "field_dependencies_target_field_id_fkey"
    }
  ]
}
```

## Indexes

### Authentication & Authorization
```json
{
  "indexes": {
    "user_profiles": [
      {
        "name": "user_profiles_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for user profiles"
      }
    ],
    "user_roles": [
      {
        "name": "user_roles_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index"
      },
      {
        "name": "user_roles_user_id_role_key",
        "type": "UNIQUE",
        "columns": ["user_id", "role"],
        "description": "Ensures each user can have a role only once and optimizes role lookups"
      },
      {
        "name": "idx_user_roles_user_lookup",
        "type": "BTREE",
        "columns": ["user_id"],
        "description": "Optimizes user role lookups for authorization checks"
      }
    ],
    "role_permissions": [
      {
        "name": "role_permissions_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index"
      },
      {
        "name": "role_permissions_role_permission_key",
        "type": "UNIQUE",
        "columns": ["role", "permission"],
        "description": "Ensures unique role-permission pairs and optimizes permission checks"
      }
    ],
    "allowed_domains": [
      {
        "name": "allowed_domains_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for allowed domains"
      },
      {
        "name": "allowed_domains_domain_key",
        "type": "UNIQUE",
        "columns": ["domain"],
        "description": "Ensures each domain is registered only once"
      }
    ]
  }
}
```

### Job Management
```json
{
  "indexes": {
    "jobs": [
      {
        "name": "jobs_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for jobs"
      }
    ]
  }
}
```

### Application Process
```json
{
  "indexes": {
    "applications": [
      {
        "name": "applications_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for applications"
      },
      {
        "name": "idx_applications_job_status",
        "type": "BTREE",
        "columns": ["job_id", "status"],
        "description": "Optimizes queries filtering applications by job and status"
      },
      {
        "name": "idx_applications_status_created",
        "type": "BTREE",
        "columns": ["status", "created_at DESC"],
        "description": "Optimizes queries sorting applications by status and creation date"
      },
      {
        "name": "idx_applications_user_status",
        "type": "BTREE",
        "columns": ["user_id", "status"],
        "description": "Optimizes queries filtering applications by user and status"
      }
    ]
  }
}
```

### Form Builder System
```json
{
  "indexes": {
    "form_templates": [
      {
        "name": "form_templates_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for form templates"
      }
    ],
    "form_steps": [
      {
        "name": "form_steps_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for form steps"
      },
      {
        "name": "form_steps_form_template_id_order_index_key",
        "type": "UNIQUE",
        "columns": ["form_template_id", "order_index"],
        "description": "Ensures unique ordering of steps within a template"
      }
    ],
    "form_fields": [
      {
        "name": "form_fields_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for form fields"
      },
      {
        "name": "form_fields_step_id_order_index_key",
        "type": "UNIQUE",
        "columns": ["step_id", "order_index"],
        "description": "Ensures unique ordering of fields within a step"
      }
    ],
    "field_dependencies": [
      {
        "name": "field_dependencies_pkey",
        "type": "UNIQUE",
        "columns": ["id"],
        "description": "Primary key index for field dependencies"
      },
      {
        "name": "field_dependencies_source_field_id_target_field_id_key",
        "type": "UNIQUE",
        "columns": ["source_field_id", "target_field_id"],
        "description": "Ensures unique relationships between source and target fields"
      }
    ]
  }
}
```

## RLS Policies

### Authentication & Authorization

#### User Profiles
```json
{
  "policies": {
    "user_profiles": {
      "read": [
        {
          "name": "profiles_read_policy",
          "roles": ["authenticated"],
          "description": "Users can read their own profile or all profiles with permission",
          "condition": "(auth.uid() = id) OR authorize('profiles.read_all') OR (authorize('profiles.read_own') AND auth.uid() = user_profiles.id)"
        }
      ],
      "create": [
        {
          "name": "profiles_create_policy",
          "roles": ["authenticated"],
          "description": "Users can create profiles with permission",
          "condition": "authorize('profiles.create')"
        }
      ],
      "update": [
        {
          "name": "profiles_update_policy",
          "roles": ["authenticated"],
          "description": "Users can update their own profile or all profiles with permission",
          "condition": "authorize('profiles.update_all') OR (authorize('profiles.update_own') AND auth.uid() = user_profiles.id)"
        }
      ],
      "delete": [
        {
          "name": "profiles_delete_policy",
          "roles": ["authenticated"],
          "description": "Users can delete profiles with permission",
          "condition": "authorize('profiles.delete_all')"
        }
      ]
    }
  }
}
```

#### Role Management
```json
{
  "policies": {
    "user_roles": {
      "all": [
        {
          "name": "Only admins can manage roles",
          "roles": ["public"],
          "description": "Global policy for role management",
          "condition": "authorize('roles.update_all')"
        }
      ],
      "read": [
        {
          "name": "roles_read_policy",
          "roles": ["authenticated"],
          "description": "Users can view their own roles or all roles with permission",
          "condition": "(user_id = auth.uid()) OR authorize('roles.read_all')"
        }
      ],
      "create": [
        {
          "name": "roles_create_policy",
          "roles": ["authenticated"],
          "description": "Users can create roles with permission",
          "condition": "authorize('roles.create')"
        }
      ],
      "update": [
        {
          "name": "roles_update_policy",
          "roles": ["authenticated"],
          "description": "Users can update roles with permission",
          "condition": "authorize('roles.update_all')"
        }
      ],
      "delete": [
        {
          "name": "roles_delete_policy",
          "roles": ["authenticated"],
          "description": "Users can delete roles with permission",
          "condition": "authorize('roles.delete_all')"
        }
      ]
    },
    "role_permissions": {
      "all": [
        {
          "name": "Only admins can manage permissions",
          "roles": ["public"],
          "description": "Global policy for permission management",
          "condition": "authorize('permissions.update_all')"
        }
      ],
      "read": [
        {
          "name": "permissions_read_policy",
          "roles": ["authenticated"],
          "description": "All authenticated users can read permissions",
          "condition": "true"
        }
      ]
    }
  }
}
```

### Job Management
```json
{
  "policies": {
    "jobs": {
      "read": [
        {
          "name": "Read jobs based on permissions",
          "roles": ["public"],
          "description": "Users can read all jobs or their own based on permissions",
          "condition": "authorize('jobs.read_all') OR (authorize('jobs.read_own') AND created_by = auth.uid())"
        }
      ],
      "create": [
        {
          "name": "Create jobs with permission",
          "roles": ["public"],
          "description": "Users can create jobs with permission",
          "condition": "authorize('jobs.create')"
        }
      ],
      "update": [
        {
          "name": "Update jobs based on permissions",
          "roles": ["public"],
          "description": "Users can update all jobs or their own based on permissions",
          "condition": "authorize('jobs.update_all') OR (authorize('jobs.update_own') AND created_by = auth.uid())"
        },
        {
          "name": "Publish jobs with permission",
          "roles": ["public"],
          "description": "Users can publish jobs with specific permission",
          "condition": "authorize('jobs.publish') AND status = 'published'::app_job_status"
        }
      ],
      "delete": [
        {
          "name": "Delete jobs with permission",
          "roles": ["public"],
          "description": "Users can delete jobs with permission",
          "condition": "authorize('jobs.delete_all')"
        }
      ]
    }
  }
}
```

### Application Process
```json
{
  "policies": {
    "applications": {
      "read": [
        {
          "name": "applications_read_policy",
          "roles": ["authenticated"],
          "description": "Users can read all applications or their own based on permissions",
          "condition": "authorize('applications.read_all') OR (authorize('applications.read_own') AND applications.user_id = auth.uid())"
        }
      ],
      "create": [
        {
          "name": "applications_create_policy",
          "roles": ["authenticated"],
          "description": "Users can create applications with permission",
          "condition": "authorize('applications.create')"
        }
      ],
      "update": [
        {
          "name": "applications_update_policy",
          "roles": ["authenticated"],
          "description": "Users can update all applications or their own based on permissions",
          "condition": "authorize('applications.update_all') OR (authorize('applications.update_own') AND applications.user_id = auth.uid())"
        }
      ],
      "delete": [
        {
          "name": "applications_delete_policy",
          "roles": ["authenticated"],
          "description": "Users can delete all applications or their own based on permissions",
          "condition": "authorize('applications.delete_all') OR (authorize('applications.delete_own') AND applications.user_id = auth.uid())"
        }
      ]
    }
  }
}
```

## Functions and Triggers

### Authentication Functions
```json
{
  "functions": {
    "authorize": {
      "description": "Checks if the current user has the requested permission",
      "security": "SECURITY DEFINER",
      "parameters": {
        "requested_permission": "app_permission",
        "resource_owner_id": "uuid (optional)"
      },
      "returns": "boolean",
      "details": "Validates permissions based on user role and resource ownership"
    },
    "handle_new_user": {
      "description": "Creates user profile and assigns default role on signup",
      "security": "SECURITY DEFINER",
      "trigger": "AFTER INSERT ON auth.users",
      "actions": [
        "Creates user profile",
        "Assigns 'applicant' role"
      ]
    },
    "handle_email_confirmation": {
      "description": "Auto-confirms emails from allowed domains",
      "security": "SECURITY DEFINER",
      "trigger": "BEFORE INSERT ON auth.users",
      "actions": [
        "Checks allowed_domains table",
        "Auto-confirms if domain matches and auto_confirm is true"
      ]
    }
  }
}
```

### Job Management Functions
```json
{
  "functions": {
    "check_job_status_transition": {
      "description": "Validates job status changes",
      "trigger": "BEFORE UPDATE ON jobs",
      "validations": [
        "Checks 'jobs.publish' permission when transitioning from draft to published"
      ]
    }
  }
}
```

### Application Management Functions
```json
{
  "functions": {
    "validate_application_status_transition": {
      "description": "Enforces valid application status transitions",
      "trigger": "BEFORE UPDATE ON applications",
      "validations": [
        "Checks permissions for status changes",
        "Enforces valid status transitions",
        "Updates completion timestamps"
      ],
      "valid_transitions": {
        "pending": ["screening", "rejected", "withdrawn"],
        "screening": ["interview", "rejected", "withdrawn"],
        "interview": ["technical_assessment", "offer", "rejected", "withdrawn"],
        "technical_assessment": ["offer", "rejected", "withdrawn"],
        "offer": ["accepted", "rejected", "withdrawn"],
        "final_states": ["accepted", "rejected", "withdrawn"]
      }
    },
    "validate_step_completion": {
      "description": "Manages application step progression",
      "trigger": "BEFORE UPDATE ON applications",
      "actions": [
        "Updates last_completed_step",
        "Updates steps_validation status",
        "Tracks submission count"
      ]
    },
    "get_application_progress": {
      "description": "Calculates application progress statistics",
      "parameters": {
        "application_id": "uuid"
      },
      "returns": {
        "total_steps": "integer",
        "completed_steps": "integer",
        "progress_percentage": "numeric",
        "current_step": "text",
        "next_step": "text"
      }
    },
    "get_application_summary": {
      "description": "Retrieves application summary information",
      "parameters": {
        "application_id": "uuid"
      },
      "returns": {
        "application_status": "app_application_status",
        "days_since_submission": "integer",
        "last_update": "timestamp with time zone",
        "total_submissions": "integer",
        "is_complete": "boolean",
        "feedback_count": "integer"
      }
    },
    "add_application_feedback": {
      "description": "Adds feedback to an application step",
      "parameters": {
        "application_id": "uuid",
        "step_name": "text",
        "feedback_text": "text",
        "feedback_status": "text (default: 'pending')"
      },
      "returns": "jsonb"
    }
  }
}
```

### Form Management Functions
```json
{
  "functions": {
    "clone_form_template": {
      "description": "Creates a copy of a form template with all its steps and fields",
      "security": "SECURITY DEFINER",
      "parameters": {
        "template_id": "uuid"
      },
      "returns": "uuid",
      "actions": [
        "Clones template with '(Copy)' suffix",
        "Clones all steps with same order",
        "Clones all fields within steps",
        "Preserves all configurations and rules"
      ]
    }
  }
}
```

### Active Triggers
```json
{
  "triggers": {
    "applications": [
      {
        "name": "check_application_status_transition",
        "timing": "BEFORE UPDATE",
        "function": "validate_application_status_transition()",
        "description": "Validates status changes and transitions"
      },
      {
        "name": "trg_validate_step_completion",
        "timing": "BEFORE UPDATE",
        "function": "validate_step_completion()",
        "description": "Manages step completion and validation"
      }
    ]
  }
}
```

## Custom Types

### Role and Permission Types
```json
{
  "app_role": {
    "description": "Available user roles in the system",
    "values": [
      "admin",
      "recruiter",
      "applicant"
    ]
  },
  "app_permission": {
    "description": "Available permissions grouped by resource",
    "groups": {
      "profiles": {
        "description": "User profile management permissions",
        "values": [
          "profiles.create",
          "profiles.read_own",
          "profiles.read_all",
          "profiles.update_own",
          "profiles.update_all",
          "profiles.delete_own",
          "profiles.delete_all"
        ]
      },
      "applications": {
        "description": "Job application management permissions",
        "values": [
          "applications.create",
          "applications.read_own",
          "applications.read_all",
          "applications.update_own",
          "applications.update_all",
          "applications.delete_own",
          "applications.delete_all",
          "applications.change_status"
        ]
      },
      "jobs": {
        "description": "Job posting management permissions",
        "values": [
          "jobs.create",
          "jobs.read_own",
          "jobs.read_all",
          "jobs.update_own",
          "jobs.update_all",
          "jobs.delete_all",
          "jobs.publish"
        ]
      },
      "roles": {
        "description": "Role management permissions",
        "values": [
          "roles.create",
          "roles.read_all",
          "roles.update_all",
          "roles.delete_all"
        ]
      },
      "permissions": {
        "description": "Permission management permissions",
        "values": [
          "permissions.create",
          "permissions.read_all",
          "permissions.update_all",
          "permissions.delete_all"
        ]
      },
      "forms": {
        "description": "Form template management permissions",
        "values": [
          "forms.create",
          "forms.read_all",
          "forms.update_all",
          "forms.delete_all"
        ]
      }
    }
  }
}
```

### Status Types
```json
{
  "app_application_status": {
    "description": "Available statuses for job applications",
    "values": [
      {
        "name": "pending",
        "description": "Initial state when application is submitted"
      },
      {
        "name": "screening",
        "description": "Application is being reviewed"
      },
      {
        "name": "interview",
        "description": "Candidate is in interview process"
      },
      {
        "name": "technical_assessment",
        "description": "Candidate is taking technical assessment"
      },
      {
        "name": "offer",
        "description": "Job offer has been made"
      },
      {
        "name": "accepted",
        "description": "Offer has been accepted"
      },
      {
        "name": "rejected",
        "description": "Application has been rejected"
      },
      {
        "name": "withdrawn",
        "description": "Candidate has withdrawn application"
      }
    ]
  },
  "app_job_status": {
    "description": "Available statuses for job postings",
    "values": [
      {
        "name": "draft",
        "description": "Job is being created/edited"
      },
      {
        "name": "published",
        "description": "Job is visible to applicants"
      },
      {
        "name": "closed",
        "description": "Job is no longer accepting applications"
      },
      {
        "name": "archived",
        "description": "Job has been archived"
      }
    ]
  }
}
```

### Form Field Types
```json
{
  "form_field_type": {
    "description": "Available field types for form builder",
    "values": [
      {
        "name": "text",
        "description": "Single line text input"
      },
      {
        "name": "textarea",
        "description": "Multi-line text input"
      },
      {
        "name": "select",
        "description": "Dropdown selection"
      },
      {
        "name": "checkbox",
        "description": "Multiple choice checkboxes"
      },
      {
        "name": "radio",
        "description": "Single choice radio buttons"
      },
      {
        "name": "toggle",
        "description": "Boolean toggle switch"
      },
      {
        "name": "range",
        "description": "Numeric range slider"
      },
      {
        "name": "rating",
        "description": "Star rating input"
      },
      {
        "name": "file",
        "description": "File upload input"
      }
    ]
  }
}
```

## Views
```json
{
  "views": [
    // Paste results from the Views query here
  ]
}
```

## Extensions
```json
{
  "extensions": [
    // Paste results from the Extensions query here
  ]
}
```

## Table and Column Comments
```json
{
  "comments": [
    // Paste results from the Comments query here
  ]
}
```

## Entity Relationship Diagram
[Add your ERD diagram here if available]

## Role-Based Access Control (RBAC)

### Role Definitions

1. **Admin**
   - Full access to job management
   - Can view all applications
   - Can view all profiles
   - Can view own profile and applications

2. **Recruiter**
   - Can create and view all jobs
   - Can view all applications
   - Can view all profiles
   - Limited to read-only access for most operations

3. **Applicant**
   - Can view own profile
   - Can view own applications
   - Limited to personal data access

### Permission Matrix

| Permission             | Admin | Recruiter | Applicant |
|-----------------------|-------|-----------|-----------|
| jobs.create           | ✓     | ✓         |           |
| jobs.read_all         | ✓     | ✓         |           |
| applications.read_own | ✓     |           | ✓         |
| applications.read_all | ✓     | ✓         |           |
| profiles.read_own     | ✓     |           | ✓         |
| profiles.read_all     | ✓     | ✓         |           |

### Implementation Details

1. **Database Tables**
   - `role_permissions`: Maps roles to their assigned permissions
   - `user_roles`: Maps users to their assigned roles

2. **Default Role**
   - New users are assigned the 'applicant' role by default
   - Role changes require admin intervention

3. **Permission Checking**
   - Permissions are checked via the `authorize()` function
   - RLS policies use these permissions to enforce access control
   - Permission cache is maintained for performance

4. **SQL Implementation**
```sql
-- Clear existing role permissions
DELETE FROM role_permissions;

-- Admin permissions
INSERT INTO role_permissions (role, permission) VALUES
('admin', 'jobs.create'),
('admin', 'jobs.read_all'),
('admin', 'applications.read_own'),
('admin', 'applications.read_all'),
('admin', 'profiles.read_own'),
('admin', 'profiles.read_all');

-- Recruiter permissions
INSERT INTO role_permissions (role, permission) VALUES
('recruiter', 'jobs.create'),
('recruiter', 'jobs.read_all'),
('recruiter', 'applications.read_all'),
('recruiter', 'profiles.read_all');

-- Applicant permissions
INSERT INTO role_permissions (role, permission) VALUES
('applicant', 'applications.read_own'),
('applicant', 'profiles.read_own');
```

### Testing

1. **Test Accounts**
   - Admin: admin@example.com / Test123
   - Recruiter: recruiter@example.com / Test123
   - Applicant: applicant@example.com / Test123

2. **Permission Testing Tool**
   - Located at `/admin/test-permissions`
   - Tests all permissions for current role
   - Provides visual feedback for permission checks
   - Generates detailed test reports

3. **Expected Behavior**
   - Admins: Full access to all tested permissions
   - Recruiters: Access to job creation and viewing all data
   - Applicants: Access limited to own data only