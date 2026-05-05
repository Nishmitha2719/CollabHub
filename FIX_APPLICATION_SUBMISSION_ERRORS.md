# Fix: Application Submission Errors (400 & 409)

## Problem Summary
Users were getting console errors when submitting applications:
- **400 errors**: Failed to load resource (bad request)
- **409 errors**: Failed to load resource (conflict)

## Root Cause
Explicit timestamp fields in JavaScript were being sent to Supabase while the database schema defined DEFAULT NOW() for those columns. This caused:
1. **Type mismatches** between JavaScript ISO strings and PostgreSQL timestamps
2. **Timezone conflicts** between client timestamps and server defaults
3. **Timestamp precision issues** (milliseconds vs seconds)

## Changes Made

### 1. `lib/api/applications.ts` - applyToProject()
**Before:**
```typescript
const insertApplication = async (statusValue: string) =>
  supabase.from('applications').insert([
    {
      project_id: projectId,
      user_id: userId,
      role_id: roleId,
      message: message || '',
      status: statusValue,
      applied_at: new Date().toISOString(),  // ❌ REMOVED
    },
  ])
```

**After:**
```typescript
// ✅ Added roleId validation
if (!roleId || roleId.trim() === '') {
  return { success: false, error: 'Please select a valid role' };
}

const insertApplication = async (statusValue: string) =>
  supabase.from('applications').insert([
    {
      project_id: projectId,
      user_id: userId,
      role_id: roleId,
      message: message || '',
      status: statusValue,
      // ✅ Let database handle applied_at via DEFAULT NOW()
    },
  ])
```

**Why:** The `applied_at` column has `DEFAULT NOW()` in the schema, so PostgreSQL will set it automatically with correct timezone.

### 2. `lib/api/projectRoles.ts` - createProjectRoles()
**Before:**
```typescript
const rolesData = roles.map((role) => ({
  project_id: projectId,
  role_name: role.role_name,
  description: role.description || null,
  positions_available: role.positions_available,
  positions_filled: 0,
  created_at: new Date().toISOString(),  // ❌ REMOVED
}));
```

**After:**
```typescript
const rolesData = roles.map((role) => ({
  project_id: projectId,
  role_name: role.role_name,
  description: role.description || null,
  positions_available: role.positions_available,
  positions_filled: 0,
  // ✅ Let database handle created_at via DEFAULT NOW()
}));
```

### 3. `lib/api/applications.ts` - approveApplication() & rejectApplication()
**Removed explicit `joined_at` from project_members insert:**
```typescript
// ❌ Before
.insert([{
  project_id: projectId,
  user_id: app.user_id,
  role: role.role_name,
  joined_at: new Date().toISOString(),  // REMOVED
  status: 'Active',
}])

// ✅ After
.insert([{
  project_id: projectId,
  user_id: app.user_id,
  role: role.role_name,
  status: 'Active',
}])
```

## Key Principle
**Never explicitly set timestamp fields in Supabase inserts if they have DEFAULT NOW() in the schema.**

Let the database handle timestamps because:
- ✅ Consistent timezone handling (server-side)
- ✅ Proper timestamp precision
- ✅ Avoids type mismatch errors
- ✅ No 400/409 errors from validation conflicts

## Testing Checklist
- [ ] Submit application - should succeed without 400/409 errors
- [ ] Verify applied_at is set to current timestamp in database
- [ ] Approve application - verify reviewed_at is handled correctly
- [ ] Reject application - verify reviewed_at is handled correctly
- [ ] Check project_members have correct joined_at timestamp
- [ ] Verify all timestamps in database are server-side generated

## Note on reviewed_at
The `reviewed_at` field doesn't have a DEFAULT in the schema, so it's set explicitly only on UPDATE operations (approval/rejection). This is correct behavior - leave as is.

## Related Files
- `FIX_SCHEMA_FOR_APPLICATIONS.sql` - Database schema with DEFAULT NOW() definitions
- `components/projects/ApplyModal.tsx` - Submission trigger
- `lib/api/applications.ts` - Application management API
- `lib/api/projectRoles.ts` - Role management API
