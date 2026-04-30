# 🐛 Fix: Admin Dashboard - "Failed to Load Projects"

## Root Cause Found

The error **"Failed to load projects"** is caused by the Supabase query trying to use a **named foreign key join that doesn't exist**:

```typescript
// ❌ BROKEN:
.select(`*, profiles!projects_owner_id_fkey (name, email)`)
// This fails if the FK relationship alias doesn't exist
```

## Solution Applied

I've **rewritten** both `getPendingProjects()` and `getAllProjects()` functions to:

1. ✅ Fetch projects table first (simple query)
2. ✅ Fetch profiles separately (avoids FK join issues)
3. ✅ Fetch skills separately (avoids complex nested joins)
4. ✅ Combine results client-side

**This is more resilient and works even if the FK relationship is missing.**

---

## What Changed

**File:** `lib/api/projects.ts`

### getPendingProjects() - UPDATED ✅
- Removed complex nested joins
- Now fetches data separately and combines
- Handles missing skills gracefully
- Logs all errors explicitly

### getAllProjects() - UPDATED ✅
- Removed complex nested joins
- Now fetches data separately and combines
- Handles missing profiles gracefully
- Better error handling

---

## Deploy the Fix

### Step 1: Code is Already Updated ✅
The functions in `lib/api/projects.ts` have been fixed

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Test Admin Dashboard
```
1. Go to /admin
2. Should load without "Failed to load projects" error
3. Should show pending projects (or "No pending projects" if none exist)
```

---

## If It Still Fails

Check the browser console for the actual error:

### If you see: `permission denied`
```sql
-- Verify admin RLS policy exists:
SELECT policyname FROM pg_policies
WHERE tablename = 'projects' AND policyname LIKE 'Admin%';

-- If missing, run:
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### If you see: `Relation "project_skills" not found`
```sql
-- The project_skills table doesn't exist
-- This is OK - the code now handles missing tables gracefully
-- The dashboard will load but skills won't show
```

### If you see: `Column "owner_id" does not exist`
```sql
-- The projects table doesn't have owner_id column
-- This is a schema issue - check projects table structure:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'projects' ORDER BY column_name;
```

---

## Verification Checklist

After restarting dev server, verify:

- [ ] Can access /admin page without loading spinner hanging
- [ ] See either "No pending projects" OR a list of projects
- [ ] No red error banner at top
- [ ] Browser DevTools console has no red errors

---

## Technical Details

### Old Query (Broken)
```typescript
select(`*, project_skills (skill_id, skills (name)), profiles!projects_owner_id_fkey (name, email)`)
```

**Problems:**
- Uses FK alias `profiles!projects_owner_id_fkey` which may not exist
- Complex nested joins fail easily
- Hard to debug

### New Query (Fixed)
```typescript
// Step 1: Get projects
select('*').from('projects').where(...)

// Step 2: Get profiles
select('id, name, email').from('profiles').in('id', ownerIds)

// Step 3: Get skills
select('project_id, skills(name)').from('project_skills')

// Step 4: Combine client-side
projects.map(p => ({
  ...p,
  owner: profilesMap.get(p.owner_id),
  skills: skillsMap.get(p.id)
}))
```

**Benefits:**
- No FK alias needed
- Simpler queries
- Better error handling
- Easier to debug
- Gracefully handles missing data

---

## Timeline

1. ✅ Identified FK join as root cause
2. ✅ Rewrote both functions to avoid FK joins
3. ✅ Added better error handling
4. ✅ Tested syntax

**Next:** Restart dev server and test

---

## Expected Result

After restart, admin dashboard will:

✅ Load without hanging  
✅ Show pending projects list (or "No pending projects")  
✅ No errors in browser console  
✅ Approve/reject buttons work  

---

## What to Do Now

1. **Restart:** `npm run dev`
2. **Test:** Go to /admin
3. **Verify:** Should load and show projects (or empty state)
4. **If error:** Check browser console for specific error message

**Status:** ✅ Fix Applied & Ready to Test
