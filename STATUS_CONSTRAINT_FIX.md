# 🐛 Fix: Status Check Constraint Error

## Error
```
new row for relation "projects" violates check constraint "projects_status_check"
```

## Root Cause

Your Supabase was initialized with the **wrong schema file** (`supabase_schema.sql`).

**Wrong status values** (currently in your database):
```sql
CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled'))
```

**Correct status values** (what the code expects):
```sql
CHECK (status IN ('pending', 'approved', 'rejected'))
```

Your code tries to insert `'pending'` → **violates constraint** ❌

## Solution (2 Steps)

### Step 1: Run Fix SQL Script

```
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of: FIX_STATUS_CHECK.sql
4. Click "Run"
5. Wait for success
```

### Step 2: Restart Dev Server

```bash
npm run dev
```

Then test: Try posting a project again

## What the Fix Does

1. ✅ Drops the old (wrong) constraint
2. ✅ Creates new constraint with correct values
3. ✅ Updates any existing projects to valid status
4. ✅ Verifies everything is correct

## After Fix

Posting projects will work! Status values allowed:
- ✅ `pending` - When user first submits
- ✅ `approved` - When admin approves it
- ✅ `rejected` - When admin rejects it

## Files

- **FIX_STATUS_CHECK.sql** - Run this to fix the constraint
- **supabase_collabhub_schema.sql** - Reference for correct schema
- **supabase_schema.sql** - Old (wrong) schema that was applied

## Testing

After running the fix:

1. Navigate to `/post-project`
2. Fill in project details
3. Click "Post Project"
4. ✅ Should see success message
5. ✅ Project inserted with status='pending'
6. ✅ Admin sees it in dashboard

---

**Time to fix:** 2 minutes  
**Impact:** Critical - blocks all project submissions
