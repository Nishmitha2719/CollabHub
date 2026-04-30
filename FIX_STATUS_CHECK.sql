-- =========================================
-- FIX: Status Check Constraint
-- =========================================
-- Run this in Supabase SQL Editor
-- 
-- Issue: Projects table has wrong status values
-- Current: 'Open', 'In Progress', 'Completed', 'Cancelled'
-- Expected: 'pending', 'approved', 'rejected'
--
-- Solution: Drop old constraint and create new one
-- =========================================

-- Step 1: Drop the old (wrong) constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Step 2: Add the correct constraint
ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Step 3: Update any existing projects to use correct status
UPDATE projects SET status = 'pending' WHERE status NOT IN ('pending', 'approved', 'rejected');

-- Step 4: Set default to 'pending'
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'pending';

-- Step 5: Verify constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'projects' AND constraint_name = 'projects_status_check';

-- Step 6: Verify data is correct
SELECT id, title, status FROM projects LIMIT 5;

-- ✅ Done! Now posting projects should work
