# Handle Duplicate Application Errors & Re-Application Logic

## Problem Statement
Previously, users would get **409 Conflict** errors when trying to re-apply to a project because:
1. Database has UNIQUE constraint on `(project_id, user_id)`
2. Code was only checking for `pending` or `accepted` status
3. If status was `rejected` or `withdrawn`, insert would fail with 409

## Solution Implemented

### 1. Application Status States
```
┌─────────────┬────────────────────────────────────────┐
│   Status    │           Allowed Action               │
├─────────────┼────────────────────────────────────────┤
│ pending     │ ❌ Cannot apply again                  │
│ accepted    │ ❌ Cannot apply again (already member) │
│ rejected    │ ✅ Can re-apply (update existing row)  │
│ withdrawn   │ ✅ Can re-apply (update existing row)  │
└─────────────┴────────────────────────────────────────┘
```

### 2. Updated Flow in `lib/api/applications.ts`

#### Check for Existing Application
```typescript
// ✅ Query for ANY existing application regardless of status
const { data: existing, error: checkError } = await supabase
  .from('applications')
  .select('*')
  .eq('project_id', projectId)
  .eq('user_id', userId)
  .maybeSingle();
```

#### Handle Based on Status
```typescript
if (existing) {
  // Block if currently active
  if (existing.status === 'pending' || existing.status === 'accepted') {
    return {
      success: false,
      error: 'You have already applied to this project. Please wait for a decision.',
    };
  }

  // Allow re-application if previously rejected
  if (existing.status === 'rejected' || existing.status === 'withdrawn') {
    const { data: updatedApp } = await supabase
      .from('applications')
      .update({
        role_id: roleId,
        message: message || '',
        status: 'pending',  // Reset to pending
      })
      .eq('id', existing.id)
      .select()
      .maybeSingle();

    return { success: true, data: updatedApp };
  }
}

// If no existing record, insert normally
const { data, error } = await supabase
  .from('applications')
  .insert([{ project_id, user_id, role_id, message, status: 'pending' }])
  .select()
  .maybeSingle();
```

### 3. User Experience

#### Scenario A: User Already Applied (Status: Pending)
```
User Click "Apply" → API Check → Status is "pending"
↓
Return Error Message:
"You have already applied to this project. Please wait for a decision."
↓
Toast Shows Error → Modal Closes → User Sees Message
```

#### Scenario B: User Re-Applying After Rejection
```
User Click "Apply" (after rejected) → API Check → Status is "rejected"
↓
Update Existing Row → Reset to "pending" → Update role_id & message
↓
Return Success → Toast Shows "Application submitted successfully!"
↓
Modal Closes → User Can See New Application in List
```

#### Scenario C: User Never Applied Before
```
User Click "Apply" → API Check → No Record Found
↓
Insert New Row → Set status to "pending"
↓
Return Success → Toast Shows "Application submitted successfully!"
```

### 4. Database Constraints Preserved
```sql
-- ✅ Still have UNIQUE constraint - prevents duplicates
ALTER TABLE applications 
ADD CONSTRAINT unique_user_project UNIQUE (user_id, project_id);

-- This means:
-- - Cannot have 2 rows with same (user_id, project_id)
-- - BUT we can update existing row
-- - Code handles this by checking then updating/inserting
```

### 5. Error Handling in UI

**ApplyModal.tsx** already has proper loading & error handling:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  setLoading(true);  // ✅ Disable button

  const result = await applyToProject(projectId, selectedRole, message);

  if (result.success) {
    addToast({
      message: 'Application submitted successfully!',
      type: 'success',
    });
    onClose();
    onSuccess?.();
  } else {
    addToast({
      message: result.error,  // ✅ Shows specific error
      type: 'error',
    });
  }

  setLoading(false);  // ✅ Re-enable button
};
```

**Submit button disabled while loading:**
```tsx
<button
  type="submit"
  disabled={loading || !selectedRole || availableRoles.length === 0}
  className="..."
>
  {loading ? 'Submitting...' : 'Submit Application'}
</button>
```

### 6. Messages Shown to User

| Scenario | Toast Message |
|----------|---------------|
| First apply | ✅ "Application submitted successfully!" |
| Already pending | ❌ "You have already applied to this project. Please wait for a decision." |
| Re-apply after reject | ✅ "Application submitted successfully!" |
| Role not found | ❌ "Role not found" |
| Team full | ❌ "Sorry, the team is full" |
| No role selected | ❌ "Please select a role" |

## Implementation Details

### Files Modified
1. **lib/api/applications.ts** - `applyToProject()`
   - ✅ Check ANY existing application
   - ✅ Logic for pending/accepted (block)
   - ✅ Logic for rejected/withdrawn (update)
   - ✅ Insert only if no existing record

2. **lib/api/projects.ts** - `applyToProject()` (legacy)
   - ✅ Updated for backwards compatibility
   - ⚠️ Marked as @deprecated
   - ✅ Same duplicate/re-apply handling

3. **components/projects/ApplyModal.tsx**
   - ✅ Already had proper loading states
   - ✅ Already had error toast display
   - ✅ No changes needed

## Testing Checklist

### Test 1: Initial Application
- [ ] User without any application
- [ ] Click "Apply"
- [ ] Select role and message
- [ ] Submit
- Expected: ✅ Success toast, application created

### Test 2: Prevent Duplicate (Pending)
- [ ] User with pending application
- [ ] Click "Apply" again
- [ ] Submit
- Expected: ❌ Error toast: "already applied"

### Test 3: Prevent Duplicate (Accepted)
- [ ] User with accepted application
- [ ] Click "Apply" again
- [ ] Submit
- Expected: ❌ Error toast: "already applied"

### Test 4: Re-Apply After Rejection
- [ ] User with rejected application
- [ ] Click "Apply" again
- [ ] Change role or message
- [ ] Submit
- Expected: ✅ Success toast, application updated

### Test 5: Re-Apply After Withdrawal
- [ ] User with withdrawn application
- [ ] Click "Apply" again
- [ ] Submit
- Expected: ✅ Success toast, application updated

### Test 6: Database Constraints
- [ ] Check database still has UNIQUE constraint
- [ ] Verify only one row per (user_id, project_id)
- [ ] Verify status changes when re-applying

### Test 7: Role Validation
- [ ] Select invalid/empty role
- [ ] Submit
- Expected: ❌ Error toast: "Please select a role"

### Test 8: Team Full
- [ ] Apply to project with full team
- [ ] Submit
- Expected: ❌ Error toast: "team is full"

## Database Schema Validation

Verify the UNIQUE constraint exists:
```sql
SELECT constraint_name, constraint_type, column_name
FROM information_schema.table_constraints
WHERE table_name = 'applications'
AND constraint_type = 'UNIQUE';

-- Should show:
-- | unique_user_project | UNIQUE | (project_id, user_id) |
```

## Backwards Compatibility

### Old Function Signature (deprecated)
```typescript
// Old: lib/api/projects.ts
applyToProject(userId, projectId, message?)
```

### New Function Signature
```typescript
// New: lib/api/applications.ts
applyToProject(projectId, roleId, message)
```

**Migration Path:**
- ApplyModal ✅ Already uses new signature
- Legacy code can still use old signature
- Both handle duplicates & re-applications correctly

## Error Codes

### Supabase Error Handling
| Error Code | Meaning | Solution |
|-----------|---------|----------|
| 23505 | UNIQUE violation | Handled by application logic |
| 23514 | CHECK violation | Handled by status validation |
| PGRST116 | No rows returned | Ignored (expected) |
| Other | Unexpected errors | Logged & returned as user message |

## Future Improvements

1. Add analytics to track re-applications
2. Notify project owner of re-applications
3. Allow user to cancel pending application
4. Show "re-apply" button on rejected applications
5. Add application history timeline

## Related Files
- `components/projects/ApplyModal.tsx` - UI component
- `lib/api/applications.ts` - Application API (new system)
- `lib/api/projects.ts` - Project API (legacy)
- `lib/api/projectRoles.ts` - Role management
- `FIX_SCHEMA_FOR_APPLICATIONS.sql` - Database schema
- `FIX_APPLICATION_SUBMISSION_ERRORS.md` - Timestamp fix
