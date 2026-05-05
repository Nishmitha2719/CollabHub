# ⚡ IMMEDIATE FIX: Admin Approval Not Working

## The Problem
Admin approval silently fails because RLS policy blocks admins from updating projects.

## The Fix (Do This Now!)

### Step 1: Go to Supabase
1. Open your Supabase dashboard
2. Click your project
3. Go to **SQL Editor**

### Step 2: Copy & Execute SQL
Copy this entire SQL block and paste into SQL Editor:

```sql
-- Drop all old policies
DROP POLICY IF EXISTS "Approved projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;

-- SELECT policies
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Approved projects viewable by everyone" 
  ON projects FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (owner_id = auth.uid());

-- INSERT policy
CREATE POLICY "Authenticated users can insert projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- UPDATE policies (IMPORTANT!)
CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any project" 
  ON projects FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- DELETE policies
CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can delete any project" 
  ON projects FOR DELETE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
```

Click **Execute**

### Step 3: Restart Your App
```bash
npm run build
npm run dev
```

### Step 4: Test
1. Go to `/admin`
2. Click "Approve" on any pending project
3. ✅ Should disappear from pending section
4. Go to `/projects`
5. ✅ Approved project should appear

---

## What Was Wrong
Admins could **SEE** pending projects but couldn't **UPDATE** them to approve.

## What's Fixed
Added an UPDATE policy allowing admins to change project status.

## Why It Works Now
```
Before:
Admin tries to update project → RLS says "only owner can update" → BLOCKED

After:
Admin tries to update project → RLS checks "is admin?" → YES → ALLOWED
```

---

## Full File
If you prefer to run all at once: `COMPLETE_RLS_FIX.sql`

## Need Help?
See `RLS_UPDATE_POLICY_FIX.md` for detailed explanation
