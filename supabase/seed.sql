-- Sample data for demonstration (replace user_id with actual user UUID after signup)

-- This is a template - you'll need to replace 'YOUR_USER_ID' with the actual UUID 
-- from auth.users after you create your first account

/*
-- Insert a sample client
INSERT INTO clients (user_id, name, email, phone, company, tags, notes)
VALUES (
  'YOUR_USER_ID',
  'Acme Corporation',
  'contact@acme.com',
  '+1-555-0100',
  'Acme Corp',
  ARRAY['design', 'web'],
  'Main client for Q1 2025'
);

-- Get the client_id from the previous insert, then create a project
INSERT INTO projects (client_id, user_id, title, description, budget, status)
VALUES (
  'CLIENT_UUID_HERE',
  'YOUR_USER_ID',
  'Website Redesign',
  'Complete overhaul of corporate website',
  15000.00,
  'active'
);

-- Create a meeting
INSERT INTO meetings (user_id, client_id, title, meeting_time, duration_minutes, reminder_minutes)
VALUES (
  'YOUR_USER_ID',
  'CLIENT_UUID_HERE',
  'Project Kickoff',
  NOW() + INTERVAL '2 hours',
  60,
  15
);
*/
