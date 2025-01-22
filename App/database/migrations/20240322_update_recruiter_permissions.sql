-- Remove existing recruiter permissions
DELETE FROM role_permissions WHERE role = 'recruiter';

-- Add new recruiter permissions
INSERT INTO role_permissions (role, permission)
VALUES 
    -- Forms
    ('recruiter', 'forms.read_all'),
    ('recruiter', 'forms.create'),
    ('recruiter', 'forms.update_all'),
    -- Jobs
    ('recruiter', 'jobs.read_all'),
    ('recruiter', 'jobs.create'),
    ('recruiter', 'jobs.update_all'),
    ('recruiter', 'jobs.publish'),
    -- Applications
    ('recruiter', 'applications.read_all'),
    ('recruiter', 'applications.update_all'),
    ('recruiter', 'applications.change_status'),
    -- Profiles
    ('recruiter', 'profiles.read_all'); 