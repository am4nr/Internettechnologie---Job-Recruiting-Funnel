-- Create form_templates table
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add form_template_id to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS form_template_id UUID REFERENCES form_templates(id);

-- Add RLS policies for form_templates
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON form_templates
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON form_templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON form_templates
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON form_templates
    FOR DELETE USING (auth.role() = 'authenticated'); 