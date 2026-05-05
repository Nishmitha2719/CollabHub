# Apply to Project System - Implementation Guide

## Quick Start

### Phase 1: Database & RLS (5 minutes)

**1. Verify Tables Exist**
In your Supabase SQL Editor, check that these tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_roles', 'applications', 'project_members');
```

Should return: `project_roles`, `applications`, `project_members`

**2. Run RLS Policies**
Copy entire content of `RLS_POLICIES_APPLICATION_SYSTEM.sql` into Supabase SQL Editor and execute.

### Phase 2: Copy API Files (1 minute)
- ✅ `lib/api/applications.ts` (already created)
- ✅ `lib/api/projectRoles.ts` (already created)
- ✅ `lib/api/projectMembers.ts` (already created)

### Phase 3: Copy UI Components (1 minute)
- ✅ `components/projects/ApplyModal.tsx`
- ✅ `components/projects/ApplicationsReview.tsx`
- ✅ `components/projects/TeamRoster.tsx`

### Phase 4: Integrate into Project Detail Page (10 minutes)

---

## Integration Examples

### Example 1: Project Detail Page

**File: `app/projects/[id]/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getProjectById } from '@/lib/api/projects';
import { getProjectRoles } from '@/lib/api/projectRoles';
import ApplyModal from '@/components/projects/ApplyModal';
import ApplicationsReview from '@/components/projects/ApplicationsReview';
import TeamRoster from '@/components/projects/TeamRoster';
import Container from '@/components/ui/Container';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'team' | 'applications'>('overview');

  const isOwner = user?.id === project?.owner_id;

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    setLoading(true);
    const [projectData, rolesData] = await Promise.all([
      getProjectById(params.id),
      getProjectRoles(params.id),
    ]);
    setProject(projectData);
    setRoles(rolesData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="py-12 text-center text-gray-400">
          Project not found
        </div>
      </Container>
    );
  }

  const availableRoles = roles.filter(
    (r) => r.positions_filled < r.positions_available
  );

  return (
    <Container>
      <div className="py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-gray-400 text-lg">{project.description}</p>
          
          {/* Status badge */}
          <div className="mt-4 flex items-center gap-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {project.status}
            </span>
            <span className="text-gray-400">
              Team Size: {project.team_size || 'TBD'}
            </span>
          </div>
        </div>

        {/* Apply Button */}
        {!isOwner && availableRoles.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setIsApplyOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all"
            >
              Apply Now
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b border-white/10">
          {['overview', 'team', ...(isOwner ? ['applications'] : [])].map(
            (tabName: any) => (
              <button
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`px-4 py-2 font-medium transition-colors ${
                  tab === tabName
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div>
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Roles */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Open Positions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <h3 className="font-bold text-white">{role.role_name}</h3>
                      {role.description && (
                        <p className="text-gray-400 text-sm mt-2">
                          {role.description}
                        </p>
                      )}
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-gray-400">Positions:</span>
                        <span
                          className={
                            role.positions_filled < role.positions_available
                              ? 'text-green-400 font-bold'
                              : 'text-red-400 font-bold'
                          }
                        >
                          {role.positions_available - role.positions_filled}/
                          {role.positions_available}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Description */}
              {project.detailed_description && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    About the Project
                  </h2>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {project.detailed_description}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'team' && (
            <TeamRoster projectId={params.id} isOwner={isOwner} />
          )}

          {tab === 'applications' && isOwner && (
            <ApplicationsReview projectId={params.id} projectOwnerId={user!.id} />
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        projectId={params.id}
        roles={availableRoles}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={loadProject}
      />
    </Container>
  );
}
```

### Example 2: Browse Projects - Show Roles

**File: `app/projects/page.tsx`** (Update ProjectCard component)

```typescript
import { getProjectRoles } from '@/lib/api/projectRoles';

// Inside your ProjectCard component
const roles = await getProjectRoles(projectId);
const openSlots = roles.reduce(
  (sum, r) => sum + Math.max(0, r.positions_available - r.positions_filled),
  0
);

return (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
    {/* Existing content */}

    {/* Add roles info */}
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
        Open Positions
      </p>
      <div className="space-y-1">
        {roles.map((role) => {
          const available = role.positions_available - role.positions_filled;
          return (
            <div key={role.id} className="flex justify-between text-sm">
              <span className="text-gray-300">{role.role_name}</span>
              <span
                className={
                  available === 0
                    ? 'text-red-400 font-bold'
                    : 'text-green-400 font-bold'
                }
              >
                {available}/{role.positions_available}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
```

### Example 3: User Applications Page

**File: `app/profile/applications/page.tsx`** (New page)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getUserApplications, withdrawApplication } from '@/lib/api/applications';
import { useToast } from '@/components/ui/Toast';

export default function UserApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (user) loadApplications();
  }, [user]);

  const loadApplications = async () => {
    const apps = await getUserApplications(user!.id);
    setApplications(apps);
    setLoading(false);
  };

  const handleWithdraw = async (appId: string) => {
    const result = await withdrawApplication(appId);
    if (result.success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'Withdrawn' } : a))
      );
      addToast({ message: 'Application withdrawn', type: 'success' });
    } else {
      addToast({
        message: result.error || 'Failed to withdraw',
        type: 'error',
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Applications</h1>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            You haven&apos;t applied to any projects yet
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {app.projects?.title}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    Role: {app.project_roles?.role_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'Accepted'
                        ? 'bg-green-500/20 text-green-300'
                        : app.status === 'Rejected'
                        ? 'bg-red-500/20 text-red-300'
                        : app.status === 'Withdrawn'
                        ? 'bg-gray-500/20 text-gray-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {app.status}
                  </span>

                  {app.status === 'Pending' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {app.message && (
                <p className="text-gray-300 text-sm mt-4">
                  Your message: &quot;{app.message}&quot;
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Step-by-Step Integration

### Step 1: Add RLS Policies (~30 seconds)
```sql
-- In Supabase SQL Editor
-- Copy and run: RLS_POLICIES_APPLICATION_SYSTEM.sql
```

### Step 2: Verify API Files Exist
```bash
ls lib/api/applications.ts
ls lib/api/projectRoles.ts
ls lib/api/projectMembers.ts
```

### Step 3: Verify UI Components Exist
```bash
ls components/projects/ApplyModal.tsx
ls components/projects/ApplicationsReview.tsx
ls components/projects/TeamRoster.tsx
```

### Step 4: Copy Project Detail Example
Update your project detail page to include the components

### Step 5: Test
1. Create a test project with roles
2. Apply as different user
3. Approve application as owner
4. Verify user appears in team roster

---

## Testing Script

```typescript
// test-apply-system.ts
import { applyToProject } from '@/lib/api/applications';
import { getProjectRoles } from '@/lib/api/projectRoles';
import { getProjectApplications } from '@/lib/api/applications';

async function testApplySystem() {
  const projectId = 'YOUR_PROJECT_ID';

  // 1. Get roles
  console.log('1. Fetching roles...');
  const roles = await getProjectRoles(projectId);
  console.log(`Found ${roles.length} roles`);

  // 2. Apply to project
  if (roles.length > 0) {
    console.log('2. Applying to project...');
    const result = await applyToProject(
      projectId,
      roles[0].id,
      'I am very interested in this project!'
    );
    console.log('Apply result:', result);

    // 3. Check applications
    console.log('3. Checking applications...');
    const applications = await getProjectApplications(projectId);
    console.log(`Found ${applications.length} applications`);
  }
}

testApplySystem().catch(console.error);
```

---

## Troubleshooting

### Issue: "Permission denied" when applying
**Solution**: Check RLS policies are applied. Run verification query in RLS_POLICIES file.

### Issue: Applications table empty after applying
**Solution**: 
1. Check that `auth.uid()` is set correctly
2. Verify user is logged in
3. Check browser console for errors

### Issue: Can't approve applications
**Solution**: 
1. Verify you're the project owner
2. Check RLS policies for project_roles
3. Verify role_id is valid

### Issue: Apply button still showing when team full
**Solution**: Filter on client-side in component:
```typescript
const availableRoles = roles.filter(
  (r) => r.positions_filled < r.positions_available
);
```

---

## Next Steps

1. ✅ Apply RLS policies
2. ✅ Copy API files
3. ✅ Copy UI components
4. ✅ Integrate into project detail page
5. ✅ Test the flow
6. ✅ Deploy to production

All files are ready to use!
